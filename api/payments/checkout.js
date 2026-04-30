import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { attachCheckoutToPayment, createPaymentIntent } from "../_lib/store.js";

function originFor(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "velairecars.com";
  return `${proto}://${host}`;
}

async function createStripeCheckoutSession(req, paymentIntent, reservation = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;

  const origin = originFor(req);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("payment_method_types[0]", "card");
  params.set("line_items[0][price_data][currency]", String(paymentIntent.currency || "GBP").toLowerCase());
  params.set("line_items[0][price_data][product_data][name]", `Velaire Cars reservation deposit`);
  params.set("line_items[0][price_data][unit_amount]", String(Math.round(Number(paymentIntent.amount || 0) * 100)));
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/payment.html?payment=cancelled`);
  params.set("metadata[payment_id]", paymentIntent.id);
  if (paymentIntent.bookingId) params.set("metadata[booking_id]", paymentIntent.bookingId);
  if (reservation.vehicle) params.set("metadata[vehicle]", reservation.vehicle);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const session = await response.json();
  if (!response.ok) {
    const error = new Error(session.error?.message || "Stripe Checkout session could not be created.");
    error.status = response.status;
    error.publicMessage = "Secure checkout could not be started. The reservation request is still saved.";
    throw error;
  }

  return session;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const paymentIntent = createPaymentIntent({
      bookingId: body.bookingId,
      reservation: body.reservation || {},
    });

    const session = await createStripeCheckoutSession(req, paymentIntent, body.reservation || {});
    if (!session) {
      sendJson(res, 202, {
        paymentIntent,
        providerReady: false,
        message: "Stripe is not connected yet. Add STRIPE_SECRET_KEY to enable secure Checkout redirects.",
      });
      return;
    }

    const payment = attachCheckoutToPayment(paymentIntent.id, {
      sessionId: session.id,
      url: session.url,
      status: "checkout_created",
    });

    sendJson(res, 201, {
      paymentIntent: payment,
      providerReady: true,
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "checkout_failed", message: publicError(error) });
  }
}
