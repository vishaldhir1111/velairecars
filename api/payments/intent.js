import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { createPaymentIntent } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const paymentIntent = createPaymentIntent({
      bookingId: body.bookingId,
      reservation: body.reservation || {},
    });

    sendJson(res, 201, {
      paymentIntent,
      providerReady: false,
      message: "Deposit intent created. Connect Stripe or another provider before charging real cards.",
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "payment_intent_failed", message: publicError(error) });
  }
}
