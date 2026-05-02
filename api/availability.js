import { allowMethods, readJson, sendJson } from "./_lib/http.js";
import { listStoredOperations } from "./_lib/operations-store.js";
import { listStripeOperations, mergeOperations } from "./_lib/stripe-operations.js";
import { checkVehicleAvailability, mergeVehicleOperationOverrides } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const body = req.method === "POST" ? await readJson(req) : {};
  const query = req.query || {};
  const vehicle = body.vehicle || query.vehicle || "lamborghini-urus";
  const pickup = body.pickup || query.pickup || "";
  const returnDate = body.return || query.return || "";
  const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
  mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);
  const bookings = mergeOperations(storedOperations.bookings || [], stripeOperations.bookings || []);
  const availability = checkVehicleAvailability({
    vehicleSlug: vehicle,
    pickup,
    returnDate,
    externalBookings: bookings,
  });

  sendJson(res, 200, {
    vehicle: availability.vehicle.slug,
    status: availability.status,
    available: availability.available,
    message: availability.message,
    conflicts: availability.conflicts,
    deposit: availability.vehicle.deposit,
    dailyRate: availability.vehicle.rate,
    currency: "GBP",
    source: storedOperations.available ? "operations-store" : "stripe-metadata",
  });
}
