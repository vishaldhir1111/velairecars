import { allowMethods, sendJson } from "../_lib/http.js";
import { adminAllowed, adminMode } from "../_lib/admin-auth.js";
import { listStoredOperations } from "../_lib/operations-store.js";
import { listCustomers } from "../_lib/store.js";
import { listStripeOperations, mergeCustomers } from "../_lib/stripe-operations.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
  sendJson(res, 200, {
    customers: mergeCustomers(mergeCustomers(listCustomers(), storedOperations.customers), stripeOperations.customers),
    storedOperations,
    stripeOperations,
    mode: adminMode(),
  });
}
