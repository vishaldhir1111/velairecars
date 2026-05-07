import crypto from "node:crypto";
import { RESERVATION_FEE, fleetData, requireVehicle } from "./fleet-data.js";
import {
  sendBookingCreatedNotifications,
  sendBookingStatusUpdateNotifications,
  sendDepositPaidNotifications,
  sendManualBookingCommunication,
  sendPaymentPendingNotifications,
} from "./notifications.js";

const operationsKey = "velaire:operations:v1";
const memoryState = (globalThis.__VELAIRE_OPERATIONS_STORE__ ||= null);

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function kvConfig({ readOnly = false } = {}) {
  const url = process.env.KV_REST_API_URL || "";
  const token = readOnly
    ? process.env.KV_REST_API_READ_ONLY_TOKEN || process.env.KV_REST_API_TOKEN || ""
    : process.env.KV_REST_API_TOKEN || "";
  const linkedRedisUrl = process.env.REDIS_URL || "";
  const linkedKvUrl = process.env.KV_URL || "";
  return { url: url.replace(/\/$/, ""), token, linkedRedisUrl, linkedKvUrl };
}

function storageAvailable({ readOnly = false } = {}) {
  const { url, token } = kvConfig({ readOnly });
  return Boolean(url && token);
}

function persistenceRequired() {
  return process.env.VELAIRE_ALLOW_MEMORY_FALLBACK !== "true" && (process.env.VERCEL || process.env.NODE_ENV === "production");
}

function persistenceError(reason = "kv_rest_not_configured") {
  const error = new Error("Operations storage is not available. Please try again shortly.");
  error.status = 503;
  error.code = "operations_storage_unavailable";
  error.publicMessage = "Secure booking storage is temporarily unavailable. Please try again shortly.";
  error.reason = reason;
  return error;
}

async function kvCommand(command, args = [], { readOnly = false } = {}) {
  const { url, token } = kvConfig({ readOnly });
  if (!url || !token) {
    const error = new Error("Vercel KV REST is not configured.");
    error.status = 503;
    throw error;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command, ...args]),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Vercel KV request failed.");
    error.status = response.status;
    throw error;
  }
  return payload.result;
}

function seedVehicleOperations() {
  return fleetData.map((vehicle) => ({
    slug: vehicle.slug,
    rate: vehicle.rate,
    deposit: vehicle.deposit,
    availabilityStatus: vehicle.availability?.status || "request-to-confirm",
    blockedRanges: vehicle.availability?.blockedRanges || [],
    updatedAt: now(),
  }));
}

function baseState() {
  return {
    version: 1,
    vehicleOperations: seedVehicleOperations(),
    bookings: [],
    payments: [],
    customers: [],
    leads: [],
    notifications: [],
    auditLog: [],
    updatedAt: now(),
  };
}

function normaliseState(raw = null) {
  const fallback = baseState();
  const state = raw && typeof raw === "object" ? raw : {};
  const vehicleOperationMap = new Map();
  for (const record of [...fallback.vehicleOperations, ...(state.vehicleOperations || [])]) {
    if (!record?.slug) continue;
    vehicleOperationMap.set(record.slug, {
      ...(vehicleOperationMap.get(record.slug) || {}),
      ...record,
      rate: Number(record.rate || 0),
      deposit: Number(record.deposit || 0),
      blockedRanges: Array.isArray(record.blockedRanges) ? record.blockedRanges : [],
      availabilityStatus: record.availabilityStatus || record.status || "request-to-confirm",
    });
  }
  return {
    ...fallback,
    ...state,
    vehicleOperations: [...vehicleOperationMap.values()],
    bookings: Array.isArray(state.bookings) ? state.bookings.map(normaliseBookingRecord) : [],
    payments: Array.isArray(state.payments) ? state.payments : [],
    customers: Array.isArray(state.customers) ? state.customers : [],
    leads: Array.isArray(state.leads) ? state.leads : [],
    notifications: Array.isArray(state.notifications) ? state.notifications : [],
    auditLog: Array.isArray(state.auditLog) ? state.auditLog.map(publicAuditEvent) : [],
    updatedAt: state.updatedAt || fallback.updatedAt,
  };
}

