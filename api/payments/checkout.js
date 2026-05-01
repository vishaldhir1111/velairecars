import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { saveStripeOperationsSession } from "../_lib/operations-store.js";
import { attachCheckoutToPayment, createPaymentIntent } from "../_lib/store.js";
import { createStripeCheckoutSession, stripeConfigured } from "../_lib/stripe.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    if (!stripeConfigured()) {
      sendJson(res, 503, {
        error: "stripe_not_configured",
        message: "Stripe payments are not configured. Add STRIPE_SECRET_KEY in Vercel before taking deposits.",
      });
      return;
    }

    const paymentIntent = createPaymentIntent({
      bookingId: body.bookingId,
      reservation: body.reservation || {},
    });

    const session = await createStripeCheckoutSession(req, paymentIntent, body.reservation || {});
    await saveStripeOperationsSession(session, "payment_pending");
    const payment = attachCheckoutToPayment(paymentIntent.id, {
      sessionId: session.id,
      url: session.url,
      status: "payment_pending",
    });

    sendJson(res, 201, {
      paymentIntent: payment,
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "checkout_failed", message: publicError(error) });
  }
}
