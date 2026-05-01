import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { getStoredAccountRecord, getStoredCustomerContext, saveAccountRecord } from "./_lib/operations-store.js";
import { currentUser, listBookings, updateAccount } from "./_lib/store.js";

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

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  const user = currentUser(req);
  if (!user) {
    sendJson(res, 401, { error: "unauthenticated", message: "Sign in to access the Velaire client lounge." });
    return;
  }

  if (req.method === "GET") {
    const storedAccount = await getStoredAccountRecord(user.email);
    const accountUser = mergeStoredAccount(user, storedAccount);
    const storedContext = await getStoredCustomerContext(user.email);
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
