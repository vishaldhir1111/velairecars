import { allowMethods, sendJson } from "./_lib/http.js";
import { listOperationalVehicles } from "./_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const { vehicles, meta } = await listOperationalVehicles();
  sendJson(res, 200, {
    fleet: vehicles.map(sanitisePublicFleetVehicle),
    meta: {
      source: meta.available ? "vercel-kv" : "memory-fallback",
      storageKey: meta.key,
      availabilityMode: "operations-managed-request-to-confirm",
      modelStatus: "3d-ready-with-studio-fallbacks",
    },
  });
}

function sanitisePublicFleetVehicle(vehicle = {}) {
  const { operations, availability = {}, ...publicVehicle } = vehicle;
  return {
    ...publicVehicle,
    availability: {
      status: availability.status || "request-to-confirm",
      leadTimeHours: availability.leadTimeHours,
      minimumAge: availability.minimumAge,
      deposit: availability.deposit,
      preventDoubleBooking: Boolean(availability.preventDoubleBooking),
      blockedRanges: publicRanges(availability.blockedRanges, "blocked_date"),
      pendingBookings: publicRanges(availability.pendingBookings, "pending_booking"),
      confirmedBookings: publicRanges(availability.confirmedBookings, "confirmed_booking"),
    },
  };
}

function publicRanges(ranges = [], type) {
  return (Array.isArray(ranges) ? ranges : [])
    .map((range, index) => ({
      id: `${type}_${index + 1}`,
      type,
      start: range.start || range.pickup || "",
      end: range.end || range.return || "",
      status: range.status || type,
    }))
    .filter((range) => range.start && range.end);
}
