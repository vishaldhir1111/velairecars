import { adminAllowed } from "../_lib/admin-auth.js";
import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { sendBookingCommunication } from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Operations password required." });
    return;
  }

  try {
    const body = await readJson(req);
    const allowedKinds = new Set(["confirmation", "deposit_receipt", "status_update"]);
    const kind = allowedKinds.has(body.kind) ? body.kind : "confirmation";
    const result = await sendBookingCommunication(body.bookingId, kind);
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_notification_failed", message: publicError(error) });
  }
}
