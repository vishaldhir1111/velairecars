import { allowMethods, sendJson } from "./_lib/http.js";
import { listOperationalVehicles } from "./_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const { vehicles, meta } = await listOperationalVehicles();
  sendJson(res, 200, {
    fleet: vehicles,
    meta: {
      source: meta.available ? "vercel-kv" : "memory-fallback",
      storageKey: meta.key,
      availabilityMode: "operations-managed-request-to-confirm",
      modelStatus: "3d-ready-with-studio-fallbacks",
    },
  });
}
