import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { findPaidDeposit, listStoredOperations, saveStripeOperationsSession } from "../_lib/operations-store.js";
import {
  attachCheckoutToPayment,
  createPaymentIntent,
  listAllBookings,
  listPayments,
  mergeVehicleOperationOverrides,
} from "../_lib/store.js";
import { createStripeCheckoutSession, stripeConfigured } from "../_lib/stripe.js";
import { listStripeOperations, mergeOperations } from "../_lib/stripe-operations.js";

async function existingPaidDeposit({ bookingId = "", reservation = {} } = {}) {
  const stored = await findPaidDeposit({
    bookingId,
    email: reservation.email,
    vehicle: reservation.vehicle,
    pickup: reservation.pickup,
    returnDate: reservation.return,
  });
  if (stored) return stored;

  const localBookings = listAllBookings();
  const localPayments = listPayments();
  const cleanEmail = String(reservation.email || "").trim().toLowerCase();
  const localBooking = localBookings.find((item) => {
    if (bookingId && item.id === bookingId) return item.paymentStatus === "deposit_paid";
    const sameClient = cleanEmail && String(item.customerEmail || "").toLowerCase() === cleanEmail;
    const sameVehicle = !reservation.vehicle || item.vehicleSlug === reservation.vehicle;
    const samePickup = !reservation.pickup || item.pickup === reservation.pickup;
    const sameReturn = !reservation.return || item.return === reservation.return;
    return sameClient && sameVehicle && samePickup && sameReturn && item.paymentStatus === "deposit_paid";
  });
  const localPayment = localPayments.find((item) => {
    if (item.status !== "deposit_paid") return false;
    if (localBooking?.id && item.bookingId === localBooking.id) return true;
    if (bookingId && item.bookingId === bookingId) return true;
    const paymentBooking = localBookings.find((booking) => booking.id === item.bookingId);
    const sameClient =
      cleanEmail &&
      (String(item.customerEmail || "").toLowerCase() === cleanEmail ||
        String(paymentBooking?.customerEmail || "").toLowerCase() === cleanEmail);
    const sameVehicle = !reservation.vehicle || paymentBooking?.vehicleSlug === reservation.vehicle;
    const samePickup = !reservation.pickup || paymentBooking?.pickup === reservation.pickup;
    const sameReturn = !reservation.return || paymentBooking?.return === reservation.return;
    return !bookingId && sameClient && sameVehicle && samePickup && sameReturn;
  });
  if (localBooking || localPayment) return { booking: localBooking, payment: localPayment };

  const stripeOperations = await listStripeOperations();
  if (!stripeOperations.available) return null;
  const booking = stripeOperations.bookings.find((item) => {
    if (bookingId && item.id === bookingId) return item.paymentStatus === "deposit_paid";
    const sameClient = cleanEmail && String(item.customerEmail || "").toLowerCase() === cleanEmail;
    const sameVehicle = !reservation.vehicle || item.vehicleSlug === reservation.vehicle;
    const samePickup = !reservation.pickup || item.pickup === reservation.pickup;
    const sameReturn = !reservation.return || item.return === reservation.return;
    return sameClient && sameVehicle && samePickup && sameReturn && item.paymentStatus === "deposit_paid";
  });
  const payment = stripeOperations.payments.find((item) => {
    if (item.status !== "deposit_paid") return false;
    if (booking?.id && item.bookingId === booking.id) return true;
    if (bookingId && item.bookingId === bookingId) return true;
    const sameClient = cleanEmail && String(item.customerEmail || "").toLowerCase() === cleanEmail;
    const sameVehicle = !reservation.vehicle || item.vehicleSlug === reservation.vehicle || booking?.vehicleSlug === reservation.vehicle;
    const samePickup = !reservation.pickup || item.pickup === reservation.pickup || booking?.pickup === reservation.pickup;
    const sameReturn = !reservation.return || item.return === reservation.return || booking?.return === reservation.return;
    return !bookingId && sameClient && sameVehicle && samePickup && sameReturn;
  });
  return booking || payment ? { booking, payment } : null;
}

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

    const reservation = body.reservation || {};
    const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
    mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);
    const externalBookings = mergeOperations(storedOperations.bookings || [], stripeOperations.bookings || []);
    const paidDeposit = await existingPaidDeposit({ bookingId: body.bookingId, reservation });
    if (paidDeposit) {
      sendJson(res, 409, {
        error: "deposit_already_paid",
        message: "This reservation deposit has already been paid. The booking is now in concierge review.",
        booking: paidDeposit.booking,
        payment: paidDeposit.payment,
      });
      return;
    }

    const paymentIntent = createPaymentIntent({
      bookingId: body.bookingId,
      reservation,
      externalBookings,
    });

    const session = await createStripeCheckoutSession(req, paymentIntent, reservation);
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
    if (error.code === "deposit_already_paid") {
      sendJson(res, 409, {
        error: "deposit_already_paid",
        message: publicError(error),
        booking: error.booking,
        payment: error.payment,
      });
      return;
    }
    sendJson(res, error.status || 500, { error: "checkout_failed", message: publicError(error) });
  }
}
