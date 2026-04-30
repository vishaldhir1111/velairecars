import crypto from "node:crypto";
import { calculateBookingTotals, findVehicle } from "./fleet-data.js";
import { parseCookies } from "./http.js";

const initialState = {
  users: [],
  sessions: [],
  bookings: [],
  payments: [],
};

const db = (globalThis.__VELAIRE_STORE__ ||= structuredClone(initialState));

function now() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
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

export function createBooking({ userId = null, reservation = {}, status = "draft" }) {
  const totals = calculateBookingTotals({
    vehicleSlug: reservation.vehicle,
    pickup: reservation.pickup,
    returnDate: reservation.return,
    days: Number.parseInt(reservation.days || "0", 10),
  });
  const vehicle = findVehicle(reservation.vehicle);
  const booking = {
    id: id("bok"),
    reference: referenceFor(vehicle.slug),
    userId,
    vehicleSlug: vehicle.slug,
    vehicleName: `${vehicle.name} ${vehicle.year}`,
    status,
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
  return booking;
}

export function updateBooking(idValue, patch = {}) {
  const booking = db.bookings.find((item) => item.id === idValue);
  if (!booking) return null;

  const { reservation, ...bookingPatch } = patch;
  if (reservation) {
    const totals = calculateBookingTotals({
      vehicleSlug: reservation.vehicle || booking.vehicleSlug,
      pickup: reservation.pickup || booking.pickup,
      returnDate: reservation.return || booking.return,
      days: Number.parseInt(reservation.days || String(booking.totals?.days || 0), 10),
    });
    Object.assign(booking, {
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

  Object.assign(booking, { ...bookingPatch, updatedAt: now() });
  booking.timeline.push({
    label: patch.status ? `Status changed to ${patch.status}` : "Booking updated",
    at: now(),
  });
  return booking;
}

export function listBookings(userId) {
  if (!userId) return [];
  return db.bookings.filter((booking) => booking.userId === userId);
}

export function createPaymentIntent({ bookingId, reservation = {} }) {
  const booking = db.bookings.find((item) => item.id === bookingId);
  const totals =
    booking?.totals ||
    calculateBookingTotals({
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
    status: "requires_provider",
    provider: "future-stripe",
    createdAt: now(),
    note: "Deposit intent scaffold only. No card data is stored by Velaire.",
  };
  db.payments.push(payment);
  if (booking) updateBooking(booking.id, { status: "payment_intent_created", paymentIntentId: payment.id });
  return payment;
}

export function adminSummary() {
  return {
    counts: {
      users: db.users.length,
      bookings: db.bookings.length,
      payments: db.payments.length,
      activeSessions: db.sessions.length,
    },
    bookingsByStatus: db.bookings.reduce((result, booking) => {
      result[booking.status] = (result[booking.status] || 0) + 1;
      return result;
    }, {}),
    latestBookings: db.bookings.slice(-10).reverse(),
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