async function readPersistedState() {
  if (!storageAvailable({ readOnly: true })) return null;
  const value = await kvCommand("GET", [operationsKey], { readOnly: true });
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function writePersistedState(state) {
  if (!storageAvailable()) return { saved: false, source: "memory", reason: "kv_rest_not_configured" };
  await kvCommand("SET", [operationsKey, JSON.stringify(state)]);
  return { saved: true, source: "vercel-kv", key: operationsKey };
}

export async function loadOperationsState() {
  try {
    const persisted = await readPersistedState();
    if (persisted) {
      const normalised = normaliseState(persisted);
      const config = kvConfig({ readOnly: true });
      globalThis.__VELAIRE_OPERATIONS_STORE__ = normalised;
      return {
        ...normalised,
        meta: {
          available: true,
          source: "vercel-kv",
          key: operationsKey,
          linkedStorage: Boolean(config.linkedRedisUrl || config.linkedKvUrl),
        },
      };
    }
  } catch (error) {
    // Fall through to memory so the site stays usable if KV is briefly unavailable.
  }

  const normalised = normaliseState(globalThis.__VELAIRE_OPERATIONS_STORE__ || memoryState || null);
  const config = kvConfig({ readOnly: true });
  globalThis.__VELAIRE_OPERATIONS_STORE__ = normalised;
  return {
    ...normalised,
    meta: {
      available: false,
      source: "memory",
      key: operationsKey,
      linkedStorage: Boolean(config.linkedRedisUrl || config.linkedKvUrl),
      reason: storageAvailable({ readOnly: true }) ? "kv_read_failed" : "kv_rest_not_configured",
    },
  };
}

export async function saveOperationsState(nextState) {
  const state = normaliseState({
    ...nextState,
    updatedAt: now(),
  });
  const persistence = await writePersistedState(state);
  if (persistenceRequired() && !persistence.saved) {
    throw persistenceError(persistence.reason);
  }
  globalThis.__VELAIRE_OPERATIONS_STORE__ = state;
  return { state, persistence };
}

export async function mutateOperations(mutator) {
  const current = await loadOperationsState();
  const draft = normaliseState(current);
  const result = await mutator(draft);
  const { state, persistence } = await saveOperationsState(draft);
  return { state, persistence, result };
}

function vehicleOperations(state, slug) {
  const vehicle = requireVehicle(slug);
  let record = state.vehicleOperations.find((item) => item.slug === vehicle.slug);
  if (!record) {
    record = {
      slug: vehicle.slug,
      rate: vehicle.rate,
      deposit: vehicle.deposit,
      availabilityStatus: vehicle.availability?.status || "request-to-confirm",
      blockedRanges: vehicle.availability?.blockedRanges || [],
      updatedAt: now(),
    };
    state.vehicleOperations.push(record);
  }
  return record;
}

function publicVehicleForTotals(vehicle = {}) {
  return {
    slug: vehicle.slug || "",
    name: vehicle.name || "",
    year: vehicle.year || "",
    category: vehicle.category || "",
    finish: vehicle.finish || "",
    paint: vehicle.paint || "",
    interior: vehicle.interior || "",
    rate: Number(vehicle.rate || 0),
    deposit: Number(vehicle.deposit || 0),
  };
}

function publicTotals(totals = {}) {
  const vehicle = totals.vehicle ? publicVehicleForTotals(totals.vehicle) : null;
  return {
    days: Number(totals.days || 0),
    hireEstimate: Number(totals.hireEstimate || 0),
    reservationFee: Number(totals.reservationFee || RESERVATION_FEE),
    deposit: Number(totals.deposit || 0),
    depositDueLater: Number(totals.depositDueLater || totals.deposit || 0),
    balanceDueLater: Number(totals.balanceDueLater || totals.hireEstimate || 0),
    currency: totals.currency || "GBP",
    ...(vehicle?.slug ? { vehicle } : {}),
  };
}

function normaliseOperationsChecklist(checklist = {}) {
  return {
    licenceChecked: Boolean(checklist.licenceChecked),
    insuranceChecked: Boolean(checklist.insuranceChecked),
    depositConfirmed: Boolean(checklist.depositConfirmed),
    rentalPaid: Boolean(checklist.rentalPaid),
    vehiclePrepared: Boolean(checklist.vehiclePrepared),
    customerContacted: Boolean(checklist.customerContacted),
    handoverCompleted: Boolean(checklist.handoverCompleted),
  };
}

function normaliseBookingRecord(booking = {}) {
  return {
    ...booking,
    totals: publicTotals(booking.totals || {}),
    timeline: Array.isArray(booking.timeline) ? booking.timeline : [],
    operationsChecklist: normaliseOperationsChecklist(booking.operationsChecklist || {}),
  };
}

function publicBooking(booking = {}) {
  const safeBooking = normaliseBookingRecord(booking);
  return {
    id: safeBooking.id,
    reference: safeBooking.reference,
    userId: safeBooking.userId || null,
    customerName: safeBooking.customerName || "",
    customerEmail: safeBooking.customerEmail || "",
    customerPhone: safeBooking.customerPhone || "",
    vehicleSlug: safeBooking.vehicleSlug,
    vehicleName: safeBooking.vehicleName,
    status: safeBooking.status || "draft",
    paymentStatus: safeBooking.paymentStatus || "not_started",
    followUpStatus: safeBooking.followUpStatus || "new",
    internalNotes: safeBooking.internalNotes || "",
    operationsChecklist: safeBooking.operationsChecklist,
    paymentIntentId: safeBooking.paymentIntentId || "",
    pickup: safeBooking.pickup || "",
    pickupTime: safeBooking.pickupTime || "",
    return: safeBooking.return || "",
    returnTime: safeBooking.returnTime || "",
    location: safeBooking.location || "",
    placeId: safeBooking.placeId || "",
    lat: safeBooking.lat || "",
    lng: safeBooking.lng || "",
    handoverNotes: safeBooking.handoverNotes || "",
    billingAddress1: safeBooking.billingAddress1 || "",
    billingAddress2: safeBooking.billingAddress2 || "",
    billingTown: safeBooking.billingTown || "",
    billingCity: safeBooking.billingCity || "",
    billingPostcode: safeBooking.billingPostcode || "",
    billingCountry: safeBooking.billingCountry || "",
    totals: safeBooking.totals,
    timeline: safeBooking.timeline,
    createdAt: safeBooking.createdAt,
    updatedAt: safeBooking.updatedAt,
  };
}

function publicPayment(payment = {}) {
  return {
    id: payment.id,
    bookingId: payment.bookingId || "",
    bookingReference: payment.bookingReference || "",
    vehicleSlug: payment.vehicleSlug || "",
    vehicleName: payment.vehicleName || "",
    customerName: payment.customerName || "",
    customerEmail: payment.customerEmail || "",
    amount: Number(payment.amount || 0),
    currency: payment.currency || "GBP",
    status: payment.status || "payment_pending",
    provider: payment.provider || "manual_deposit_record",
    purpose: payment.purpose || "reservation_fee",
    providerReference: payment.providerReference || "",
    stripePaymentIntentId: payment.stripePaymentIntentId || "",
    stripeCustomerId: payment.stripeCustomerId || "",
    stripePaymentStatus: payment.stripePaymentStatus || "",
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt || payment.createdAt,
  };
}

function publicNotification(notification = {}) {
  return {
    id: notification.id,
    type: notification.type || "notification",
    audience: notification.audience || "customer",
    recipient: notification.recipient || "",
    subject: notification.subject || "",
    status: notification.status || "queued",
    provider: notification.provider || "resend",
    providerId: notification.providerId || "",
    reason: notification.reason || "",
    bookingId: notification.bookingId || "",
    bookingReference: notification.bookingReference || "",
    paymentId: notification.paymentId || "",
    createdAt: notification.createdAt || now(),
  };
}

function publicAuditEvent(event = {}) {
  return {
    id: event.id || id("aud"),
    type: event.type || "operations_update",
    label: event.label || "Operations update",
    actor: event.actor || "Operations",
    entityType: event.entityType || "",
    entityId: event.entityId || "",
    reference: event.reference || "",
    details: event.details || "",
    createdAt: event.createdAt || now(),
  };
}

function addAuditEvent(state, event = {}) {
  state.auditLog = [
    publicAuditEvent({
      ...event,
      id: event.id || id("aud"),
      createdAt: event.createdAt || now(),
    }),
    ...(Array.isArray(state.auditLog) ? state.auditLog : []),
  ].slice(0, 250);
}

function customerRecordsFromBookings(bookings = []) {
  const map = new Map();
  for (const booking of bookings) {
    const email = String(booking.customerEmail || "").trim().toLowerCase();
    if (!email) continue;
    const current = map.get(email) || {
      id: `customer_${email}`,
      fullName: booking.customerName || "",
      email,
      phone: booking.customerPhone || "",
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      hireValue: 0,
      lastVehicle: "",
      lastStatus: "",
      createdAt: booking.createdAt || now(),
      updatedAt: booking.updatedAt || now(),
    };
    current.fullName = booking.customerName || current.fullName;
    current.phone = booking.customerPhone || current.phone;
    current.totalBookings += 1;
    current.upcomingBookings += ["cancelled", "completed", "rejected"].includes(booking.status) ? 0 : 1;
    current.completedBookings += booking.status === "completed" ? 1 : 0;
    current.hireValue += Number(booking.totals?.hireEstimate || 0);
    current.lastVehicle = booking.vehicleName || current.lastVehicle;
    current.lastStatus = booking.status || current.lastStatus;
    current.updatedAt = booking.updatedAt || current.updatedAt;
    map.set(email, current);
  }
  return [...map.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function dateOnly(value) {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function normaliseRange(startValue, endValue) {
  const start = dateOnly(startValue);
  let end = dateOnly(endValue);
  if (!start) return null;
  if (!end || end <= start) end = addDays(start, 1);
  return {
    start,
    end,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function rangesOverlap(first, second) {
  if (!first || !second) return false;
  return first.start < second.end && second.start < first.end;
}

function bookingRange(booking) {
  return normaliseRange(booking.pickup, booking.return);
}

function isBlockingStatus(status = "") {
  return ["draft", "pending", "payment_review", "payment_intent_created", "payment_pending", "confirmed"].includes(String(status || "").toLowerCase());
}

function shouldNotifyBookingStatus(status = "") {
  return ["confirmed", "cancelled", "completed", "rejected"].includes(String(status || "").toLowerCase());
}

function calculateDays(pickup, returnDate, days) {
  if (Number.isFinite(Number(days)) && Number(days) > 0) return Math.max(Number(days), 1);
  const start = dateOnly(pickup);
  const end = dateOnly(returnDate);
  if (!start || !end) return 2;
  return Math.max(Math.ceil((end - start) / 86400000), 1);
}

function referenceFor(state, slug) {
  const codes = {
    "tesla-model-3-performance": "TM3P",
    "lamborghini-urus": "URUS",
    "range-rover-sport-svr": "SVR",
    "bmw-m440i-convertible": "M440",
    "bmw-m140i-shadow-edition": "M140",
  };
  return `VEL-${codes[slug] || slug.split("-")[0].toUpperCase()}-${String((state.bookings || []).length + 1087).padStart(4, "0")}`;
}

export function operationalVehicleFromState(state, slug) {
  const vehicle = requireVehicle(slug);
  const operations = vehicleOperations(state, vehicle.slug);
  return {
    ...vehicle,
    rate: Number(operations.rate || vehicle.rate),
    deposit: Number(operations.deposit || vehicle.deposit),
    availability: {
      ...vehicle.availability,
      status: operations.availabilityStatus || vehicle.availability?.status || "request-to-confirm",
      blockedRanges: operations.blockedRanges || [],
      pendingBookings: (state.bookings || []).filter(
        (booking) => booking.vehicleSlug === vehicle.slug && isBlockingStatus(booking.status) && booking.status !== "confirmed",
      ),
      confirmedBookings: (state.bookings || []).filter(
        (booking) => booking.vehicleSlug === vehicle.slug && booking.status === "confirmed",
      ),
      preventDoubleBooking: true,
    },
    operations: {
      ...operations,
      rate: Number(operations.rate || vehicle.rate),
      deposit: Number(operations.deposit || vehicle.deposit),
    },
  };
}

export function listOperationalVehiclesFromState(state) {
  return fleetData.map((vehicle) => operationalVehicleFromState(state, vehicle.slug));
}

export function totalsForReservation(state, reservation = {}) {
  const vehicle = operationalVehicleFromState(state, reservation.vehicle);
  const days = calculateDays(reservation.pickup, reservation.return, reservation.days);
  return {
    vehicle: publicVehicleForTotals(vehicle),
    days,
    hireEstimate: vehicle.rate * days,
    deposit: vehicle.deposit,
    currency: "GBP",
  };
}

export function checkAvailabilityFromState(state, { vehicleSlug, pickup, returnDate, excludeBookingId = "" } = {}) {
  const vehicle = operationalVehicleFromState(state, vehicleSlug);
  const requestedRange = normaliseRange(pickup, returnDate);
  const conflicts = [];

  if (!requestedRange) {
    return {
      vehicle,
      available: true,
      status: "dates_required",
      conflicts,
      message: "Choose pickup and return dates to run a live availability check.",
    };
  }

  for (const block of vehicle.availability.blockedRanges || []) {
    if (rangesOverlap(requestedRange, normaliseRange(block.start, block.end))) {
      conflicts.push({ type: "blocked_date", ...block });
    }
  }

  for (const booking of state.bookings || []) {
    if (booking.id === excludeBookingId || booking.vehicleSlug !== vehicle.slug || !isBlockingStatus(booking.status)) continue;
    if (rangesOverlap(requestedRange, bookingRange(booking))) {
      conflicts.push({
        type: booking.status === "confirmed" ? "confirmed_booking" : "pending_booking",
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        start: booking.pickup,
        end: booking.return,
      });
    }
  }

  const available = conflicts.length === 0 && vehicle.availability.status !== "offline";
  return {
    vehicle,
    available,
    status: available ? "available_request_to_confirm" : "unavailable",
    requestedRange: { start: requestedRange.startDate, end: requestedRange.endDate },
    conflicts,
    message: available
      ? `${vehicle.name} is clear for those dates. Velaire will still confirm driver checks and handover timing.`
      : `${vehicle.name} is already blocked or reserved for those dates. Choose another vehicle or adjust the handover window.`,
  };
}

function syncCustomers(state) {
  state.customers = customerRecordsFromBookings(state.bookings || []);
}

async function recordNotificationEvents(events = []) {
  const cleanEvents = events
    .flat()
    .filter(Boolean)
    .map((event) =>
      publicNotification({
        id: event.id || id("ntf"),
        ...event,
        createdAt: event.createdAt || now(),
      }),
    );
  if (!cleanEvents.length) return [];
  await mutateOperations((draft) => {
    draft.notifications = [...cleanEvents, ...(draft.notifications || [])].slice(0, 120);
    return cleanEvents;
  });
  return cleanEvents;
}

async function dispatchNotifications(sender) {
  try {
    const events = await sender();
    return await recordNotificationEvents(events);
  } catch (error) {
    return await recordNotificationEvents([
      {
        type: "notification_error",
        audience: "operations",
        status: "failed",
        provider: "resend",
        reason: error.message || "Notification dispatch failed.",
        createdAt: now(),
      },
    ]);
  }
}

export async function listOperationalVehicles() {
  const state = await loadOperationsState();
  return {
    vehicles: listOperationalVehiclesFromState(state),
    meta: state.meta,
  };
}

export async function checkPersistedAvailability(params) {
  const state = await loadOperationsState();
  return {
    availability: checkAvailabilityFromState(state, params),
    meta: state.meta,
  };
}

export async function createBookingRecord({ userId = null, reservation = {}, status = "draft" } = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const totals = totalsForReservation(draft, reservation);
    const vehicle = totals.vehicle;
    const availability = checkAvailabilityFromState(draft, {
      vehicleSlug: vehicle.slug,
      pickup: reservation.pickup,
      returnDate: reservation.return,
    });
    if (!availability.available) {
      const error = new Error(availability.message);
      error.status = 409;
      error.publicMessage = availability.message;
      throw error;
    }
    const booking = {
      id: id("bok"),
      reference: referenceFor(draft, vehicle.slug),
      userId,
      customerName: reservation.name || reservation.fullName || "",
      customerEmail: reservation.email || "",
      customerPhone: reservation.phone || "",
      vehicleSlug: vehicle.slug,
      vehicleName: `${vehicle.name} ${vehicle.year}`,
      status,
      paymentStatus: "not_started",
      followUpStatus: "new",
      internalNotes: "",
      operationsChecklist: normaliseOperationsChecklist(),
      pickup: reservation.pickup || "",
      pickupTime: reservation.pickupTime || "",
      return: reservation.return || "",
      returnTime: reservation.returnTime || "",
      location: reservation.formattedAddress || reservation.location || "",
      placeId: reservation.placeId || "",
      lat: reservation.lat || "",
      lng: reservation.lng || "",
      handoverNotes: reservation.handoverNotes || "",
      billingAddress1: reservation.billingAddress1 || "",
      billingAddress2: reservation.billingAddress2 || "",
      billingTown: reservation.billingTown || "",
      billingCity: reservation.billingCity || "",
      billingPostcode: reservation.billingPostcode || "",
      billingCountry: reservation.billingCountry || "",
      totals,
      timeline: [{ label: "Reservation created", at: now() }],
      createdAt: now(),
      updatedAt: now(),
    };
    draft.bookings.push(booking);
    addAuditEvent(draft, {
      type: "booking_created",
      label: "Booking created",
      actor: "Customer",
      entityType: "booking",
      entityId: booking.id,
      reference: booking.reference,
      details: `${booking.customerName || "Guest client"} reserved ${booking.vehicleName}.`,
    });
    syncCustomers(draft);
    return publicBooking(booking);
  });
  const notifications = await dispatchNotifications(() => sendBookingCreatedNotifications({ booking: result }));
  return { booking: result, state, persistence, notifications };
}

export async function updateBookingRecord(idValue, patch = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const booking = draft.bookings.find((item) => item.id === idValue);
    if (!booking) return null;
    const { reservation, auditActor = "Operations", auditLabel = "", ...bookingPatch } = patch;
    const before = {
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      followUpStatus: booking.followUpStatus,
    };
    if (reservation) {
      const totals = totalsForReservation(draft, {
        ...reservation,
        vehicle: reservation.vehicle || booking.vehicleSlug,
        pickup: reservation.pickup || booking.pickup,
        return: reservation.return || booking.return,
      });
      const availability = checkAvailabilityFromState(draft, {
        vehicleSlug: totals.vehicle.slug,
        pickup: reservation.pickup || booking.pickup,
        returnDate: reservation.return || booking.return,
        excludeBookingId: booking.id,
      });
      if (!availability.available) {
        const error = new Error(availability.message);
        error.status = 409;
        error.publicMessage = availability.message;
        throw error;
      }
      Object.assign(booking, {
        customerName: reservation.name || reservation.fullName || booking.customerName || "",
        customerEmail: reservation.email || booking.customerEmail || "",
        customerPhone: reservation.phone || booking.customerPhone || "",
        vehicleSlug: totals.vehicle.slug,
        vehicleName: `${totals.vehicle.name} ${totals.vehicle.year}`,
        pickup: reservation.pickup ?? booking.pickup,
        pickupTime: reservation.pickupTime ?? booking.pickupTime,
        return: reservation.return ?? booking.return,
        returnTime: reservation.returnTime ?? booking.returnTime,
        location: reservation.formattedAddress || reservation.location || booking.location,
        placeId: reservation.placeId ?? booking.placeId,
        lat: reservation.lat ?? booking.lat,
        lng: reservation.lng ?? booking.lng,
        handoverNotes: reservation.handoverNotes ?? booking.handoverNotes,
        billingAddress1: reservation.billingAddress1 ?? booking.billingAddress1,
        billingAddress2: reservation.billingAddress2 ?? booking.billingAddress2,
        billingTown: reservation.billingTown ?? booking.billingTown,
        billingCity: reservation.billingCity ?? booking.billingCity,
        billingPostcode: reservation.billingPostcode ?? booking.billingPostcode,
        billingCountry: reservation.billingCountry ?? booking.billingCountry,
        totals,
      });
    }
    if (bookingPatch.operationsChecklist) {
      bookingPatch.operationsChecklist = normaliseOperationsChecklist({
        ...(booking.operationsChecklist || {}),
        ...bookingPatch.operationsChecklist,
      });
    }
    const paymentStatusChanged = Object.prototype.hasOwnProperty.call(bookingPatch, "paymentStatus");
    Object.assign(booking, bookingPatch, { updatedAt: now() });
    if (paymentStatusChanged) {
      const payment = draft.payments.find((item) => item.bookingId === booking.id || item.id === booking.paymentIntentId);
      if (payment) {
        payment.status = bookingPatch.paymentStatus || payment.status;
        payment.updatedAt = now();
      }
    }
    const updateLabel = bookingPatch.status
      ? `Status changed to ${bookingPatch.status}`
      : paymentStatusChanged
        ? `Payment status changed to ${bookingPatch.paymentStatus}`
      : bookingPatch.followUpStatus
        ? `Follow-up changed to ${bookingPatch.followUpStatus}`
        : Object.prototype.hasOwnProperty.call(bookingPatch, "operationsChecklist")
          ? "Handover checklist updated"
        : Object.prototype.hasOwnProperty.call(bookingPatch, "internalNotes")
          ? "Internal notes updated"
          : "Booking updated";
    booking.timeline = [...(booking.timeline || []), { label: updateLabel, at: now() }];
    addAuditEvent(draft, {
      type: bookingPatch.status
        ? "booking_status_updated"
        : paymentStatusChanged
          ? "payment_status_updated"
          : Object.prototype.hasOwnProperty.call(bookingPatch, "operationsChecklist")
            ? "handover_checklist_updated"
            : "booking_updated",
      label: auditLabel || updateLabel,
      actor: auditActor,
      entityType: "booking",
      entityId: booking.id,
      reference: booking.reference,
      details: [
        before.status !== booking.status ? `Booking ${before.status || "unset"} to ${booking.status || "unset"}` : "",
        before.paymentStatus !== booking.paymentStatus ? `Payment ${before.paymentStatus || "unset"} to ${booking.paymentStatus || "unset"}` : "",
        before.followUpStatus !== booking.followUpStatus ? `Follow-up ${before.followUpStatus || "unset"} to ${booking.followUpStatus || "unset"}` : "",
        Object.prototype.hasOwnProperty.call(bookingPatch, "operationsChecklist") ? "Staff handover checklist changed" : "",
        Object.prototype.hasOwnProperty.call(bookingPatch, "internalNotes") ? "Internal notes changed" : "",
      ]
        .filter(Boolean)
        .join(" · ") || `${booking.reference || booking.id} updated.`,
    });
    syncCustomers(draft);
    return publicBooking(booking);
  });
  const nextStatus = patch?.status || patch?.bookingStatus || "";
  const notifications =
    result && shouldNotifyBookingStatus(nextStatus)
      ? await dispatchNotifications(() => sendBookingStatusUpdateNotifications({ booking: result, status: nextStatus }))
      : [];
  return { booking: result, state, persistence, notifications };
}

export async function createPaymentRecord({ bookingId = "", reservation = {} } = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const booking = draft.bookings.find((item) => item.id === bookingId);
    if (!booking) {
      const error = new Error("Create a secure booking record before starting the reservation fee session.");
      error.status = 404;
      error.code = "booking_required";
      error.publicMessage = "Create a secure booking record before starting the reservation fee session.";
      throw error;
    }
    const totals = booking?.totals || totalsForReservation(draft, reservation);
    const payment = {
      id: id("pi"),
      bookingId: booking?.id || "",
      bookingReference: booking?.reference || reservation.reference || "",
      vehicleSlug: booking?.vehicleSlug || totals.vehicle.slug,
      vehicleName: booking?.vehicleName || `${totals.vehicle.name} ${totals.vehicle.year}`,
      customerName: booking?.customerName || reservation.name || reservation.fullName || "",
      customerEmail: booking?.customerEmail || reservation.email || "",
      amount: totals.reservationFee || RESERVATION_FEE,
      currency: totals.currency || "GBP",
      status: "payment_pending",
      provider: "stripe_reservation_fee",
      purpose: "reservation_fee",
      providerReference: "",
      createdAt: now(),
      updatedAt: now(),
    };
    draft.payments.push(payment);
    if (booking) {
      booking.status = "payment_intent_created";
      booking.paymentStatus = "payment_pending";
      booking.paymentIntentId = payment.id;
      booking.updatedAt = now();
      addAuditEvent(draft, {
        type: "payment_session_created",
        label: "Reservation fee session created",
        actor: "Customer",
        entityType: "payment",
        entityId: payment.id,
        reference: booking.reference,
        details: `${payment.vehicleName} £79 reservation fee session opened for ${payment.customerEmail || "guest client"}.`,
      });
    }
    return publicPayment(payment);
  });
  return { payment: result, state, persistence, notifications: [] };
}

