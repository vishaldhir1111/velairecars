import { conciergeFleetKnowledge, fleet } from "../../src/data/fleet.js";

export const fleetData = fleet.map((vehicle) => ({
  slug: vehicle.slug,
  name: vehicle.name,
  year: vehicle.year,
  category: vehicle.category,
  finish: vehicle.finish,
  paint: vehicle.paint,
  interior: vehicle.interior,
  rate: vehicle.rate,
  deposit: vehicle.deposit,
  specs: vehicle.specs,
  bestFor: vehicle.bestFor,
  summary: vehicle.summary,
  modelType: vehicle.modelType,
  modelPath: vehicle.asset.modelPath,
  fallbackImagePath: vehicle.asset.fallbackImagePath,
  modelAvailable: vehicle.asset.modelAvailable,
  viewerMode: vehicle.asset.viewerMode,
  alt: vehicle.asset.alt,
  availability: {
    status: "request-to-confirm",
    leadTimeHours: vehicle.slug === "lamborghini-urus" ? 24 : 12,
    minimumAge: vehicle.rate >= 495 ? 25 : 23,
    deposit: vehicle.deposit,
    blockedRanges: seedBlockedRanges(vehicle.slug),
    pendingBookings: [],
    confirmedBookings: [],
    preventDoubleBooking: true,
  },
}));

export const conciergeKnowledge = conciergeFleetKnowledge;

export function vehicleSlugExists(slug) {
  return fleetData.some((vehicle) => vehicle.slug === slug);
}

export function findVehicle(slug) {
  return fleetData.find((vehicle) => vehicle.slug === slug) || fleetData[0];
}

export function requireVehicle(slug) {
  const clean = String(slug || "").trim();
  const vehicle = fleetData.find((item) => item.slug === clean);
  if (vehicle) return vehicle;
  const error = new Error(clean ? "That Velaire vehicle could not be found." : "Select a Velaire vehicle before reserving.");
  error.status = 400;
  error.code = clean ? "vehicle_not_found" : "vehicle_required";
  error.publicMessage = clean
    ? "That Velaire vehicle could not be found. Please choose from the live fleet."
    : "Select a Velaire vehicle before reserving.";
  throw error;
}

export function calculateBookingTotals({ vehicleSlug, pickup, returnDate, days }) {
  const vehicle = requireVehicle(vehicleSlug);
  const rentalDays = Number.isFinite(Number(days))
    ? Math.max(Number(days), 1)
    : calculateDays(pickup, returnDate) || 2;

  return {
    vehicle,
    days: rentalDays,
    hireEstimate: vehicle.rate * rentalDays,
    deposit: vehicle.deposit,
    currency: "GBP",
  };
}

function seedBlockedRanges(slug) {
  const seededBlocks = {
    "lamborghini-urus": [
      {
        id: "blk_urus_detailing",
        start: "2026-06-08",
        end: "2026-06-10",
        reason: "Scheduled detailing and inspection",
      },
    ],
    "range-rover-sport-svr": [
      {
        id: "blk_svr_service",
        start: "2026-05-20",
        end: "2026-05-21",
        reason: "SVR service window",
      },
    ],
  };
  return seededBlocks[slug] || [];
}

function calculateDays(pickup, returnDate) {
  if (!pickup || !returnDate) return null;
  const start = new Date(`${pickup}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(Math.ceil((end - start) / 86400000), 1);
}
