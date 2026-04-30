import { allowMethods, sendJson } from "./_lib/http.js";
import { listOperationalVehicles } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  sendJson(res, 200, {
    fleet: listOperationalVehicles(),
    meta: {
      source: "src/data/fleet.js",
      availabilityMode: "operations-managed-request-to-confirm",
      modelStatus: "3d-ready-with-studio-fallbacks",
    },
  });
}
