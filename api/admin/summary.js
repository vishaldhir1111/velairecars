import { allowMethods, sendJson } from "../_lib/http.js";
import { adminSummary, listAllBookings, listCustomers, listPayments } from "../_lib/store.js";
import { listStripeOperations, mergeCustomers, mergeOperations } from "../_lib/stripe-operations.js";

function adminAllowed(req) {
  const expected = process.env.VELAIRE_ADMIN_TOKEN;
  if (!expected) return true;
  return req.headers.authorization === `Bearer ${expected}` || req.headers["x-velaire-admin-token"] === expected;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  const localSummary = adminSummary();
  const stripeOperations = await listStripeOperations();
  const bookings = mergeOperations(listAllBookings(), stripeOperations.bookings);
  const payments = mergeOperations(listPayments(), stripeOperations.payments);
  const customers = mergeCustomers(listCustomers(), stripeOperations.customers);
  const summary = {
    ...localSummary,
    counts: {
      ...localSummary.counts,
      bookings: bookings.length,
      payments: payments.length,
      customers: customers.length,
      pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
      paymentPendingBookings: bookings.filter((booking) => booking.status === "payment_pending").length,
      confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
    },
    latestBookings: bookings.slice(0, 10),
    latestPayments: payments.slice(0, 8),
    latestCustomers: customers.slice(0, 8),
    stripeOperations: {
      available: stripeOperations.available,
      reason: stripeOperations.reason,
      payments: stripeOperations.payments.length,
    },
  };

  sendJson(res, 200, {
    operationsMode: process.env.VELAIRE_ADMIN_TOKEN ? "protected" : "scaffold_open",
    summary,
    nextProductionStep: "Use Stripe Checkout as the durable payment ledger now; replace the in-memory reservation scaffold with Postgres, Neon, Supabase or another durable database for full production history.",
  });
}
