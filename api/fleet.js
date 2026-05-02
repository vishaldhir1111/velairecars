import { allowMethods, sendJson } from "./_lib/http.js";
import { listStoredOperations } from "./_lib/operations-store.js";
import { listOperationalVehicles, mergeVehicleOperationOverrides } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const storedOperations = await listStoredOperations();
  mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);

  sendJson(res, 200, {
    fleet: listOperationalVehicles({ externalBookings: storedOperations.bookings || [] }),
    meta: {
      source: storedOperations.available ? "operations-store-plus-src-fleet" : "runtime-store-plus-src-fleet",
      availabilityMode: "operations-managed-request-to-confirm",
      modelStatus: "3d-ready-with-studio-fallbacks",
    },
  });
}
