import { adminAllowed } from "../_lib/admin-auth.js";
import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { loadOperationsState, updatePaymentRecord } from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Operations password required." });
    return;
  }

  if (req.method === "GET") {
    const state = await loadOperationsState();
    sendJson(res, 200, {
      payments: state.payments || [],
      meta: state.meta,
    });
    return;
  }

  try {
    const body = await readJson(req);
    const { payment, persistence, notifications } = await updatePaymentRecord(body.id, body.patch || {});
    if (!payment) {
      sendJson(res, 404, { error: "payment_not_found", message: "Payment not found." });
      return;
    }
    sendJson(res, 200, { payment, persistence, notifications });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_payment_update_failed", message: publicError(error) });
  }
}
