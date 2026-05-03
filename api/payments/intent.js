import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { createBookingRecord, createPaymentRecord, updatePaymentRecord } from "../_lib/operations-store.js";
import { createStripeCheckoutSession } from "../_lib/stripe.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    let bookingId = body.bookingId || "";
    let bookingForCheckout = null;
    if (!bookingId) {
      const created = await createBookingRecord({
        reservation: body.reservation || {},
        status: "payment_review",
      });
      bookingId = created.booking.id;
      bookingForCheckout = created.booking;
    }
    const { payment, persistence, notifications: paymentNotifications } = await createPaymentRecord({
      bookingId,
      reservation: body.reservation || {},
    });
    const checkoutSession = await createStripeCheckoutSession({
      req,
      payment,
      booking: bookingForCheckout || (payment.bookingId
        ? {
            id: payment.bookingId,
            reference: payment.bookingReference,
            vehicleSlug: payment.vehicleSlug,
            vehicleName: payment.vehicleName,
            customerEmail: payment.customerEmail,
            totals: {
              deposit: payment.amount,
              currency: payment.currency,
            },
          }
        : null),
    });
    const { payment: updatedPayment, notifications: checkoutNotifications } = await updatePaymentRecord(payment.id, {
      provider: "stripe_checkout",
      providerReference: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      stripePaymentIntentId: checkoutSession.payment_intent || "",
      status: "payment_pending",
    });

    sendJson(res, 201, {
      paymentIntent: updatedPayment || payment,
      checkoutSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      persistence,
      notifications: [...(paymentNotifications || []), ...(checkoutNotifications || [])],
      providerReady: true,
      message: "Stripe Checkout session created. Redirecting to secure payment.",
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "payment_intent_failed", message: publicError(error) });
  }
}
