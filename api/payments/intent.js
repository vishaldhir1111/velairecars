import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { listStoredOperations } from "../_lib/operations-store.js";
import { createPaymentIntent, mergeVehicleOperationOverrides } from "../_lib/store.js";
import { stripeConfigured } from "../_lib/stripe.js";

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

    const storedOperations = await listStoredOperations();
    mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);
    const paymentIntent = createPaymentIntent({
      bookingId: body.bookingId,
      reservation: body.reservation || {},
      externalBookings: storedOperations.bookings || [],
    });

    sendJson(res, 201, {
      paymentIntent,
      message: "Deposit intent created. Create a Stripe Checkout session to take payment.",
    });
  } catch (error) {
    sendJson(res, error.status || 500, {
      error: error.code || "payment_intent_failed",
      message: publicError(error),
      booking: error.booking,
      payment: error.payment,
    });
  }
}
