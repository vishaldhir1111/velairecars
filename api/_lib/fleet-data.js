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
  availability: {
    status: "request-to-confirm",
    leadTimeHours: vehicle.slug === "lamborghini-urus" ? 24 : 12,
    minimumAge: vehicle.rate >= 495 ? 25 : 23,
    deposit: vehicle.deposit,
  },
}));

export const conciergeKnowledge = conciergeFleetKnowledge;

export function findVehicle(slug) {
  return fleetData.find((vehicle) => vehicle.slug === slug) || fleetData[0];
}

export function calculateBookingTotals({ vehicleSlug, pickup, returnDate, days }) {
  const vehicle = findVehicle(vehicleSlug);
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

function calculateDays(pickup, returnDate) {
  if (!pickup || !returnDate) return null;
  const start = new Date(`${pickup}T00:00:00`);
  const end = new Date(`${returnDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(Math.ceil((end - start) / 86400000), 1);
}
