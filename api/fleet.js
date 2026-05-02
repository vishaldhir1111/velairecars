import { allowMethods, sendJson } from "./_lib/http.js";
import { listStoredOperations } from "./_lib/operations-store.js";
import { listStripeOperations, mergeOperations } from "./_lib/stripe-operations.js";
import { listOperationalVehicles, mergeVehicleOperationOverrides } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
  mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);
  const bookings = mergeOperations(storedOperations.bookings || [], stripeOperations.bookings || []);

  sendJson(res, 200, {
    fleet: listOperationalVehicles({ externalBookings: bookings }),
    meta: {
      source: storedOperations.available ? "operations-store-plus-stripe-ledger" : "stripe-metadata-plus-src-fleet",
      availabilityMode: "operations-managed-request-to-confirm",
      modelStatus: "3d-ready-with-studio-fallbacks",
      operationsStore: storedOperations.reason || "connected",
      stripeLedger: stripeOperations.available ? "connected" : stripeOperations.reason,
    },
  });
}
