import crypto from "node:crypto";
import { calculateBookingTotals, findVehicle, fleetData } from "./fleet-data.js";
import { parseCookies } from "./http.js";

const initialState = {
  users: [],
  sessions: [],
  bookings: [],
  payments: [],
  leads: [],
  vehicleOperations: [],
};

const db = (globalThis.__VELAIRE_STORE__ ||= structuredClone(initialState));

if (!Array.isArray(db.vehicleOperations) || !db.vehicleOperations.length) {
  db.vehicleOperations = fleetData.map((vehicle) => ({
    slug: vehicle.slug,
    rate: vehicle.rate,
    deposit: vehicle.deposit,
    availabilityStatus: "active",
    blockedRanges: seedBlockedRanges(vehicle.slug),
    updatedAt: now(),
  }));
}

const statusAliases = {
  client_details_saved: "pending",
  payment_review: "payment_pending",
  payment_intent_created: "payment_pending",
  checkout_created: "payment_pending",
  pending_approval: "pending",
  pending_payment: "payment_pending",
  approved: "confirmed",
  rejected: "cancelled",
};

const blockingBookingStatuses = new Set(["pending", "payment_pending", "confirmed"]);
const confirmedBookingStatuses = new Set(["confirmed"]);
const releasedBookingStatuses = new Set(["draft", "rejected", "cancelled", "completed"]);
const paymentStatusAliases = {
  paid: "deposit_paid",
  succeeded: "deposit_paid",
  checkout_created: "payment_pending",
  requires_checkout: "payment_pending",
  requires_action: "payment_pending",
  requires_payment_method: "payment_pending",
  processing: "payment_pending",
  expired: "cancelled",
};
const paidPaymentStatuses = new Set(["deposit_paid"]);
const failedPaymentStatuses = new Set(["failed", "cancelled"]);
const refundedPaymentStatuses = new Set(["refunded"]);

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function seedBlockedRanges(slug) {
  const seededBlocks = {
    "lamborghini-urus": [
      {
        id: "blk_urus_detailing",
        start: "2026-06-08",
        end: "2026-06-10",
        reason: "Scheduled detailing and inspection",
      },
    ],
    "range-rover-sport-svr": [
      {
        id: "blk_svr_service",
        start: "2026-05-20",
        end: "2026-05-21",
        reason: "SVR service window",
      },
    ],
  };
  return seededBlocks[slug] || [];
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateOnly(value) {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

function publicBooking(booking) {
  return {
    id: booking.id,
    reference: booking.reference,
    userId: booking.userId,
    customerName: booking.customerName || "",
    customerEmail: booking.customerEmail || "",
    customerPhone: booking.customerPhone || "",
    vehicleSlug: booking.vehicleSlug,
    vehicleName: booking.vehicleName,
    status: booking.status,
    paymentStatus: booking.paymentStatus || "not_started",
    paymentIntentId: booking.paymentIntentId || "",
    checkoutSessionId: booking.checkoutSessionId || "",
    paidAt: booking.paidAt || "",
    pickup: booking.pickup,
    pickupTime: booking.pickupTime,
    return: booking.return,
    returnTime: booking.returnTime,
    location: booking.location,
    lat: booking.lat,
    lng: booking.lng,
    handoverNotes: booking.handoverNotes,
    totals: booking.totals,
    timeline: booking.timeline || [],
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

function publicPayment(payment) {
  const booking = db.bookings.find((item) => item.id === payment.bookingId);
  return {
    id: payment.id,
    bookingId: payment.bookingId || "",
    bookingReference: booking?.reference || "",
    vehicleName: booking?.vehicleName || "",
    customerEmail: booking?.customerEmail || "",
    customerPhone: booking?.customerPhone || "",
    amount: payment.amount,
    currency: payment.currency || "GBP",
    status: payment.status || "not_started",
    provider: payment.provider || "stripe_checkout",
    providerReference: payment.providerReference || "",
    checkoutSessionId: payment.checkoutSessionId || "",
    checkoutUrl: payment.checkoutUrl || "",
    amountPaid: payment.amountPaid || 0,
    paidAt: payment.paidAt || "",
    failureReason: payment.failureReason || "",
    refundedAt: payment.refundedAt || "",
    cancelledAt: payment.cancelledAt || "",
    note: payment.note || "",
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt || payment.createdAt,
  };
}

function publicLead(lead) {
  return {
    id: lead.id,
    prompt: lead.prompt || "",
    recommendedVehicle: lead.recommendedVehicle || "",
    alternatives: lead.alternatives || [],
    response: lead.response || "",
    source: lead.source || "ai_concierge",
    status: lead.status || "new",
    customerEmail: lead.customerEmail || "",
    customerPhone: lead.customerPhone || "",
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt || lead.createdAt,
  };
}

function getVehicleOperations(slug) {
  let record = db.vehicleOperations.find((item) => item.slug === slug);
  const vehicle = findVehicle(slug);
  if (!record) {
    record = {
      slug: vehicle.slug,
      rate: vehicle.rate,
      deposit: vehicle.deposit,
      availabilityStatus: "active",
      blockedRanges: [],
      updatedAt: now(),
    };
    db.vehicleOperations.push(record);
  }
  return record;
}

function operationalVehicle(slug) {
  const vehicle = findVehicle(slug);
  const operations = getVehicleOperations(vehicle.slug);
  return {
    ...vehicle,
    rate: Number(operations.rate || vehicle.rate),
    deposit: Number(operations.deposit || vehicle.deposit),
    availability: {
      ...vehicle.availability,
      status: operations.availabilityStatus || vehicle.availability?.status || "active",
      blockedRanges: operations.blockedRanges || [],
      preventDoubleBooking: true,
    },
  };
}

function calculateOperationalTotals({ vehicleSlug, pickup, returnDate, days }) {
  const baseTotals = calculateBookingTotals({ vehicleSlug, pickup, returnDate, days });
  const vehicle = operationalVehicle(vehicleSlug || baseTotals.vehicle.slug);
  return {
    ...baseTotals,
    vehicle,
    hireEstimate: vehicle.rate * baseTotals.days,
    deposit: vehicle.deposit,
  };
}

function bookingRangeFromReservation(reservation = {}) {
  return normaliseRange(reservation.pickup, reservation.return);
}

function bookingRange(booking) {
  return normaliseRange(booking.pickup, booking.return);
}

function isBlockingBookingStatus(status) {
  const canonicalStatus = normaliseBookingStatus(status, "draft");
  return blockingBookingStatuses.has(canonicalStatus) && !releasedBookingStatuses.has(canonicalStatus);
}

function normaliseBookingStatus(status, fallback = "pending") {
  const clean = String(status || fallback).trim().toLowerCase();
  return statusAliases[clean] || clean || fallback;
}

function normalisePaymentStatus(status, fallback = "payment_pending") {
  const clean = String(status || fallback).trim().toLowerCase();
  return paymentStatusAliases[clean] || clean || fallback;
}

function isDepositPaidStatus(status) {
  return paidPaymentStatuses.has(normalisePaymentStatus(status, ""));
}

function bookingStatusForPaymentStatus(status) {
  const canonical = normalisePaymentStatus(status);
  if (paidPaymentStatuses.has(canonical)) return "confirmed";
  if (failedPaymentStatuses.has(canonical) || refundedPaymentStatuses.has(canonical)) return "cancelled";
  return "payment_pending";
}

function normaliseEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

function sessionSecret() {
  return String(
    process.env.VELAIRE_SESSION_SECRET ||
      process.env.VELAIRE_ADMIN_TOKEN ||
      process.env.VELAIRE_PORTAL_PASSWORD ||
      "velaire-dev-session-secret",
  );
}

function encodeSessionPayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSessionPayload(value) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function sessionSignature(body) {
  return crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

function signSessionPayload(payload) {
  const body = encodeSessionPayload(payload);
  return `v1.${body}.${sessionSignature(body)}`;
}

function verifySignedSessionToken(token = "") {
  const [version, body, signature] = String(token || "").split(".");
  if (version !== "v1" || !body || !signature) return null;

  const expected = sessionSignature(body);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== receivedBuffer.length) return null;
  if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) return null;

  try {
    const payload = decodeSessionPayload(body);
    if (!payload?.email || !payload?.expiresAt || new Date(payload.expiresAt) <= new Date()) return null;
    return payload;
  } catch {
    return null;
  }
}

function assertEmail(email) {
  if (!normaliseEmail(email).includes("@")) {
    const error = new Error("Enter a valid email address.");
    error.status = 400;
    error.publicMessage = "Enter a valid email address.";
    throw error;
  }
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    phone: user.phone || "",
    profile: user.profile || {},
    preferences: user.preferences || {},
    verification: user.verification || { status: "not_submitted", documents: {} },
    paymentMethod: user.paymentMethod || null,
    favourites: user.favourites || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function publicUserFromSessionPayload(payload) {
  if (!payload?.email) return null;
  return {
    id: payload.userId || `session_${normaliseEmail(payload.email)}`,
    email: normaliseEmail(payload.email),
    phone: payload.phone || "",
    profile: payload.profile || {},
    preferences: payload.preferences || {},
    verification: payload.verification || { status: "not_submitted", documents: {} },
    paymentMethod: null,
    favourites: payload.favourites || [],
    createdAt: payload.createdAt || payload.issuedAt || now(),
    updatedAt: payload.updatedAt || payload.issuedAt || now(),
  };
}

function importAuthUserRecord(record) {
  if (!record?.email) return null;
  const cleanEmail = normaliseEmail(record.email);
  let user = db.users.find((item) => item.email === cleanEmail || item.id === record.id);
  const next = {
    id: record.id || user?.id || id("usr"),
    email: cleanEmail,
    phone: record.phone || user?.phone || "",
    password: record.password || user?.password || null,
    profile: {
      fullName: record.profile?.fullName || user?.profile?.fullName || "",
      billingAddress: record.profile?.billingAddress || user?.profile?.billingAddress || "",
      billingAddressLine1: record.profile?.billingAddressLine1 || user?.profile?.billingAddressLine1 || record.profile?.billingAddress || "",
      billingAddressLine2: record.profile?.billingAddressLine2 || user?.profile?.billingAddressLine2 || "",
      billingTown: record.profile?.billingTown || user?.profile?.billingTown || "",
      billingCity: record.profile?.billingCity || user?.profile?.billingCity || "",
      billingPostcode: record.profile?.billingPostcode || user?.profile?.billingPostcode || "",
      billingCountry: record.profile?.billingCountry || user?.profile?.billingCountry || "United Kingdom",
      licenceCountry: record.profile?.licenceCountry || user?.profile?.licenceCountry || "United Kingdom",
      preferredContact: record.profile?.preferredContact || user?.profile?.preferredContact || "Email",
    },
    preferences: {
      vehicleCategories: record.preferences?.vehicleCategories || user?.preferences?.vehicleCategories || ["Super SUV", "Luxury SUV"],
      handoverType: record.preferences?.handoverType || user?.preferences?.handoverType || "Concierge delivery",
      communication: record.preferences?.communication || user?.preferences?.communication || ["Concierge updates"],
      preferredLocation: record.preferences?.preferredLocation || user?.preferences?.preferredLocation || "",
      savedLocations: record.preferences?.savedLocations || user?.preferences?.savedLocations || [],
    },
    verification: {
      status: record.verification?.status || user?.verification?.status || "not_submitted",
      documents: record.verification?.documents || user?.verification?.documents || {},
    },
    paymentMethod: record.paymentMethod || user?.paymentMethod || null,
    favourites: record.favourites || user?.favourites || ["lamborghini-urus", "range-rover-sport-svr", "bmw-m440i-convertible"],
    createdAt: record.createdAt || user?.createdAt || now(),
    updatedAt: record.updatedAt || user?.updatedAt || now(),
  };

  if (user) {
    Object.assign(user, next);
  } else {
    db.users.push(next);
    user = next;
  }
  return user;
}

function userBookingSummary(userId, email) {
  const cleanEmail = normaliseEmail(email);
  const bookings = db.bookings.filter(
    (booking) => booking.userId === userId || (cleanEmail && booking.customerEmail === cleanEmail),
  );
  return {
    bookings: bookings.map(publicBooking),
    totalBookings: bookings.length,
    upcomingBookings: bookings.filter((booking) => isBlockingBookingStatus(booking.status)).length,
    completedBookings: bookings.filter((booking) => normaliseBookingStatus(booking.status) === "completed").length,
    lastBooking: bookings.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0] || null,
    hireValue: bookings.reduce((total, booking) => total + Number(booking.totals?.hireEstimate || 0), 0),
  };
}

export function registerUser({ email, password, phone = "", profile = {} }) {
  const cleanEmail = normaliseEmail(email);
  assertEmail(cleanEmail);

  if (db.users.some((user) => user.email === cleanEmail)) {
    const error = new Error("An account already exists for this email.");
    error.status = 409;
    error.publicMessage = "An account already exists for this email.";
    throw error;
  }

  const passwordRecord = hashPassword(password || crypto.randomBytes(18).toString("hex"));
  const user = {
    id: id("usr"),
    email: cleanEmail,
    phone,
    password: passwordRecord,
    profile: {
      fullName: profile.fullName || "",
      billingAddress: profile.billingAddress || "",
      billingAddressLine1: profile.billingAddressLine1 || profile.billingAddress || "",
      billingAddressLine2: profile.billingAddressLine2 || "",
      billingTown: profile.billingTown || "",
      billingCity: profile.billingCity || "",
      billingPostcode: profile.billingPostcode || "",
      billingCountry: profile.billingCountry || "United Kingdom",
      licenceCountry: profile.licenceCountry || "United Kingdom",
      preferredContact: profile.preferredContact || "Email",
    },
    preferences: {
      vehicleCategories: ["Super SUV", "Luxury SUV"],
      handoverType: "Concierge delivery",
      communication: ["Concierge updates"],
      preferredLocation: "",
      savedLocations: [],
    },
    verification: {
      status: "not_submitted",
      documents: {},
    },
    paymentMethod: null,
    favourites: ["lamborghini-urus", "range-rover-sport-svr", "bmw-m440i-convertible"],
    createdAt: now(),
    updatedAt: now(),
  };

  db.users.push(user);
  return publicUser(user);
}

export function authenticateUser({ email, password }) {
  const cleanEmail = normaliseEmail(email);
  const user = db.users.find((item) => item.email === cleanEmail);
  if (!user) {
    const error = new Error("No Velaire account found for this email.");
    error.status = 401;
    error.publicMessage = "No Velaire account found for this email.";
    throw error;
  }

  const candidate = hashPassword(password || "", user.password.salt);
  if (candidate.hash !== user.password.hash) {
    const error = new Error("The password did not match this Velaire account.");
    error.status = 401;
    error.publicMessage = "The password did not match this Velaire account.";
    throw error;
  }

  return publicUser(user);
}

export function authenticateAuthUserRecord(record, password) {
  const cleanEmail = normaliseEmail(record?.email);
  if (!cleanEmail || !record?.password?.salt || !record?.password?.hash) {
    const error = new Error("No Velaire account found for this email.");
    error.status = 401;
    error.publicMessage = "No Velaire account found for this email.";
    throw error;
  }

  const candidate = hashPassword(password || "", record.password.salt);
  if (candidate.hash !== record.password.hash) {
    const error = new Error("The password did not match this Velaire account.");
    error.status = 401;
    error.publicMessage = "The password did not match this Velaire account.";
    throw error;
  }

  return publicUser(importAuthUserRecord(record));
}

export function findUserByEmail(email = "") {
  const cleanEmail = normaliseEmail(email);
  if (!cleanEmail) return null;
  return publicUser(db.users.find((user) => user.email === cleanEmail));
}

export function getAuthUserRecordForPersistence(email = "") {
  const cleanEmail = normaliseEmail(email);
  if (!cleanEmail) return null;
  const user = db.users.find((item) => item.email === cleanEmail);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    phone: user.phone || "",
    password: user.password || null,
    profile: user.profile || {},
    preferences: user.preferences || {},
    verification: user.verification || { status: "not_submitted", documents: {} },
    paymentMethod: user.paymentMethod || null,
    favourites: user.favourites || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function createSession(userId) {
  const user = db.users.find((item) => item.id === userId);
  const session = {
    token: signSessionPayload({
      userId: user?.id || userId,
      email: user?.email || "",
      phone: user?.phone || "",
      profile: user?.profile || {},
      preferences: user?.preferences || {},
      verification: user?.verification || { status: "not_submitted", documents: {} },
      favourites: user?.favourites || [],
      createdAt: user?.createdAt || now(),
      updatedAt: user?.updatedAt || now(),
      issuedAt: now(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    }),
    userId,
    createdAt: now(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  db.sessions.push(session);
  return session;
}

export function destroySession(token) {
  db.sessions = db.sessions.filter((session) => session.token !== token);
}

export function currentUser(req) {
  const token = parseCookies(req).velaire_session;
  if (!token) return null;
  const session = db.sessions.find((item) => item.token === token && new Date(item.expiresAt) > new Date());
  if (session) {
    const user = publicUser(db.users.find((item) => item.id === session.userId));
    if (user) return user;
  }

  const payload = verifySignedSessionToken(token);
  if (!payload) return null;
  return (
    publicUser(db.users.find((user) => user.id === payload.userId || user.email === normaliseEmail(payload.email))) ||
    publicUserFromSessionPayload(payload)
  );
}

function mutableUser(userId) {
  return db.users.find((user) => user.id === userId);
}

export function updateAccount(userId, patch = {}) {
  const user = mutableUser(userId);
  if (!user) {
    const error = new Error("Sign in to update this account.");
    error.status = 401;
    error.publicMessage = "Sign in to update this account.";
    throw error;
  }

  user.phone = patch.phone ?? user.phone;
  user.profile = { ...user.profile, ...(patch.profile || {}) };
  user.preferences = { ...user.preferences, ...(patch.preferences || {}) };
  user.verification = {
    ...user.verification,
    ...(patch.verification || {}),
    documents: {
      ...(user.verification?.documents || {}),
      ...(patch.verification?.documents || {}),
    },
  };
  user.paymentMethod = patch.paymentMethod === undefined ? user.paymentMethod : patch.paymentMethod;
  user.favourites = Array.isArray(patch.favourites) ? patch.favourites : user.favourites;
  user.updatedAt = now();

  return publicUser(user);
}

export function listOperationalVehicles() {
  return fleetData.map((vehicle) => {
    const operations = getVehicleOperations(vehicle.slug);
    const relatedBookings = db.bookings
      .filter((booking) => booking.vehicleSlug === vehicle.slug && isBlockingBookingStatus(booking.status))
      .map(publicBooking);

    return {
      ...vehicle,
      rate: Number(operations.rate || vehicle.rate),
      deposit: Number(operations.deposit || vehicle.deposit),
      availability: {
        ...vehicle.availability,
        status: operations.availabilityStatus || "active",
        blockedRanges: operations.blockedRanges || [],
        pendingBookings: relatedBookings.filter((booking) => !confirmedBookingStatuses.has(booking.status)),
        confirmedBookings: relatedBookings.filter((booking) => confirmedBookingStatuses.has(booking.status)),
        preventDoubleBooking: true,
      },
      operations: {
        rate: Number(operations.rate || vehicle.rate),
        deposit: Number(operations.deposit || vehicle.deposit),
        availabilityStatus: operations.availabilityStatus || "active",
        blockedRanges: operations.blockedRanges || [],
        updatedAt: operations.updatedAt,
      },
    };
  });
}

export function checkVehicleAvailability({
  vehicleSlug,
  pickup,
  returnDate,
  excludeBookingId = null,
  includeDrafts = false,
} = {}) {
  const vehicle = operationalVehicle(vehicleSlug);
  const requestedRange = normaliseRange(pickup, returnDate);
  const operations = getVehicleOperations(vehicle.slug);
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

  for (const block of operations.blockedRanges || []) {
    const blockRange = normaliseRange(block.start, block.end);
    if (rangesOverlap(requestedRange, blockRange)) {
      conflicts.push({
        type: "blocked_date",
        id: block.id,
        start: block.start,
        end: block.end,
        reason: block.reason || "Vehicle blocked by operations",
      });
    }
  }

  for (const booking of db.bookings) {
    if (booking.id === excludeBookingId || booking.vehicleSlug !== vehicle.slug) continue;
    if (!includeDrafts && !isBlockingBookingStatus(booking.status)) continue;
    if (rangesOverlap(requestedRange, bookingRange(booking))) {
      conflicts.push({
        type: confirmedBookingStatuses.has(booking.status) ? "confirmed_booking" : "pending_booking",
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        start: booking.pickup,
        end: booking.return,
        customerEmail: booking.customerEmail || "",
      });
    }
  }

  const available = conflicts.length === 0 && operations.availabilityStatus !== "offline";
  return {
    vehicle,
    available,
    status: available ? "available_request_to_confirm" : "unavailable",
    requestedRange: {
      start: requestedRange.startDate,
      end: requestedRange.endDate,
    },
    conflicts,
    message: available
      ? `${vehicle.name} is clear for those dates. Velaire will still confirm driver checks and handover timing.`
      : `${vehicle.name} is already blocked or reserved for those dates. Choose another vehicle or adjust the handover window.`,
  };
}

function assertAvailabilityForBooking({ vehicleSlug, pickup, returnDate, excludeBookingId = null }) {
  const availability = checkVehicleAvailability({ vehicleSlug, pickup, returnDate, excludeBookingId });
  if (!availability.available) {
    const error = new Error(availability.message);
    error.status = 409;
    error.publicMessage = availability.message;
    error.availability = availability;
    throw error;
  }
  return availability;
}

export function createBooking({ userId = null, reservation = {}, status = "draft" }) {
  const canonicalStatus = normaliseBookingStatus(status, "draft");
  const totals = calculateOperationalTotals({
    vehicleSlug: reservation.vehicle,
    pickup: reservation.pickup,
    returnDate: reservation.return,
    days: Number.parseInt(reservation.days || "0", 10),
  });
  const vehicle = totals.vehicle;
  if (isBlockingBookingStatus(canonicalStatus)) {
    assertAvailabilityForBooking({
      vehicleSlug: vehicle.slug,
      pickup: reservation.pickup,
      returnDate: reservation.return,
    });
  }
  const booking = {
    id: id("bok"),
    reference: referenceFor(vehicle.slug),
    userId,
    customerName: reservation.name || reservation.fullName || "",
    customerEmail: reservation.email || "",
    customerPhone: reservation.phone || "",
    vehicleSlug: vehicle.slug,
    vehicleName: `${vehicle.name} ${vehicle.year}`,
    status: canonicalStatus,
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
    totals,
    timeline: [
      {
        label: "Reservation created",
        at: now(),
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  };
  db.bookings.push(booking);
  return publicBooking(booking);
}

export function updateBooking(idValue, patch = {}) {
  const booking = db.bookings.find((item) => item.id === idValue);
  if (!booking) return null;

  const { reservation, allowPaidStateTransition = false, ...bookingPatch } = patch;
  const wasDepositPaid = isDepositPaidStatus(booking.paymentStatus);
  const incomingPaymentStatus = bookingPatch.paymentStatus ? normalisePaymentStatus(bookingPatch.paymentStatus) : "";
  const incomingBookingStatus = bookingPatch.status ? normaliseBookingStatus(bookingPatch.status) : "";
  const stalePaidDowngrade =
    wasDepositPaid &&
    !allowPaidStateTransition &&
    ((incomingPaymentStatus && incomingPaymentStatus !== "deposit_paid") ||
      ["draft", "pending", "payment_pending"].includes(incomingBookingStatus));
  const nextStatus = normaliseBookingStatus(bookingPatch.status || booking.status, booking.status);
  if (reservation) {
    const totals = calculateOperationalTotals({
      vehicleSlug: reservation.vehicle || booking.vehicleSlug,
      pickup: reservation.pickup || booking.pickup,
      returnDate: reservation.return || booking.return,
      days: Number.parseInt(reservation.days || String(booking.totals?.days || 0), 10),
    });
    if (isBlockingBookingStatus(nextStatus)) {
      assertAvailabilityForBooking({
        vehicleSlug: totals.vehicle.slug,
        pickup: reservation.pickup || booking.pickup,
        returnDate: reservation.return || booking.return,
        excludeBookingId: booking.id,
      });
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
      totals,
    });
  }

  if (!reservation && bookingPatch.status && isBlockingBookingStatus(bookingPatch.status)) {
    assertAvailabilityForBooking({
      vehicleSlug: booking.vehicleSlug,
      pickup: booking.pickup,
      returnDate: booking.return,
      excludeBookingId: booking.id,
    });
  }

  if (bookingPatch.status) bookingPatch.status = normaliseBookingStatus(bookingPatch.status);
  if (bookingPatch.paymentStatus) bookingPatch.paymentStatus = normalisePaymentStatus(bookingPatch.paymentStatus);
  if (stalePaidDowngrade) {
    delete bookingPatch.status;
    delete bookingPatch.paymentStatus;
    bookingPatch.paidAt = booking.paidAt || bookingPatch.paidAt || now();
  }
  Object.assign(booking, { ...bookingPatch, updatedAt: now() });
  booking.timeline.push({
    label: stalePaidDowngrade ? "Paid booking protected from stale payment sync" : patch.status ? `Status changed to ${patch.status}` : "Booking updated",
    at: now(),
  });
  return publicBooking(booking);
}

export function listBookings(userId) {
  if (!userId) return [];
  return db.bookings.filter((booking) => booking.userId === userId).map(publicBooking);
}

export function findMatchingActiveBooking({ userId = "", email = "", vehicleSlug = "", pickup = "", returnDate = "" } = {}) {
  const cleanEmail = normaliseEmail(email);
  const booking = db.bookings.find((item) => {
    const status = normaliseBookingStatus(item.status, "pending");
    if (releasedBookingStatuses.has(status)) return false;
    const sameAccount = (userId && item.userId === userId) || (cleanEmail && item.customerEmail === cleanEmail);
    return (
      sameAccount &&
      item.vehicleSlug === vehicleSlug &&
      item.pickup === pickup &&
      item.return === returnDate
    );
  });
  return booking ? publicBooking(booking) : null;
}

export function createPaymentIntent({ bookingId, reservation = {} }) {
  const booking = db.bookings.find((item) => item.id === bookingId);
  const existingPaidPayment = db.payments.find(
    (item) => item.bookingId === booking?.id && paidPaymentStatuses.has(normalisePaymentStatus(item.status)),
  );
  if (isDepositPaidStatus(booking?.paymentStatus) || existingPaidPayment) {
    const error = new Error("This reservation deposit has already been paid.");
    error.status = 409;
    error.code = "deposit_already_paid";
    error.publicMessage = "This reservation deposit has already been paid. The booking is now in concierge review.";
    error.booking = booking ? publicBooking(booking) : null;
    error.payment = existingPaidPayment ? publicPayment(existingPaidPayment) : null;
    throw error;
  }
  const totals =
    booking?.totals ||
    calculateOperationalTotals({
      vehicleSlug: reservation.vehicle,
      pickup: reservation.pickup,
      returnDate: reservation.return,
      days: Number.parseInt(reservation.days || "0", 10),
    });
  let payment = db.payments.find(
    (item) =>
      item.bookingId === booking?.id &&
      !paidPaymentStatuses.has(normalisePaymentStatus(item.status)) &&
      !refundedPaymentStatuses.has(normalisePaymentStatus(item.status)),
  );
  const status = "payment_pending";
  if (payment) {
    Object.assign(payment, {
      amount: totals.deposit,
      currency: totals.currency || "GBP",
      status: normalisePaymentStatus(status, status),
      updatedAt: now(),
    });
  } else {
    payment = {
      id: id("pi"),
      bookingId: booking?.id || null,
      amount: totals.deposit,
      amountPaid: 0,
      currency: totals.currency || "GBP",
      status: normalisePaymentStatus(status, status),
      provider: "stripe_checkout",
      createdAt: now(),
      updatedAt: now(),
      note: "Deposit intent created for secure Stripe Checkout. No card data is stored by Velaire.",
    };
    db.payments.push(payment);
  }
  if (booking) {
    updateBooking(booking.id, {
      status: "payment_pending",
      paymentStatus: payment.status,
      paymentIntentId: payment.id,
    });
  }
  return publicPayment(payment);
}

export function attachCheckoutToPayment(paymentId, checkout = {}) {
  const payment = db.payments.find((item) => item.id === paymentId);
  if (!payment) return null;
  Object.assign(payment, {
    checkoutSessionId: checkout.sessionId || payment.checkoutSessionId || null,
    checkoutUrl: checkout.url || payment.checkoutUrl || null,
    providerReference: checkout.sessionId || payment.providerReference || "",
    status: normalisePaymentStatus(checkout.status || payment.status),
    updatedAt: now(),
  });

  if (payment.bookingId) {
    updateBooking(payment.bookingId, {
      status: "payment_pending",
      paymentStatus: payment.status,
      checkoutSessionId: payment.checkoutSessionId,
    });
  }
  return publicPayment(payment);
}

export function markPaymentStatus({
  paymentId,
  bookingId,
  status,
  providerReference = "",
  checkoutSessionId = "",
  failureReason = "",
} = {}) {
  const canonicalStatus = normalisePaymentStatus(status);
  const payment =
    db.payments.find((item) => item.id === paymentId) ||
    db.payments.find((item) => item.bookingId === bookingId) ||
    db.payments.find((item) => item.checkoutSessionId === checkoutSessionId) ||
    null;
  if (payment) {
    payment.status = canonicalStatus;
    payment.providerReference = providerReference || payment.providerReference || "";
    payment.checkoutSessionId = checkoutSessionId || payment.checkoutSessionId || "";
    payment.failureReason = failureReason || payment.failureReason || "";
    if (paidPaymentStatuses.has(canonicalStatus)) {
      payment.amountPaid = payment.amount;
      payment.paidAt = payment.paidAt || now();
    }
    if (failedPaymentStatuses.has(canonicalStatus)) {
      payment.cancelledAt = payment.cancelledAt || now();
    }
    if (refundedPaymentStatuses.has(canonicalStatus)) {
      payment.refundedAt = payment.refundedAt || now();
    }
    payment.updatedAt = now();
  }

  const booking = db.bookings.find((item) => item.id === (bookingId || payment?.bookingId));
  if (booking) {
    const bookingStatus = paidPaymentStatuses.has(canonicalStatus)
      ? "confirmed"
      : failedPaymentStatuses.has(canonicalStatus) || refundedPaymentStatuses.has(canonicalStatus)
        ? "cancelled"
        : "payment_pending";
    updateBooking(booking.id, {
      status: bookingStatus,
      paymentStatus: canonicalStatus,
      checkoutSessionId: checkoutSessionId || booking.checkoutSessionId,
      paidAt: paidPaymentStatuses.has(canonicalStatus) ? booking.paidAt || now() : booking.paidAt,
      allowPaidStateTransition: true,
    });
  }

  return { payment: payment ? publicPayment(payment) : null, booking: booking ? publicBooking(booking) : null };
}

export function upsertStripeCheckoutSession(session = {}, status = "payment_pending") {
  const metadata = session.metadata || {};
  const canonicalStatus = normalisePaymentStatus(status);
  const bookingId = metadata.booking_id || session.client_reference_id || "";
  const paymentId = metadata.payment_id || "";
  const vehicleSlug = metadata.vehicle_slug || metadata.vehicle || "";
  if (!bookingId && !paymentId) return { payment: null, booking: null };

  let booking = db.bookings.find((item) => item.id === bookingId);
  if (!booking && bookingId) {
    const vehicle = findVehicle(vehicleSlug);
    const totals = calculateOperationalTotals({
      vehicleSlug: vehicle.slug,
      pickup: metadata.pickup,
      returnDate: metadata.return_date,
      days: 0,
    });
    booking = {
      id: bookingId,
      reference: metadata.booking_reference || referenceFor(vehicle.slug),
      userId: null,
      customerName: metadata.customer_name || session.customer_details?.name || "",
      customerEmail: metadata.customer_email || session.customer_details?.email || session.customer_email || "",
      customerPhone: metadata.customer_phone || session.customer_details?.phone || "",
      vehicleSlug: vehicle.slug,
      vehicleName: metadata.vehicle_name || `${vehicle.name} ${vehicle.year}`,
      status: bookingStatusForPaymentStatus(canonicalStatus),
      paymentStatus: canonicalStatus,
      paymentIntentId: paymentId,
      checkoutSessionId: session.id || "",
      paidAt: paidPaymentStatuses.has(canonicalStatus) ? now() : "",
      pickup: metadata.pickup || "",
      pickupTime: metadata.pickup_time || "",
      return: metadata.return_date || "",
      returnTime: metadata.return_time || "",
      location: metadata.location || "",
      placeId: "",
      lat: "",
      lng: "",
      handoverNotes: "Created from Stripe Checkout webhook/session data.",
      totals: {
        ...totals,
        deposit: Number(metadata.deposit_amount || 0) || totals.deposit,
        hireEstimate: Number(metadata.hire_estimate || 0) || totals.hireEstimate,
      },
      timeline: [
        {
          label: "Stripe Checkout session received",
          at: now(),
        },
      ],
      createdAt: now(),
      updatedAt: now(),
    };
    db.bookings.push(booking);
  }

  let payment = db.payments.find((item) => item.id === paymentId) || db.payments.find((item) => item.checkoutSessionId === session.id);
  if (!payment && paymentId) {
    const amount = Math.round(Number(session.amount_total || 0)) / 100 || Number(metadata.deposit_amount || 0);
    payment = {
      id: paymentId,
      bookingId: booking?.id || bookingId || null,
      amount,
      amountPaid: paidPaymentStatuses.has(canonicalStatus) ? amount : 0,
      currency: String(session.currency || "GBP").toUpperCase(),
      status: canonicalStatus,
      provider: "stripe_checkout",
      providerReference: session.payment_intent || session.id || "",
      checkoutSessionId: session.id || "",
      checkoutUrl: session.url || "",
      paidAt: paidPaymentStatuses.has(canonicalStatus) ? now() : "",
      note: "Created from Stripe Checkout webhook/session data.",
      createdAt: now(),
      updatedAt: now(),
    };
    db.payments.push(payment);
  }

  if (payment) {
    payment.status = canonicalStatus;
    payment.providerReference = session.payment_intent || session.id || payment.providerReference || "";
    payment.checkoutSessionId = session.id || payment.checkoutSessionId || "";
    payment.updatedAt = now();
    if (paidPaymentStatuses.has(canonicalStatus)) {
      payment.amountPaid = payment.amount;
      payment.paidAt = payment.paidAt || now();
    }
  }

  if (booking) {
    updateBooking(booking.id, {
      status: bookingStatusForPaymentStatus(canonicalStatus),
      paymentStatus: canonicalStatus,
      paymentIntentId: payment?.id || paymentId || booking.paymentIntentId,
      checkoutSessionId: session.id || booking.checkoutSessionId,
      paidAt: paidPaymentStatuses.has(canonicalStatus) ? booking.paidAt || now() : booking.paidAt,
      allowPaidStateTransition: true,
    });
  }

  return { payment: payment ? publicPayment(payment) : null, booking: booking ? publicBooking(booking) : null };
}

export function listAllBookings() {
  return db.bookings.slice().reverse().map(publicBooking);
}

export function listPayments() {
  return db.payments.slice().reverse().map(publicPayment);
}

export function adminUpdatePayment(idValue, patch = {}) {
  const payment = db.payments.find((item) => item.id === idValue);
  if (!payment) return null;

  payment.status = normalisePaymentStatus(patch.status || payment.status);
  payment.providerReference = patch.providerReference ?? payment.providerReference ?? "";
  payment.note = patch.note ?? payment.note ?? "";
  payment.failureReason = patch.failureReason ?? payment.failureReason ?? "";
  payment.updatedAt = now();

  if (payment.bookingId) {
    const bookingPatch = { paymentStatus: payment.status };
    if (paidPaymentStatuses.has(payment.status)) {
      payment.amountPaid = payment.amount;
      payment.paidAt = payment.paidAt || now();
      bookingPatch.status = "confirmed";
      bookingPatch.paidAt = now();
    }
    if (failedPaymentStatuses.has(payment.status) || refundedPaymentStatuses.has(payment.status)) {
      bookingPatch.status = "cancelled";
    }
    bookingPatch.allowPaidStateTransition = true;
    updateBooking(payment.bookingId, bookingPatch);
  }

  return publicPayment(payment);
}

export function listCustomers() {
  const registered = db.users.map((user) => {
    const summary = userBookingSummary(user.id, user.email);
    const lastBooking = summary.lastBooking;
    return {
      id: user.id,
      source: "account",
      fullName: user.profile?.fullName || "Velaire Client",
      email: user.email,
      phone: user.phone || "",
      preferredContact: user.profile?.preferredContact || "Email",
      verificationStatus: user.verification?.status || "not_submitted",
      favourites: user.favourites || [],
      totalBookings: summary.totalBookings,
      upcomingBookings: summary.upcomingBookings,
      completedBookings: summary.completedBookings,
      hireValue: summary.hireValue,
      lastBookingReference: lastBooking?.reference || "",
      lastVehicle: lastBooking?.vehicleName || "",
      lastStatus: lastBooking?.status || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

  const registeredEmails = new Set(registered.map((customer) => customer.email));
  const guestByEmail = new Map();

  for (const booking of db.bookings) {
    const email = normaliseEmail(booking.customerEmail);
    if (!email || registeredEmails.has(email)) continue;
    if (!guestByEmail.has(email)) {
      guestByEmail.set(email, {
        id: `guest_${email}`,
        source: "booking",
        fullName: booking.customerName || "Guest client",
        email,
        phone: booking.customerPhone || "",
        preferredContact: "Concierge follow-up",
        verificationStatus: "not_submitted",
        favourites: [],
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        hireValue: 0,
        lastBookingReference: "",
        lastVehicle: "",
        lastStatus: "",
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      });
    }

    const guest = guestByEmail.get(email);
    guest.totalBookings += 1;
    guest.upcomingBookings += isBlockingBookingStatus(booking.status) ? 1 : 0;
    guest.completedBookings += normaliseBookingStatus(booking.status) === "completed" ? 1 : 0;
    guest.hireValue += Number(booking.totals?.hireEstimate || 0);
    guest.lastBookingReference = booking.reference;
    guest.lastVehicle = booking.vehicleName;
    guest.lastStatus = booking.status;
    guest.updatedAt = booking.updatedAt;
  }

  return [...registered, ...guestByEmail.values()].sort((a, b) =>
    String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)),
  );
}

export function createLead({ prompt, recommendedVehicle, alternatives = [], response = "", source = "ai_concierge" }) {
  const lead = {
    id: id("lead"),
    prompt,
    recommendedVehicle,
    alternatives,
    response,
    source,
    status: "new",
    createdAt: now(),
    updatedAt: now(),
  };
  db.leads.push(lead);
  return publicLead(lead);
}

export function listLeads() {
  return db.leads.slice().reverse().map(publicLead);
}

export function updateLead(idValue, patch = {}) {
  const lead = db.leads.find((item) => item.id === idValue);
  if (!lead) return null;
  Object.assign(lead, {
    status: patch.status || lead.status,
    customerEmail: patch.customerEmail ?? lead.customerEmail ?? "",
    customerPhone: patch.customerPhone ?? lead.customerPhone ?? "",
    updatedAt: now(),
  });
  return publicLead(lead);
}

export function adminUpdateBooking(idValue, action, patch = {}) {
  const statusByAction = {
    approve: "confirmed",
    confirm: "confirmed",
    reject: "cancelled",
    cancel: "cancelled",
    complete: "completed",
    pending: "pending",
    payment: "payment_pending",
    payment_pending: "payment_pending",
    paymentPending: "payment_pending",
  };
  const status = statusByAction[action] || patch.status;
  return updateBooking(idValue, {
    ...patch,
    status,
    operationsNote: patch.operationsNote || "",
  });
}

export function updateVehicleOperations(slug, patch = {}) {
  const operations = getVehicleOperations(slug);
  const vehicle = findVehicle(slug);
  operations.rate = Number.isFinite(Number(patch.rate)) ? Math.max(Number(patch.rate), 0) : operations.rate;
  operations.deposit = Number.isFinite(Number(patch.deposit))
    ? Math.max(Number(patch.deposit), 0)
    : operations.deposit;
  operations.availabilityStatus = patch.availabilityStatus || operations.availabilityStatus || "active";
  operations.updatedAt = now();

  return {
    ...vehicle,
    rate: operations.rate,
    deposit: operations.deposit,
    operations,
  };
}

export function blockVehicleDates(slug, { start, end, reason = "Operations block" } = {}) {
  const range = normaliseRange(start, end);
  if (!range) {
    const error = new Error("Choose a valid start date for the vehicle block.");
    error.status = 400;
    error.publicMessage = "Choose a valid start date for the vehicle block.";
    throw error;
  }

  const operations = getVehicleOperations(slug);
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
}

export function removeVehicleBlock(slug, blockId) {
  const operations = getVehicleOperations(slug);
  const before = operations.blockedRanges.length;
  operations.blockedRanges = operations.blockedRanges.filter((block) => block.id !== blockId);
  operations.updatedAt = now();
  return before !== operations.blockedRanges.length;
}

export function adminSummary() {
  const bookings = listAllBookings();
  const payments = listPayments();
  const customers = listCustomers();
  const leads = listLeads();
  return {
    counts: {
      users: db.users.length,
      customers: customers.length,
      bookings: db.bookings.length,
      payments: db.payments.length,
      leads: leads.length,
      needsReply: leads.filter((lead) => ["new", "contacted"].includes(lead.status)).length,
      activeSessions: db.sessions.length,
      pendingBookings: db.bookings.filter((booking) => normaliseBookingStatus(booking.status) === "pending").length,
      paymentPendingBookings: db.bookings.filter(
        (booking) => normaliseBookingStatus(booking.status) === "payment_pending",
      ).length,
      confirmedBookings: db.bookings.filter((booking) => confirmedBookingStatuses.has(booking.status)).length,
    },
    bookingsByStatus: db.bookings.reduce((result, booking) => {
      result[booking.status] = (result[booking.status] || 0) + 1;
      return result;
    }, {}),
    paymentStatus: payments.reduce((result, payment) => {
      result[payment.status] = (result[payment.status] || 0) + 1;
      return result;
    }, {}),
    latestBookings: bookings.slice(0, 10),
    latestCustomers: customers.slice(0, 8),
    latestPayments: payments.slice(0, 8),
    latestLeads: leads.slice(0, 8),
    vehicles: listOperationalVehicles(),
  };
}

function referenceFor(slug) {
  const referenceCodes = {
    "tesla-model-3-performance": "TM3P",
    "lamborghini-urus": "URUS",
    "range-rover-sport-svr": "SVR",
    "bmw-m440i-convertible": "M440",
    "bmw-m140i-shadow-edition": "M140",
  };
  const code = referenceCodes[slug] || slug.split("-")[0].toUpperCase();
  return `VEL-${code}-${String(db.bookings.length + 1087).padStart(4, "0")}`;
}
