import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { notifyClientAndAdmin } from "./_lib/notifications.js";
import {
  findActiveReservation,
  findPaidDeposit,
  getStoredCustomerContext,
  listStoredOperations,
  saveOperationsRecords,
} from "./_lib/operations-store.js";
import {
  createBooking,
  currentUser,
  findMatchingActiveBooking,
  listBookings,
  mergeVehicleOperationOverrides,
  updateBooking,
} from "./_lib/store.js";
import { customersFromBookings, mergeOperations } from "./_lib/stripe-operations.js";

function reservationForSignedInUser(reservation = {}, user = null) {
  if (!user) return reservation;
  return {
    ...reservation,
    name: reservation.name || reservation.fullName || user.profile?.fullName || "",
    fullName: reservation.fullName || reservation.name || user.profile?.fullName || "",
    email: reservation.email || user.email || "",
    phone: reservation.phone || user.phone || "",
  };
}

async function attachStoredBookingToUser({ booking, payment = null, reservation = {}, user = null } = {}) {
  if (!booking || !user?.id) return booking;
  const attachedBooking = {
    ...booking,
    userId: user.id,
    customerName: booking.customerName || reservation.name || reservation.fullName || user.profile?.fullName || "",
    customerEmail: booking.customerEmail || reservation.email || user.email || "",
    customerPhone: booking.customerPhone || reservation.phone || user.phone || "",
    updatedAt: new Date().toISOString(),
  };
  await saveOperationsRecords({
    booking: attachedBooking,
    payment,
    customers: customersFromBookings([attachedBooking]),
  });
  return attachedBooking;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST", "PATCH"])) return;

  const user = currentUser(req);

  if (req.method === "GET") {
    const storedContext = user?.email ? await getStoredCustomerContext(user.email) : { bookings: [] };
    sendJson(res, 200, {
      authenticated: Boolean(user),
      bookings: mergeOperations(listBookings(user?.id), storedContext.bookings || []),
    });
    return;
  }

  try {
    const body = await readJson(req);
    const storedOperations = await listStoredOperations();
    mergeVehicleOperationOverrides(storedOperations.vehicleOperations || []);

    if (req.method === "PATCH") {
      const reservation = reservationForSignedInUser(body.patch?.reservation || {}, user);
      const paidDeposit = await findPaidDeposit({
        bookingId: body.id,
        email: reservation.email,
        vehicle: reservation.vehicle,
        pickup: reservation.pickup,
        returnDate: reservation.return,
      });
      if (paidDeposit) {
        const booking = await attachStoredBookingToUser({
          booking: paidDeposit.booking,
          payment: paidDeposit.payment,
          reservation,
          user,
        });
        sendJson(res, 200, {
          booking: booking || {
            id: body.id,
            status: "confirmed",
            paymentStatus: "deposit_paid",
            paidAt: paidDeposit.payment?.paidAt || new Date().toISOString(),
          },
          payment: paidDeposit.payment,
          protected: "deposit_already_paid",
        });
        return;
      }
      const booking = updateBooking(body.id, {
        ...(body.patch || {}),
        reservation,
        externalBookings: storedOperations.bookings || [],
        ...(user?.id ? { userId: user.id } : {}),
      });
      if (!booking) {
        sendJson(res, 404, { error: "booking_not_found", message: "Booking not found." });
        return;
      }
      await saveOperationsRecords({ booking, customers: customersFromBookings([booking]) });
      if (body.patch?.status === "pending") {
        await notifyClientAndAdmin({
          clientType: "booking_created",
          adminType: "admin_new_booking",
          booking,
        });
      }
      sendJson(res, 200, { booking });
      return;
    }

    const reservation = reservationForSignedInUser(body.reservation || body, user);
    const paidDeposit = await findPaidDeposit({
      email: reservation.email,
      vehicle: reservation.vehicle,
      pickup: reservation.pickup,
      returnDate: reservation.return,
    });
    if (paidDeposit?.booking || paidDeposit?.payment) {
      const booking = await attachStoredBookingToUser({
        booking: paidDeposit.booking,
        payment: paidDeposit.payment,
        reservation,
        user,
      });
      sendJson(res, 200, {
        authenticated: Boolean(user),
        booking: booking || null,
        payment: paidDeposit.payment || null,
        protected: "deposit_already_paid",
      });
      return;
    }

    const activeReservation = await findActiveReservation({
      email: reservation.email,
      vehicle: reservation.vehicle,
      pickup: reservation.pickup,
      returnDate: reservation.return,
    });
    const localActiveBooking = activeReservation?.booking
      ? null
      : findMatchingActiveBooking({
          userId: user?.id || "",
          email: reservation.email,
          vehicleSlug: reservation.vehicle,
          pickup: reservation.pickup,
          returnDate: reservation.return,
        });
    if (activeReservation?.booking || localActiveBooking) {
      const booking = await attachStoredBookingToUser({
        booking: activeReservation?.booking || localActiveBooking,
        payment: activeReservation?.payment || null,
        reservation,
        user,
      });
      sendJson(res, 200, {
        authenticated: Boolean(user),
        booking,
        payment: activeReservation?.payment || null,
        protected: "reservation_already_exists",
        message: "An active Velaire reservation already exists for this client and vehicle.",
      });
      return;
    }

    const booking = createBooking({
      userId: user?.id || null,
      reservation,
      status: body.status || "draft",
      externalBookings: storedOperations.bookings || [],
    });
    await saveOperationsRecords({ booking, customers: customersFromBookings([booking]) });
    if (booking.status === "pending") {
      await notifyClientAndAdmin({
        clientType: "booking_created",
        adminType: "admin_new_booking",
        booking,
      });
    }
    sendJson(res, 201, {
      authenticated: Boolean(user),
      booking,
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "booking_failed", message: publicError(error) });
  }
}
