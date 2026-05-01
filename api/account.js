import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { getStoredAccountRecord, getStoredCustomerContext, saveAccountRecord } from "./_lib/operations-store.js";
import { currentUser, listBookings, updateAccount } from "./_lib/store.js";
import { listStripeOperations, mergeOperations } from "./_lib/stripe-operations.js";

function mergeStoredAccount(user, storedAccount) {
  if (!storedAccount) return user;
  return {
    ...user,
    phone: user.phone || storedAccount.phone || "",
    profile: { ...(user.profile || {}), ...(storedAccount.profile || {}) },
    preferences: { ...(user.preferences || {}), ...(storedAccount.preferences || {}) },
    verification: { ...(user.verification || {}), ...(storedAccount.verification || {}) },
    favourites: storedAccount.favourites?.length ? storedAccount.favourites : user.favourites,
  };
}

async function getCustomerPaymentContext(email = "") {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const storedContext = await getStoredCustomerContext(cleanEmail);
  const stripeOperations = await listStripeOperations();
  if (!stripeOperations.available || !cleanEmail) return storedContext;

  const stripeBookings = stripeOperations.bookings.filter((booking) => String(booking.customerEmail || "").toLowerCase() === cleanEmail);
  const bookingIds = new Set([...storedContext.bookings, ...stripeBookings].map((booking) => booking.id));
  const stripePayments = stripeOperations.payments.filter(
    (payment) => bookingIds.has(payment.bookingId) || String(payment.customerEmail || "").toLowerCase() === cleanEmail,
  );
  return {
    bookings: mergeOperations(storedContext.bookings, stripeBookings),
    payments: mergeOperations(storedContext.payments, stripePayments),
    customer:
      storedContext.customer ||
      stripeOperations.customers.find((item) => String(item.email || "").toLowerCase() === cleanEmail) ||
      null,
    available: storedContext.available || stripeOperations.available,
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  const user = currentUser(req);
  if (!user) {
    if (req.method === "GET" && req.query?.email) {
      const email = String(req.query.email || "").trim().toLowerCase();
      const storedAccount = await getStoredAccountRecord(email);
      const storedContext = await getCustomerPaymentContext(email);
      sendJson(res, 200, {
        user: storedAccount || {
          id: `stored_${email}`,
          email,
          phone: storedContext.customer?.phone || "",
          profile: { fullName: storedContext.customer?.fullName || "" },
          preferences: {},
          verification: { status: storedContext.customer?.verificationStatus || "not_submitted", documents: {} },
          favourites: [],
        },
        bookings: storedContext.bookings,
        payments: storedContext.payments,
        receipts: storedContext.payments.filter((payment) => ["deposit_paid", "refunded"].includes(payment.status)),
        storedCustomer: storedContext.customer,
        authenticated: false,
      });
      return;
    }
    sendJson(res, 401, { error: "unauthenticated", message: "Sign in to access the Velaire client lounge." });
    return;
  }

  if (req.method === "GET") {
    const storedAccount = await getStoredAccountRecord(user.email);
    const accountUser = mergeStoredAccount(user, storedAccount);
    const storedContext = await getCustomerPaymentContext(user.email);
    sendJson(res, 200, {
      user: accountUser,
      bookings: [...listBookings(user.id), ...storedContext.bookings],
      payments: storedContext.payments,
      receipts: storedContext.payments.filter((payment) => ["deposit_paid", "refunded"].includes(payment.status)),
      storedCustomer: storedContext.customer,
    });
    return;
  }

  try {
    const body = await readJson(req);
    const updated = updateAccount(user.id, body);
    await saveAccountRecord(updated);
    sendJson(res, 200, {
      user: updated,
      bookings: listBookings(user.id),
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "account_update_failed", message: publicError(error) });
  }
}
