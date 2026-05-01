import { allowMethods, sendJson } from "../_lib/http.js";
import { notifyClientAndAdmin } from "../_lib/notifications.js";
import { saveStripeOperationsSession, updateStoredPaymentStatus } from "../_lib/operations-store.js";
import { markPaymentStatus, upsertStripeCheckoutSession } from "../_lib/store.js";
import { paymentStatusFromCheckoutSession, readRawBody, verifyStripeSignature } from "../_lib/stripe.js";

function metadataFor(object = {}) {
  return object.metadata || {};
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeSignature(rawBody, signature)) {
    sendJson(res, 400, { error: "invalid_signature", message: "Stripe webhook signature could not be verified." });
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody || "{}");
  } catch {
    sendJson(res, 400, { error: "invalid_payload", message: "Stripe webhook payload could not be parsed." });
    return;
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object || {};
    const status = paymentStatusFromCheckoutSession(session);
    upsertStripeCheckoutSession(session, status);
    const records = await saveStripeOperationsSession(session, status);
    if (status === "deposit_paid") {
      await notifyClientAndAdmin({
        clientType: "deposit_paid",
        adminType: "admin_deposit_paid",
        booking: records.booking,
        payment: records.payment,
      });
    }
    markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status,
      providerReference: session.id,
      checkoutSessionId: session.id,
    });
  }

  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data?.object || {};
    upsertStripeCheckoutSession(session, "deposit_paid");
    const records = await saveStripeOperationsSession(session, "deposit_paid");
    await notifyClientAndAdmin({
      clientType: "deposit_paid",
      adminType: "admin_deposit_paid",
      booking: records.booking,
      payment: records.payment,
    });
    markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status: "deposit_paid",
      providerReference: session.id,
      checkoutSessionId: session.id,
    });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data?.object || {};
    upsertStripeCheckoutSession(session, "failed");
    const records = await saveStripeOperationsSession(session, "failed");
    await notifyClientAndAdmin({
      clientType: "payment_failed",
      booking: records.booking,
      payment: records.payment,
    });
    markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status: "failed",
      providerReference: session.id,
      checkoutSessionId: session.id,
      failureReason: "Async payment failed",
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data?.object || {};
    upsertStripeCheckoutSession(session, "cancelled");
    await saveStripeOperationsSession(session, "cancelled");
    markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status: "cancelled",
      providerReference: session.id,
      checkoutSessionId: session.id,
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data?.object || {};
    const metadata = metadataFor(intent);
    await updateStoredPaymentStatus({
      paymentId: metadata.payment_id,
      bookingId: metadata.booking_id,
      status: "failed",
      providerReference: intent.id,
      failureReason: intent.last_payment_error?.message || "Payment failed",
    });
    await notifyClientAndAdmin({
      clientType: "payment_failed",
      booking: {
        id: metadata.booking_id,
        customerEmail: intent.receipt_email || intent.customer_email || "",
        paymentStatus: "failed",
        status: "payment_pending",
      },
      payment: {
        id: metadata.payment_id,
        status: "failed",
        providerReference: intent.id,
      },
      note: intent.last_payment_error?.message || "Payment failed",
    });
    markPaymentStatus({
      paymentId: metadata.payment_id,
      bookingId: metadata.booking_id,
      status: "failed",
      providerReference: intent.id,
      failureReason: intent.last_payment_error?.message || "Payment failed",
    });
  }

  if (event.type === "charge.refunded") {
    const charge = event.data?.object || {};
    const metadata = metadataFor(charge);
    await updateStoredPaymentStatus({
      paymentId: metadata.payment_id,
      bookingId: metadata.booking_id,
      status: "refunded",
      providerReference: charge.id,
    });
    markPaymentStatus({
      paymentId: metadata.payment_id,
      bookingId: metadata.booking_id,
      status: "refunded",
      providerReference: charge.id,
    });
  }

  sendJson(res, 200, { received: true });
}
