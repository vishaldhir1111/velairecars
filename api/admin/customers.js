import { allowMethods, sendJson } from "../_lib/http.js";
import { listCustomers } from "../_lib/store.js";
import { listStripeOperations, mergeCustomers } from "../_lib/stripe-operations.js";

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

  const stripeOperations = await listStripeOperations();
  sendJson(res, 200, {
    customers: mergeCustomers(listCustomers(), stripeOperations.customers),
    stripeOperations,
    mode: process.env.VELAIRE_ADMIN_TOKEN ? "protected" : "scaffold_open",
  });
}
