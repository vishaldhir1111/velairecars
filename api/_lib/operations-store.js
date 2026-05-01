import { customersFromBookings, mergeCustomers, mergeOperations, recordsFromStripeSession } from "./stripe-operations.js";

const defaultPrefix = "velaire:operations:guest-booking-v1";

function config() {
  const configuredPrefix = process.env.VELAIRE_STORE_PREFIX || defaultPrefix;
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
    prefix: configuredPrefix.includes("guest-booking-v1") ? configuredPrefix : `${configuredPrefix}:guest-booking-v1`,
  };
}

export function operationsStoreConfigured() {
  const { url, token } = config();
  return Boolean(url && token);
}

function key(name) {
  return `${config().prefix}:${name}`;
}

async function redisCommand(command) {
  const { url, token } = config();
  if (!url || !token) {
    const error = new Error("Operations store is not configured.");
    error.status = 503;
    error.publicMessage = "Operations data store is not configured. Add Vercel KV or Upstash Redis REST variables.";
    throw error;
  }

  const response = await fetch(url.replace(/\/$/, ""), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    const error = new Error(data.error || "Operations store request failed.");
    error.status = response.status || 500;
    error.publicMessage = data.error || "Operations data store request failed.";
    throw error;
  }
  return data.result;
}

function parseJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseValues(result) {
  if (!result) return [];
  const values = Array.isArray(result) ? result : Object.values(result);
  return values.map(parseJson).filter(Boolean);
}

async function hsetJson(hash, field, value) {
  if (!field || !value) return null;
  return redisCommand(["HSET", hash, field, JSON.stringify(value)]);
}

async function hgetJson(hash, field) {
  if (!field) return null;
  return parseJson(await redisCommand(["HGET", hash, field]));
}

async function hvalsJson(hash) {
  return parseValues(await redisCommand(["HVALS", hash]));
}

function bookingStatusForPayment(status) {
  if (status === "deposit_paid") return "confirmed";
  if (["failed", "cancelled", "refunded"].includes(status)) return "cancelled";
  return "payment_pending";
}

export async function saveOperationsRecords({ booking, payment, customers = [] } = {}) {
  if (!operationsStoreConfigured()) return { saved: false, reason: "operations_store_not_configured" };

  try {
    const writes = [];
    if (booking?.id) writes.push(hsetJson(key("bookings"), booking.id, booking));
    if (payment?.id) writes.push(hsetJson(key("payments"), payment.id, payment));
    for (const customer of customers) {
      const customerKey = String(customer.email || customer.id || "").toLowerCase();
      if (customerKey) writes.push(hsetJson(key("customers"), customerKey, customer));
    }
    await Promise.all(writes);
    return { saved: true };
  } catch (error) {
    return { saved: false, reason: error.publicMessage || error.message || "operations_store_write_failed" };
  }
}

export async function saveStripeOperationsSession(session = {}, status = "") {
  const records = recordsFromStripeSession(session, status);
  const persistence = await saveOperationsRecords(records);
  return { ...records, persistence };
}

export async function updateStoredPaymentStatus({
  paymentId = "",
  bookingId = "",
  status = "payment_pending",
  providerReference = "",
  failureReason = "",
} = {}) {
  if (!operationsStoreConfigured()) return { saved: false, reason: "operations_store_not_configured" };

  try {
    const updates = [];
    const payment = await hgetJson(key("payments"), paymentId);
    if (payment) {
      payment.status = status;
      payment.providerReference = providerReference || payment.providerReference || "";
      payment.failureReason = failureReason || payment.failureReason || "";
      payment.updatedAt = new Date().toISOString();
      if (status === "deposit_paid") {
        payment.amountPaid = payment.amount;
        payment.paidAt = payment.paidAt || payment.updatedAt;
      }
      if (status === "cancelled" || status === "failed") payment.cancelledAt = payment.cancelledAt || payment.updatedAt;
      if (status === "refunded") payment.refundedAt = payment.refundedAt || payment.updatedAt;
      updates.push(hsetJson(key("payments"), payment.id, payment));
    }

    const booking = await hgetJson(key("bookings"), bookingId || payment?.bookingId);
    if (booking) {
      booking.status = bookingStatusForPayment(status);
      booking.paymentStatus = status;
      booking.updatedAt = new Date().toISOString();
      if (status === "deposit_paid") booking.paidAt = booking.paidAt || booking.updatedAt;
      updates.push(hsetJson(key("bookings"), booking.id, booking));
      for (const customer of customersFromBookings([booking])) {
        updates.push(hsetJson(key("customers"), String(customer.email || customer.id || "").toLowerCase(), customer));
      }
    }

    await Promise.all(updates);
    return { saved: updates.length > 0 };
  } catch (error) {
    return { saved: false, reason: error.publicMessage || error.message || "operations_store_update_failed" };
  }
}