export async function updatePaymentRecord(idValue, patch = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const payment = draft.payments.find((item) => item.id === idValue);
    if (!payment) return null;
    Object.assign(payment, patch, { updatedAt: now() });
    const booking = draft.bookings.find((item) => item.id === payment.bookingId);
    if (booking && patch.status) {
      const beforeStatus = booking.paymentStatus;
      booking.paymentStatus = patch.status;
      if (["reservation_fee_paid", "deposit_paid", "rental_paid"].includes(String(patch.status).toLowerCase())) {
        booking.status = "confirmed";
      }
      if (["cancelled", "failed"].includes(String(patch.status).toLowerCase())) booking.status = String(patch.status).toLowerCase();
      if (patch.status === "deposit_paid") {
        booking.operationsChecklist = normaliseOperationsChecklist({
          ...(booking.operationsChecklist || {}),
          depositConfirmed: true,
        });
      }
      booking.timeline = [
        ...(booking.timeline || []),
        { label: `Payment status changed to ${patch.status}`, at: now() },
      ];
      addAuditEvent(draft, {
        type: "payment_status_updated",
        label: `Payment status changed to ${patch.status}`,
        actor: patch.provider === "stripe_checkout" || patch.providerReference ? "Stripe" : "Operations",
        entityType: "payment",
        entityId: payment.id,
        reference: booking.reference,
        details: `Payment ${beforeStatus || "unset"} to ${patch.status}.`,
      });
      booking.updatedAt = now();
    }
    return publicPayment(payment);
  });
  const booking = (state.bookings || []).find((item) => item.id === result?.bookingId) || null;
  let notifications = [];
  if (result && ["reservation_fee_paid", "deposit_paid"].includes(String(patch?.status || "").toLowerCase())) {
    notifications = await dispatchNotifications(() => sendDepositPaidNotifications({ payment: result, booking }));
  } else if (result && String(patch?.status || "").toLowerCase() === "payment_pending" && (patch?.providerReference || patch?.checkoutUrl)) {
    notifications = await dispatchNotifications(() => sendPaymentPendingNotifications({ payment: result, booking }));
  }
  return { payment: result, state, persistence, notifications };
}

