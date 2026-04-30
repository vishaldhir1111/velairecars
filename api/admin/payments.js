import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { adminUpdatePayment, listPayments } from "../_lib/store.js";
import { listStripeOperations, mergeOperations } from "../_lib/stripe-operations.js";

function adminAllowed(req) {
  const expected = process.env.VELAIRE_ADMIN_TOKEN;
  if (!expected) return true;
  return req.headers.authorization === `Bearer ${expected}` || req.headers["x-velaire-admin-token"] === expected;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  if (req.method === "GET") {
    const stripeOperations = await listStripeOperations();
    sendJson(res, 200, {
      payments: mergeOperations(listPayments(), stripeOperations.payments),
      stripeOperations,
      mode: process.env.VELAIRE_ADMIN_TOKEN ? "protected" : "scaffold_open",
    });
    return;
  }

  try {
    const body = await readJson(req);
    const payment = adminUpdatePayment(body.id, body.patch || {});
    if (!payment) {
      sendJson(res, 404, { error: "payment_not_found", message: "Payment record not found." });
      return;
    }
    sendJson(res, 200, { payment });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_payment_update_failed", message: publicError(error) });
  }
}
