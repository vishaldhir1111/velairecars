import { adminAllowed } from "../_lib/admin-auth.js";
import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { loadOperationsState, updateBookingRecord } from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Operations password required." });
    return;
  }

  if (req.method === "GET") {
    const state = await loadOperationsState();
    sendJson(res, 200, {
      bookings: state.bookings || [],
      meta: state.meta,
    });
    return;
  }

  try {
    const body = await readJson(req);
    const statusByAction = {
      approve: "confirmed",
      confirm: "confirmed",
      reject: "cancelled",
      cancel: "cancelled",
      complete: "completed",
      pending: "pending",
      payment_pending: "payment_pending",
    };
    const patch = {
      ...(body.patch || {}),
      ...(body.action ? { status: statusByAction[body.action] || body.action } : {}),
    };
    const { booking, persistence, notifications } = await updateBookingRecord(body.id, patch);
    if (!booking) {
      sendJson(res, 404, { error: "booking_not_found", message: "Booking not found." });
      return;
    }
    sendJson(res, 200, { booking, persistence, notifications });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_booking_update_failed", message: publicError(error) });
  }
}