export async function sendBookingCommunication(bookingId, kind = "confirmation") {
  const state = await loadOperationsState();
  const booking = (state.bookings || []).map(publicBooking).find((item) => item.id === bookingId);
  if (!booking) {
    const error = new Error("Booking not found.");
    error.status = 404;
    error.publicMessage = "Booking not found.";
    throw error;
  }
  const payment =
    (state.payments || []).map(publicPayment).find((item) => item.bookingId === booking.id) ||
    (state.payments || []).map(publicPayment).find((item) => item.bookingReference === booking.reference) ||
    null;
  const notifications = await dispatchNotifications(() => sendManualBookingCommunication({ booking, payment, kind }));
  return { booking, payment, notifications };
}

export async function lookupCustomerBookingStatus({ reference = "", email = "" } = {}) {
  const cleanReference = String(reference || "").trim().toUpperCase();
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanReference || !cleanEmail) {
    const error = new Error("Enter your booking reference and email address.");
    error.status = 400;
    error.publicMessage = "Enter your booking reference and email address.";
    throw error;
  }
  const state = await loadOperationsState();
  const booking = (state.bookings || []).find((item) => {
    const bookingReference = String(item.reference || item.id || "").trim().toUpperCase();
    const bookingEmail = String(item.customerEmail || "").trim().toLowerCase();
    return bookingEmail === cleanEmail && bookingReference === cleanReference;
  });
  if (!booking) {
    const error = new Error("We could not find a matching Velaire booking. Check the reference and email used at reservation.");
    error.status = 404;
    error.publicMessage = "We could not find a matching Velaire booking. Check the reference and email used at reservation.";
    throw error;
  }
  const payment =
    (state.payments || []).map(publicPayment).find((item) => item.bookingId === booking.id) ||
    (state.payments || []).map(publicPayment).find((item) => item.bookingReference === booking.reference) ||
    null;
  const safeBooking = publicBooking(booking);
  return {
    booking: {
      reference: safeBooking.reference,
      customerName: safeBooking.customerName,
      vehicleName: safeBooking.vehicleName,
      status: safeBooking.status,
      paymentStatus: payment?.status || safeBooking.paymentStatus,
      pickup: safeBooking.pickup,
      pickupTime: safeBooking.pickupTime,
      return: safeBooking.return,
      returnTime: safeBooking.returnTime,
      location: safeBooking.location,
      totals: safeBooking.totals,
      createdAt: safeBooking.createdAt,
      updatedAt: safeBooking.updatedAt,
    },
    payment: payment
      ? {
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          provider: payment.provider,
          updatedAt: payment.updatedAt,
        }
      : null,
    meta: state.meta,
  };
}

