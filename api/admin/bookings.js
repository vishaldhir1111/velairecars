import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { adminUpdateBooking, listAllBookings } from "../_lib/store.js";
import { listStripeOperations, mergeOperations } from "../_lib/stripe-operations.js";

function adminAllowed(req) {
  const expected = process.env.VELAIRE_ADMIN_TOKEN;
  if (!expected) return true;
  return req.headers.authorization === `Bearer ${expected}` || req.headers["x-velaire-admin-token"] === expected;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  if (req.method === "GET") {
    const stripeOperations = await listStripeOperations();
    sendJson(res, 200, {
      bookings: mergeOperations(listAllBookings(), stripeOperations.bookings),
      stripeOperations,
      mode: process.env.VELAIRE_ADMIN_TOKEN ? "protected" : "scaffold_open",
    });
    return;
  }

  try {
    const body = await readJson(req);
    const booking = adminUpdateBooking(body.id, body.action, body.patch || {});
    if (!booking) {
      sendJson(res, 404, { error: "booking_not_found", message: "Booking not found." });
      return;
    }
    sendJson(res, 200, { booking });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_booking_update_failed", message: publicError(error) });
  }
}
