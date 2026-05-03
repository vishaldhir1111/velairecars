import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { createPaymentRecord } from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const { payment, persistence, notifications } = await createPaymentRecord({
      bookingId: body.bookingId,
      reservation: body.reservation || {},
    });

    sendJson(res, 201, {
      paymentIntent: payment,
      persistence,
      notifications,
      providerReady: false,
      message: "Deposit record created in Operations. Stripe Checkout can use this persisted booking state.",
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "payment_intent_failed", message: publicError(error) });
  }
}
