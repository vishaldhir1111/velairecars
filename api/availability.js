import { calculateBookingTotals } from "./_lib/fleet-data.js";
import { allowMethods, readJson, sendJson } from "./_lib/http.js";

function leadTimeMessage(vehicle, pickup) {
  if (!pickup) return "Choose dates to prepare an availability review.";
  const leadTime = vehicle.availability?.leadTimeHours || 12;
  return `Request-to-confirm availability. Concierge lead time is typically ${leadTime} hours for this vehicle.`;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const body = req.method === "POST" ? await readJson(req) : {};
  const query = req.query || {};
  const vehicle = body.vehicle || query.vehicle || "lamborghini-urus";
  const pickup = body.pickup || query.pickup || "";
  const returnDate = body.return || query.return || "";
  const days = Number.parseInt(body.days || query.days || "0", 10);
  const totals = calculateBookingTotals({ vehicleSlug: vehicle, pickup, returnDate, days });

  sendJson(res, 200, {
    vehicle: totals.vehicle.slug,
    status: "request_to_confirm",
    available: true,
    message: leadTimeMessage(totals.vehicle, pickup),
    deposit: totals.deposit,
    hireEstimate: totals.hireEstimate,
    days: totals.days,
    currency: totals.currency,
  });
}
