import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { lookupCustomerBookingStatus } from "./_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const result = await lookupCustomerBookingStatus({
      reference: body.reference,
      email: body.email,
    });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: "booking_status_lookup_failed",
      message: publicError(error),
    });
  }
}
