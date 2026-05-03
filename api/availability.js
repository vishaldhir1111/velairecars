import { allowMethods, readJson, sendJson } from "./_lib/http.js";
import { checkPersistedAvailability } from "./_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const body = req.method === "POST" ? await readJson(req) : {};
  const query = req.query || {};
  const vehicle = String(body.vehicle || query.vehicle || "").trim();
  const pickup = body.pickup || query.pickup || "";
  const returnDate = body.return || query.return || "";

  if (!vehicle) {
    sendJson(res, 400, {
      error: "vehicle_required",
      message: "Select a Velaire vehicle before checking availability.",
    });
    return;
  }

  try {
    const { availability, meta } = await checkPersistedAvailability({ vehicleSlug: vehicle, pickup, returnDate });

    sendJson(res, 200, {
      vehicle: availability.vehicle.slug,
      status: availability.status,
      available: availability.available,
      message: availability.message,
      conflicts: availability.conflicts,
      deposit: availability.vehicle.deposit,
      dailyRate: availability.vehicle.rate,
      currency: "GBP",
      source: meta.available ? "vercel-kv" : "memory-fallback",
    });
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.code || "availability_failed",
      message: error.publicMessage || error.message || "Availability could not be checked.",
    });
  }
}