export async function updateStoredBookingStatus({ bookingId = "", status = "pending", action = "", note = "" } = {}) {
  if (!operationsStoreConfigured() || !bookingId) return { saved: false, reason: "operations_store_not_configured" };
  const booking = await hgetJson(key("bookings"), bookingId);
  if (!booking) return { saved: false, reason: "booking_not_found" };

  const updatedAt = new Date().toISOString();
  booking.status = status;
  booking.updatedAt = updatedAt;
  booking.operationsNote = note || booking.operationsNote || "";
  booking.timeline = [
    ...(booking.timeline || []),
    {
      label: action ? `Operations marked ${action}` : `Booking marked ${status}`,
      at: updatedAt,
    },
  ];

  await hsetJson(key("bookings"), booking.id, booking);
  for (const customer of customersFromBookings([booking])) {
    await hsetJson(key("customers"), String(customer.email || customer.id || "").toLowerCase(), customer);
  }
  return { saved: true, booking };
}

export async function saveNotificationRecord(notification = {}) {
  if (!operationsStoreConfigured() || !notification.id) return { saved: false, reason: "operations_store_not_configured" };
  await hsetJson(key("notifications"), notification.id, notification);
  return { saved: true, notification };
}

export async function listStoredNotifications() {
  if (!operationsStoreConfigured()) return [];
  return hvalsJson(key("notifications"));
}

export async function getStoredCustomerContext(email = "") {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!operationsStoreConfigured() || !cleanEmail) {
    return { bookings: [], payments: [], customer: null, available: false };
  }
  const operations = await listStoredOperations();
  const bookings = operations.bookings.filter((booking) => String(booking.customerEmail || "").toLowerCase() === cleanEmail);
  const bookingIds = new Set(bookings.map((booking) => booking.id));
  const payments = operations.payments.filter(
    (payment) =>
      bookingIds.has(payment.bookingId) || String(payment.customerEmail || "").toLowerCase() === cleanEmail,
  );
  const customer =
    operations.customers.find((item) => String(item.email || "").toLowerCase() === cleanEmail) ||
    customersFromBookings(bookings)[0] ||
    null;
  return { bookings, payments, customer, available: operations.available };
}

export async function findPaidDeposit({ bookingId = "", email = "", vehicle = "", pickup = "", returnDate = "" } = {}) {
  if (!operationsStoreConfigured()) return null;
  const operations = await listStoredOperations();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const booking = operations.bookings.find((item) => {
    if (bookingId && item.id === bookingId) return item.paymentStatus === "deposit_paid";
    const sameClient = cleanEmail && String(item.customerEmail || "").toLowerCase() === cleanEmail;
    const sameVehicle = !vehicle || item.vehicleSlug === vehicle;
    const samePickup = !pickup || item.pickup === pickup;
    const sameReturn = !returnDate || item.return === returnDate;
    return sameClient && sameVehicle && samePickup && sameReturn && item.paymentStatus === "deposit_paid";
  });
  const payment = operations.payments.find((item) => {
    if (booking?.id && item.bookingId === booking.id && item.status === "deposit_paid") return true;
    if (bookingId && item.bookingId === bookingId && item.status === "deposit_paid") return true;
    const sameClient = cleanEmail && String(item.customerEmail || "").toLowerCase() === cleanEmail;
    const sameVehicle = !vehicle || item.vehicleSlug === vehicle || booking?.vehicleSlug === vehicle;
    const samePickup = !pickup || item.pickup === pickup || booking?.pickup === pickup;
    const sameReturn = !returnDate || item.return === returnDate || booking?.return === returnDate;
    return !bookingId && sameClient && sameVehicle && samePickup && sameReturn && item.status === "deposit_paid";
  });
  if (!booking && !payment) return null;
  return { booking, payment };
}

