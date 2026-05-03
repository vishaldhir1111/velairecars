import { adminAllowed } from "../_lib/admin-auth.js";
import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import {
  blockVehicleDates,
  listOperationalVehiclesFromState,
  listOperationalVehicles,
  removeVehicleBlock,
  updateVehicleOperationsRecord,
} from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH", "POST", "DELETE"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Operations password required." });
    return;
  }

  if (req.method === "GET") {
    const { vehicles, meta } = await listOperationalVehicles();
    sendJson(res, 200, { vehicles, meta });
    return;
  }

  try {
    const body = await readJson(req);
    const slug = body.slug || req.query?.slug;
    if (!slug) {
      sendJson(res, 400, { error: "vehicle_required", message: "Choose a vehicle to update." });
      return;
    }

    if (req.method === "POST") {
      const { block, state, persistence } = await blockVehicleDates(slug, body.block || body);
      const vehicles = listOperationalVehiclesFromState(state);
      sendJson(res, 201, { block, vehicles, persistence });
      return;
    }

    if (req.method === "DELETE") {
      const { removed, state, persistence } = await removeVehicleBlock(slug, body.blockId || req.query?.blockId);
      const vehicles = listOperationalVehiclesFromState(state);
      sendJson(res, removed ? 200 : 404, { removed, vehicles, persistence, message: removed ? "Vehicle block removed." : "Block not found." });
      return;
    }

    const { vehicle, state, persistence } = await updateVehicleOperationsRecord(slug, body.patch || body);
    const vehicles = listOperationalVehiclesFromState(state);
    sendJson(res, 200, { vehicle, vehicles, persistence });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_vehicle_update_failed", message: publicError(error) });
  }
}
