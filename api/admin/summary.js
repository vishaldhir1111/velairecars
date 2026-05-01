import { allowMethods, sendJson } from "../_lib/http.js";
import { adminAllowed, adminMode } from "../_lib/admin-auth.js";
import { listStoredOperations } from "../_lib/operations-store.js";
import { adminSummary, listAllBookings, listCustomers, listPayments } from "../_lib/store.js";
import { listStripeOperations, mergeCustomers, mergeOperations } from "../_lib/stripe-operations.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  const localSummary = adminSummary();
  const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
  const bookings = mergeOperations(mergeOperations(listAllBookings(), storedOperations.bookings), stripeOperations.bookings);
  const payments = mergeOperations(mergeOperations(listPayments(), storedOperations.payments), stripeOperations.payments);
  const customers = mergeCustomers(mergeCustomers(listCustomers(), storedOperations.customers), stripeOperations.customers);
  const notifications = [...(storedOperations.notifications || [])].sort((a, b) =>
    String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")),
  );
  const summary = {
    ...localSummary,
    counts: {
      ...localSummary.counts,
      bookings: bookings.length,
      payments: payments.length,
      customers: customers.length,
      notifications: notifications.length,
      failedNotifications: notifications.filter((item) => item.status === "failed").length,
      pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
      paymentPendingBookings: bookings.filter((booking) => booking.status === "payment_pending").length,
      confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
      needsReply: localSummary.counts.needsReply,
    },
    latestBookings: bookings.slice(0, 10),
    latestPayments: payments.slice(0, 8),
    latestCustomers: customers.slice(0, 8),
    latestNotifications: notifications.slice(0, 8),
    stripeOperations: {
      available: stripeOperations.available,
      reason: stripeOperations.reason,
      payments: stripeOperations.payments.length,
    },
    storedOperations: {
      available: storedOperations.available,
      reason: storedOperations.reason,
      payments: storedOperations.payments.length,
    },
  };

  sendJson(res, 200, {
    operationsMode: adminMode(),
    summary,
    nextProductionStep: "Use Stripe Checkout as the durable payment ledger now; replace the in-memory reservation scaffold with Postgres, Neon, Supabase or another durable database for full production history.",
  });
}
