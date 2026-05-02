import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { adminAllowed } from "../_lib/admin-auth.js";
import { listStoredOperations, saveVehicleOperationsRecord } from "../_lib/operations-store.js";
import { listStripeOperations, mergeOperations } from "../_lib/stripe-operations.js";
import {
  blockVehicleDates,
  listOperationalVehicles,
  mergeVehicleOperationOverrides,
  removeVehicleBlock,
  updateVehicleOperations,
  vehicleOperationsRecord,
} from "../_lib/store.js";

async function operationalVehicleResponse() {
  const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
  mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);
  const bookings = mergeOperations(storedOperations.bookings || [], stripeOperations.bookings || []);
  return {
    vehicles: listOperationalVehicles({ externalBookings: bookings }),
    storedOperations,
    stripeOperations,
  };
}

async function persistVehicleOperationsOrThrow(slug) {
  const persistence = await saveVehicleOperationsRecord(vehicleOperationsRecord(slug));
  if (!persistence.saved) {
    const error = new Error(
      "Operations storage is not connected. Add Vercel KV/Upstash Redis variables or a valid Stripe secret key so admin changes can control the live site.",
    );
    error.status = 503;
    error.publicMessage =
      "Operations storage is not connected. Admin changes were not saved to the live booking source of truth.";
    throw error;
  }
  return persistence;
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
      const persistence = await persistVehicleOperationsOrThrow(slug);
      const response = await operationalVehicleResponse();
      sendJson(res, 201, { block, vehicles: response.vehicles, persistence });
      return;
    }

    if (req.method === "DELETE") {
      const removed = removeVehicleBlock(slug, body.blockId || req.query?.blockId);
      const persistence = removed ? await persistVehicleOperationsOrThrow(slug) : { saved: false, reason: "block_not_found" };
      const response = await operationalVehicleResponse();
      sendJson(res, removed ? 200 : 404, {
        removed,
        vehicles: response.vehicles,
        persistence,
        message: removed ? "Vehicle block removed." : "Block not found.",
      });
      return;
    }

    const vehicle = updateVehicleOperations(slug, body.patch || body);
    const persistence = await persistVehicleOperationsOrThrow(slug);
    const response = await operationalVehicleResponse();
    sendJson(res, 200, { vehicle, vehicles: response.vehicles, persistence });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_vehicle_update_failed", message: publicError(error) });
  }
}
