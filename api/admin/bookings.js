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
    const patchByAction = {
      approve: { status: "confirmed", followUpStatus: "driver_checks" },
      confirm: { status: "confirmed", followUpStatus: "driver_checks" },
      reject: { status: "rejected", followUpStatus: "needs_reply" },
      cancel: { status: "cancelled", followUpStatus: "needs_reply" },
      complete: {
        status: "completed",
        followUpStatus: "handover_completed",
        operationsChecklist: { handoverCompleted: true },
      },
      refund_pending: { status: "cancelled", paymentStatus: "refund_pending", followUpStatus: "needs_reply" },
      refunded: { status: "cancelled", paymentStatus: "refunded", followUpStatus: "customer_contacted" },
      customer_contacted: {
        followUpStatus: "customer_contacted",
        operationsChecklist: { customerContacted: true },
      },
      customer_not_contacted: {
        followUpStatus: "needs_reply",
        operationsChecklist: { customerContacted: false },
      },
      pending: { status: "pending" },
      payment_pending: { paymentStatus: "payment_pending" },
    };
    const patch = {
      ...(body.patch || {}),
      ...(body.action ? patchByAction[body.action] || { status: body.action } : {}),
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
