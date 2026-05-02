import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { adminAllowed } from "../_lib/admin-auth.js";
import { listStoredOperations, saveVehicleOperationsRecord } from "../_lib/operations-store.js";
import {
  blockVehicleDates,
  listOperationalVehicles,
  mergeVehicleOperationOverrides,
  removeVehicleBlock,
  updateVehicleOperations,
  vehicleOperationsRecord,
} from "../_lib/store.js";

async function operationalVehicleResponse() {
  const storedOperations = await listStoredOperations();
  mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);
  return {
    vehicles: listOperationalVehicles({ externalBookings: storedOperations.bookings || [] }),
    storedOperations,
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH", "POST", "DELETE"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  if (req.method === "GET") {
    const response = await operationalVehicleResponse();
    sendJson(res, 200, { vehicles: response.vehicles });
    return;
  }

  try {
    const body = await readJson(req);
    const slug = body.slug || req.query?.slug;
    if (!slug) {
      sendJson(res, 400, { error: "vehicle_required", message: "Choose a vehicle to update." });
      return;
    }

    const storedOperations = await listStoredOperations();
    mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);

    if (req.method === "POST") {
      const block = blockVehicleDates(slug, body.block || body);
      await saveVehicleOperationsRecord(vehicleOperationsRecord(slug));
      const response = await operationalVehicleResponse();
      sendJson(res, 201, { block, vehicles: response.vehicles });
      return;
    }

    if (req.method === "DELETE") {
      const removed = removeVehicleBlock(slug, body.blockId || req.query?.blockId);
      if (removed) await saveVehicleOperationsRecord(vehicleOperationsRecord(slug));
      const response = await operationalVehicleResponse();
      sendJson(res, removed ? 200 : 404, {
        removed,
        vehicles: response.vehicles,
        message: removed ? "Vehicle block removed." : "Block not found.",
      });
      return;
    }

    const vehicle = updateVehicleOperations(slug, body.patch || body);
    await saveVehicleOperationsRecord(vehicleOperationsRecord(slug));
    const response = await operationalVehicleResponse();
    sendJson(res, 200, { vehicle, vehicles: response.vehicles });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_vehicle_update_failed", message: publicError(error) });
  }
}
