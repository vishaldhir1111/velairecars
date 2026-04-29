import { fleetData } from "./_lib/fleet-data.js";
import { allowMethods, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  sendJson(res, 200, {
    fleet: fleetData,
    meta: {
      source: "src/data/fleet.js",
      availabilityMode: "request-to-confirm",
      modelStatus: "3d-ready-with-studio-fallbacks",
    },
  });
}