export async function updateVehicleOperationsRecord(slug, patch = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const vehicle = requireVehicle(slug);
    const operations = vehicleOperations(draft, vehicle.slug);
    const before = {
      rate: operations.rate,
      deposit: operations.deposit,
      availabilityStatus: operations.availabilityStatus,
    };
    operations.rate = Number.isFinite(Number(patch.rate)) ? Math.max(Number(patch.rate), 0) : operations.rate;
    operations.deposit = Number.isFinite(Number(patch.deposit)) ? Math.max(Number(patch.deposit), 0) : operations.deposit;
    operations.availabilityStatus = patch.availabilityStatus || operations.availabilityStatus || "request-to-confirm";
    operations.updatedAt = now();
    addAuditEvent(draft, {
      type: "vehicle_operations_updated",
      label: "Vehicle pricing/availability updated",
      actor: "Operations",
      entityType: "vehicle",
      entityId: vehicle.slug,
      reference: vehicle.name,
      details: [
        before.rate !== operations.rate ? `Rate ${before.rate} to ${operations.rate}` : "",
        before.deposit !== operations.deposit ? `Deposit ${before.deposit} to ${operations.deposit}` : "",
        before.availabilityStatus !== operations.availabilityStatus
          ? `Availability ${before.availabilityStatus || "unset"} to ${operations.availabilityStatus || "unset"}`
          : "",
      ]
        .filter(Boolean)
        .join(" · ") || `${vehicle.name} operations settings saved.`,
    });
    return operationalVehicleFromState(draft, vehicle.slug);
  });
  return { vehicle: result, state, persistence };
}

