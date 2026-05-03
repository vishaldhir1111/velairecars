import crypto from "node:crypto";
import { fleetData, requireVehicle } from "./fleet-data.js";

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
    bookings: Array.isArray(state.bookings) ? state.bookings : [],
    payments: Array.isArray(state.payments) ? state.payments : [],
    customers: Array.isArray(state.customers) ? state.customers : [],
    leads: Array.isArray(state.leads) ? state.leads : [],
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
  globalThis.__VELAIRE_OPERATIONS_STORE__ = state;
  const persistence = await writePersistedState(state);
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

function publicBooking(booking = {}) {
  return {
    id: booking.id,
    reference: booking.reference,
    userId: booking.userId || null,
    customerName: booking.customerName || "",
    customerEmail: booking.customerEmail || "",
    customerPhone: booking.customerPhone || "",
    vehicleSlug: booking.vehicleSlug,
    vehicleName: booking.vehicleName,
    status: booking.status || "draft",
    paymentStatus: booking.paymentStatus || "not_started",
    paymentIntentId: booking.paymentIntentId || "",
    pickup: booking.pickup || "",
    pickupTime: booking.pickupTime || "",
    return: booking.return || "",
    returnTime: booking.returnTime || "",
    location: booking.location || "",
    placeId: booking.placeId || "",
    lat: booking.lat || "",
    lng: booking.lng || "",
    handoverNotes: booking.handoverNotes || "",
    billingAddress1: booking.billingAddress1 || "",
    billingAddress2: booking.billingAddress2 || "",
    billingTown: booking.billingTown || "",
    billingCity: booking.billingCity || "",
    billingPostcode: booking.billingPostcode || "",
    billingCountry: booking.billingCountry || "",
    totals: booking.totals || {},
    timeline: booking.timeline || [],
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
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
    providerReference: payment.providerReference || "",
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt || payment.createdAt,
  };
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
    current.upcomingBookings += ["cancelled", "completed"].includes(booking.status) ? 0 : 1;
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
  return ["draft", "pending", "payment_intent_created", "payment_pending", "confirmed"].includes(String(status || "").toLowerCase());
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
    vehicle,
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
    syncCustomers(draft);
    return publicBooking(booking);
  });
  return { booking: result, state, persistence };
}

export async function updateBookingRecord(idValue, patch = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const booking = draft.bookings.find((item) => item.id === idValue);
    if (!booking) return null;
    const { reservation, ...bookingPatch } = patch;
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
    Object.assign(booking, bookingPatch, { updatedAt: now() });
    booking.timeline = [...(booking.timeline || []), { label: bookingPatch.status ? `Status changed to ${bookingPatch.status}` : "Booking updated", at: now() }];
    syncCustomers(draft);
    return publicBooking(booking);
  });
  return { booking: result, state, persistence };
}

export async function createPaymentRecord({ bookingId = "", reservation = {} } = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const booking = draft.bookings.find((item) => item.id === bookingId);
    const totals = booking?.totals || totalsForReservation(draft, reservation);
    const payment = {
      id: id("pi"),
      bookingId: booking?.id || "",
      bookingReference: booking?.reference || reservation.reference || "",
      vehicleSlug: booking?.vehicleSlug || totals.vehicle.slug,
      vehicleName: booking?.vehicleName || `${totals.vehicle.name} ${totals.vehicle.year}`,
      customerName: booking?.customerName || reservation.name || reservation.fullName || "",
      customerEmail: booking?.customerEmail || reservation.email || "",
      amount: totals.deposit,
      currency: totals.currency || "GBP",
      status: "payment_pending",
      provider: "stripe_ready_deposit",
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
    }
    return publicPayment(payment);
  });
  return { payment: result, state, persistence };
}

export async function updatePaymentRecord(idValue, patch = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const payment = draft.payments.find((item) => item.id === idValue);
    if (!payment) return null;
    Object.assign(payment, patch, { updatedAt: now() });
    const booking = draft.bookings.find((item) => item.id === payment.bookingId);
    if (booking && patch.status) {
      booking.paymentStatus = patch.status;
      booking.status = patch.status === "deposit_paid" ? "confirmed" : booking.status;
      booking.updatedAt = now();
    }
    return publicPayment(payment);
  });
  return { payment: result, state, persistence };
}

export async function updateVehicleOperationsRecord(slug, patch = {}) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const vehicle = requireVehicle(slug);
    const operations = vehicleOperations(draft, vehicle.slug);
    operations.rate = Number.isFinite(Number(patch.rate)) ? Math.max(Number(patch.rate), 0) : operations.rate;
    operations.deposit = Number.isFinite(Number(patch.deposit)) ? Math.max(Number(patch.deposit), 0) : operations.deposit;
    operations.availabilityStatus = patch.availabilityStatus || operations.availabilityStatus || "request-to-confirm";
    operations.updatedAt = now();
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
    return block;
  });
  return { block: result, state, persistence };
}

export async function removeVehicleBlock(slug, blockId) {
  const { state, persistence, result } = await mutateOperations((draft) => {
    const operations = vehicleOperations(draft, slug);
    const before = operations.blockedRanges.length;
    operations.blockedRanges = operations.blockedRanges.filter((block) => block.id !== blockId);
    operations.updatedAt = now();
    return before !== operations.blockedRanges.length;
  });
  return { removed: result, state, persistence };
}

export async function operationsSummary() {
  const state = await loadOperationsState();
  const bookings = (state.bookings || []).map(publicBooking).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  const payments = (state.payments || []).map(publicPayment).sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
  const customers = state.customers?.length ? state.customers : customerRecordsFromBookings(bookings);
  return {
    meta: state.meta,
    counts: {
      bookings: bookings.length,
      payments: payments.length,
      customers: customers.length,
      vehicles: fleetData.length,
      pendingBookings: bookings.filter((booking) => ["draft", "pending", "payment_intent_created", "payment_pending"].includes(booking.status)).length,
      confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
    },
    bookings,
    payments,
    customers,
    vehicles: listOperationalVehiclesFromState(state),
  };
}
