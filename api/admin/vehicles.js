import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { blockVehicleDates, listOperationalVehicles, removeVehicleBlock, updateVehicleOperations } from "../_lib/store.js";

function adminAllowed(req) {
  const expected = process.env.VELAIRE_ADMIN_TOKEN;
  if (!expected) return true;
  return req.headers.authorization === `Bearer ${expected}` || req.headers["x-velaire-admin-token"] === expected;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH", "POST", "DELETE"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, { vehicles: listOperationalVehicles() });
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
      const block = blockVehicleDates(slug, body.block || body);
      sendJson(res, 201, { block, vehicles: listOperationalVehicles() });
      return;
    }

    if (req.method === "DELETE") {
      const removed = removeVehicleBlock(slug, body.blockId || req.query?.blockId);
      sendJson(res, removed ? 200 : 404, {
        removed,
        vehicles: listOperationalVehicles(),
        message: removed ? "Vehicle block removed." : "Block not found.",
      });
      return;
    }

    const vehicle = updateVehicleOperations(slug, body.patch || body);
    sendJson(res, 200, { vehicle, vehicles: listOperationalVehicles() });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_vehicle_update_failed", message: publicError(error) });
  }
}