export async function blockVehicleDates(slug, { start, end, reason = "Operations block" } = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const range = normaliseRange(start, end);
    if (!range) {
      const error = new Error("Choose a valid start date for the vehicle block.");
      error.status = 400;
      error.publicMessage = "Choose a valid start date for the vehicle block.";
      throw error;
    }
    const operations = vehicleOperations(draft, slug);
    const block = {
      id: id("blk"),
      start: range.startDate,
      end: range.endDate,
      reason,
      createdAt: now(),
    };
    operations.blockedRanges.push(block);
    operations.updatedAt = now();
    addAuditEvent(draft, {
      type: "vehicle_dates_blocked",
      label: "Vehicle dates blocked",
      actor: "Operations",
      entityType: "vehicle",
      entityId: slug,
      reference: slug,
      details: `${block.start} to ${block.end} · ${block.reason || "Operations block"}`,
    });
    return block;
  });
  return { block: result, state, persistence };
}

export async function removeVehicleBlock(slug, blockId) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const operations = vehicleOperations(draft, slug);
    const before = operations.blockedRanges.length;
    const removedBlock = operations.blockedRanges.find((block) => block.id === blockId);
    operations.blockedRanges = operations.blockedRanges.filter((block) => block.id !== blockId);
    operations.updatedAt = now();
    if (removedBlock) {
      addAuditEvent(draft, {
        type: "vehicle_date_block_removed",
        label: "Vehicle date block removed",
        actor: "Operations",
        entityType: "vehicle",
        entityId: slug,
        reference: slug,
        details: `${removedBlock.start} to ${removedBlock.end} · ${removedBlock.reason || "Operations block"}`,
      });
    }
    return before !== operations.blockedRanges.length;
  });
  return { removed: result, state, persistence };
}

export async function operationsSummary() {
  const state = await loadOperationsState();
  const bookings = (state.bookings || []).map(publicBooking).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  const payments = (state.payments || []).map(publicPayment).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  const customers = state.customers?.length ? state.customers : customerRecordsFromBookings(bookings);
  const notifications = (state.notifications || [])
    .map(publicNotification)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const auditLog = (state.auditLog || [])
    .map(publicAuditEvent)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return {
    meta: state.meta,
    counts: {
      bookings: bookings.length,
      payments: payments.length,
      customers: customers.length,
      notifications: notifications.length,
      vehicles: fleetData.length,
      pendingBookings: bookings.filter((booking) => ["draft", "pending", "payment_review", "payment_intent_created", "payment_pending"].includes(booking.status)).length,
      confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
    },
    bookings,
    payments,
    customers,
    notifications,
    auditLog,
    vehicles: listOperationalVehiclesFromState(state),
  };
}
