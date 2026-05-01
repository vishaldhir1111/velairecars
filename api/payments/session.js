import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { saveStripeOperationsSession } from "../_lib/operations-store.js";
import { markPaymentStatus, upsertStripeCheckoutSession } from "../_lib/store.js";
import { paymentStatusFromCheckoutSession, retrieveStripeCheckoutSession } from "../_lib/stripe.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  try {
    const body = req.method === "POST" ? await readJson(req) : {};
    const sessionId = body.sessionId || body.session_id || req.query?.session_id || req.query?.sessionId;
    const session = await retrieveStripeCheckoutSession(sessionId);
    const paymentStatus = paymentStatusFromCheckoutSession(session);
    upsertStripeCheckoutSession(session, paymentStatus);
    await saveStripeOperationsSession(session, paymentStatus);
    const result = markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status: paymentStatus,
      providerReference: session.id,
      checkoutSessionId: session.id,
    });

    sendJson(res, 200, {
      session: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
      },
      paymentStatus,
      payment: result.payment,
      booking: result.booking,
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "checkout_session_failed", message: publicError(error) });
  }
}
