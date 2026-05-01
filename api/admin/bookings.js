import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { adminAllowed, adminMode } from "../_lib/admin-auth.js";
import { notifyClientAndAdmin } from "../_lib/notifications.js";
import { listStoredOperations, updateStoredBookingStatus } from "../_lib/operations-store.js";
import { adminUpdateBooking, listAllBookings } from "../_lib/store.js";
import { listStripeOperations, mergeOperations } from "../_lib/stripe-operations.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  if (req.method === "GET") {
    const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
    sendJson(res, 200, {
      bookings: mergeOperations(mergeOperations(listAllBookings(), storedOperations.bookings), stripeOperations.bookings),
      storedOperations,
      stripeOperations,
      mode: adminMode(),
    });
    return;
  }

  try {
    const body = await readJson(req);
    let booking = adminUpdateBooking(body.id, body.action, body.patch || {});
    const notifyType = ["approve", "confirm"].includes(body.action)
      ? "booking_approved"
      : body.action === "reject"
        ? "booking_rejected"
        : body.action === "cancel"
        ? "booking_cancelled"
        : "";
    if (!booking) {
      const statusByAction = {
        approve: "confirmed",
        confirm: "confirmed",
        reject: "cancelled",
        cancel: "cancelled",
        complete: "completed",
        pending: "pending",
        payment_pending: "payment_pending",
      };
      const stored = await updateStoredBookingStatus({
        bookingId: body.id,
        status: statusByAction[body.action] || body.patch?.status || "pending",
        action: body.action,
        note: body.patch?.operationsNote || "",
      });
      booking = stored.booking || null;
    }
    if (!booking) {
      sendJson(res, 404, { error: "booking_not_found", message: "Booking not found." });
      return;
    }
    if (notifyType) await notifyClientAndAdmin({ clientType: notifyType, booking });
    sendJson(res, 200, { booking });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_booking_update_failed", message: publicError(error) });
  }
}
