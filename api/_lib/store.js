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
  payment_review: "pending",
  payment_intent_created: "pending",
  checkout_created: "pending",
  pending_approval: "pending",
  pending_payment: "pending",
  approved: "confirmed",
  rejected: "cancelled",
};

const blockingBookingStatuses = new Set(["pending", "confirmed"]);
const confirmedBookingStatuses = new Set(["confirmed"]);
const releasedBookingStatuses = new Set(["draft", "rejected", "cancelled", "completed"]);

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
    provider: payment.provider || "stripe_checkout_ready",
    providerReference: payment.providerReference || "",
    checkoutSessionId: payment.checkoutSessionId || "",
    checkoutUrl: payment.checkoutUrl || "",
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

function normaliseEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
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
      billingPostcode: profile.billingPostcode || "",
      licenceCountry: profile.licenceCountry || "United Kingdom",
      preferredContact: profile.preferredContact || "Email",
    },
    preferences: {
      vehicleCategories: ["Super SUV", "Luxury SUV"],
      handoverType: "Concierge delivery",
      communication: ["Concierge updates"],
      preferredLocation: "",
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

export function createSession(userId) {
  const token = crypto.randomBytes(24).toString("hex");
  const session = {
    token,
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
  if (!session) return null;
  return publicUser(db.users.find((user) => user.id === session.userId));
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

  const { reservation, ...bookingPatch } = patch;
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
  Object.assign(booking, { ...bookingPatch, updatedAt: now() });
  booking.timeline.push({
    label: patch.status ? `Status changed to ${patch.status}` : "Booking updated",
    at: now(),
  });
  return publicBooking(booking);
}

export function listBookings(userId) {
  if (!userId) return [];
  return db.bookings.filter((booking) => booking.userId === userId).map(publicBooking);
}

export function createPaymentIntent({ bookingId, reservation = {} }) {
  const booking = db.bookings.find((item) => item.id === bookingId);
  const totals =
    booking?.totals ||
    calculateOperationalTotals({
      vehicleSlug: reservation.vehicle,
      pickup: reservation.pickup,
      returnDate: reservation.return,
      days: Number.parseInt(reservation.days || "0", 10),
    });
  const payment = {
    id: id("pi"),
    bookingId: booking?.id || null,
    amount: totals.deposit,
    currency: totals.currency || "GBP",
    status: process.env.STRIPE_SECRET_KEY ? "requires_checkout" : "requires_provider",
    provider: "stripe_checkout_ready",
    createdAt: now(),
    note: "Deposit intent created for secure checkout. No card data is stored by Velaire.",
  };
  db.payments.push(payment);
  if (booking) {
    updateBooking(booking.id, {
      status: "payment_intent_created",
      paymentStatus: payment.status,
      paymentIntentId: payment.id,
    });
  }
  return payment;
}

export function attachCheckoutToPayment(paymentId, checkout = {}) {
  const payment = db.payments.find((item) => item.id === paymentId);
  if (!payment) return null;
  Object.assign(payment, {
    checkoutSessionId: checkout.sessionId || payment.checkoutSessionId || null,
    checkoutUrl: checkout.url || payment.checkoutUrl || null,
    status: checkout.status || payment.status,
    updatedAt: now(),
  });

  if (payment.bookingId) {
    updateBooking(payment.bookingId, {
      status: "checkout_created",
      paymentStatus: payment.status,
      checkoutSessionId: payment.checkoutSessionId,
    });
  }
  return payment;
}

export function markPaymentStatus({ paymentId, bookingId, status, providerReference = "" }) {
  const payment =
    db.payments.find((item) => item.id === paymentId) ||
    db.payments.find((item) => item.bookingId === bookingId) ||
    null;
  if (payment) {
    payment.status = status;
    payment.providerReference = providerReference || payment.providerReference || "";
    payment.updatedAt = now();
  }

  const booking = db.bookings.find((item) => item.id === (bookingId || payment?.bookingId));
  if (booking) {
    updateBooking(booking.id, {
      status: status === "paid" ? "pending" : booking.status,
      paymentStatus: status,
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

  payment.status = patch.status || payment.status;
  payment.providerReference = patch.providerReference ?? payment.providerReference ?? "";
  payment.note = patch.note ?? payment.note ?? "";
  payment.updatedAt = now();

  if (payment.bookingId) {
    const bookingPatch = { paymentStatus: payment.status };
    if (payment.status === "paid") bookingPatch.status = "pending";
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
      activeSessions: db.sessions.length,
      pendingBookings: db.bookings.filter((booking) => normaliseBookingStatus(booking.status) === "pending").length,
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