export async function findActiveReservation({ bookingId = "", email = "", vehicle = "", pickup = "", returnDate = "" } = {}) {
  if (!operationsStoreConfigured()) return null;
  const operations = await listStoredOperations();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const released = new Set(["cancelled", "completed", "rejected"]);
  const booking = operations.bookings.find((item) => {
    const status = String(item.status || "").toLowerCase();
    if (released.has(status)) return false;
    if (bookingId && item.id === bookingId) return true;
    const sameClient = cleanEmail && String(item.customerEmail || "").toLowerCase() === cleanEmail;
    const sameVehicle = !vehicle || item.vehicleSlug === vehicle;
    const samePickup = pickup ? item.pickup === pickup : true;
    const sameReturn = returnDate ? item.return === returnDate : true;
    return sameClient && sameVehicle && samePickup && sameReturn;
  });
  if (!booking) return null;
  const payment = operations.payments.find((item) => item.bookingId === booking.id) || null;
  return { booking, payment };
}

export async function saveAccountRecord(user = {}) {
  const email = String(user.email || "").trim().toLowerCase();
  if (!operationsStoreConfigured() || !email) return { saved: false, reason: "operations_store_not_configured" };
  try {
    const account = {
      id: user.id || `account_${email}`,
      email,
      phone: user.phone || "",
      profile: user.profile || {},
      preferences: user.preferences || {},
      verification: user.verification || {},
      favourites: user.favourites || [],
      updatedAt: new Date().toISOString(),
    };
    await hsetJson(key("accounts"), email, account);
    return { saved: true, account };
  } catch (error) {
    return { saved: false, reason: error.publicMessage || error.message || "account_store_write_failed" };
  }
}

export async function saveAuthUserRecord(user = {}) {
  const email = String(user.email || "").trim().toLowerCase();
  if (!operationsStoreConfigured() || !email || !user.password?.hash || !user.password?.salt) {
    return { saved: false, reason: "auth_record_incomplete_or_store_not_configured" };
  }
  try {
    const record = {
      id: user.id || `account_${email}`,
      email,
      phone: user.phone || "",
      password: user.password,
      profile: user.profile || {},
      preferences: user.preferences || {},
      verification: user.verification || {},
      paymentMethod: user.paymentMethod || null,
      favourites: user.favourites || [],
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await hsetJson(key("auth-users"), email, record);
    return { saved: true, record };
  } catch (error) {
    return { saved: false, reason: error.publicMessage || error.message || "auth_store_write_failed" };
  }
}

export async function getAuthUserRecord(email = "") {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!operationsStoreConfigured() || !cleanEmail) return null;
  try {
    return await hgetJson(key("auth-users"), cleanEmail);
  } catch {
    return null;
  }
}

export async function getStoredAccountRecord(email = "") {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!operationsStoreConfigured() || !cleanEmail) return null;
  try {
    return await hgetJson(key("accounts"), cleanEmail);
  } catch {
    return null;
  }
}

export async function listStoredOperations() {
  if (!operationsStoreConfigured()) {
    return {
      bookings: [],
      payments: [],
      customers: [],
      notifications: [],
      available: false,
      reason: "operations_store_not_configured",
    };
  }

  try {
    const [bookings, payments, customers, notifications] = await Promise.all([
      hvalsJson(key("bookings")),
      hvalsJson(key("payments")),
      hvalsJson(key("customers")),
      hvalsJson(key("notifications")),
    ]);
    return {
      bookings: mergeOperations([], bookings),
      payments: mergeOperations([], payments),
      customers: mergeCustomers([], customers),
      notifications,
      available: true,
      reason: "",
    };
  } catch (error) {
    return {
      bookings: [],
      payments: [],
      customers: [],
      notifications: [],
      available: false,
      reason: error.publicMessage || error.message || "operations_store_unavailable",
    };
  }
}
