import { sendJson } from "../_lib/http.js";
import { loadOperationsState, updatePaymentRecord } from "../_lib/operations-store.js";
import { readRawBody, verifyStripeWebhookSignature } from "../_lib/stripe.js";

function checkoutSessionPaymentPatch(session = {}, status) {
  return {
    status,
    provider: "stripe_checkout",
    providerReference: session.id || "",
    stripePaymentIntentId: session.payment_intent || "",
    stripeCustomerId: session.customer || "",
    stripePaymentStatus: session.payment_status || "",
  };
}

async function paymentIdForSession(session = {}) {
  const metadataPaymentId = session.metadata?.paymentId || "";
  if (metadataPaymentId) return metadataPaymentId;
  const state = await loadOperationsState();
  const match = (state.payments || []).find((payment) => payment.providerReference === session.id);
  return match?.id || "";
}

async function handleCheckoutSession(session = {}, status) {
  const paymentId = await paymentIdForSession(session);
  if (!paymentId) {
    return { handled: false, reason: "payment_not_found", sessionId: session.id || "" };
  }
  const { payment, persistence, notifications } = await updatePaymentRecord(paymentId, checkoutSessionPaymentPatch(session, status));
  return { handled: Boolean(payment), payment, persistence, notifications };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "method_not_allowed", allowed: ["POST"] });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    verifyStripeWebhookSignature(rawBody, req.headers["stripe-signature"] || "");
    const event = JSON.parse(rawBody || "{}");
    let result = { handled: false, reason: "ignored_event" };

    if (event.type === "checkout.session.completed") {
      result = await handleCheckoutSession(event.data?.object || {}, "deposit_paid");
    }
    if (event.type === "checkout.session.expired") {
      result = await handleCheckoutSession(event.data?.object || {}, "cancelled");
    }

    sendJson(res, 200, { received: true, event: event.type, result });
  } catch (error) {
    sendJson(res, error.status || 400, {
      error: error.code || "stripe_webhook_failed",
      message: error.publicMessage || error.message || "Stripe webhook could not be processed.",
    });
  }
}
