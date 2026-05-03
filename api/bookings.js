import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { vehicleSlugExists } from "./_lib/fleet-data.js";
import { currentUser } from "./_lib/store.js";
import { createBookingRecord, loadOperationsState, updateBookingRecord } from "./_lib/operations-store.js";

function requireReservationVehicle(reservation = {}) {
  const vehicle = String(reservation.vehicle || "").trim();
  if (!vehicle) {
    const error = new Error("Select a Velaire vehicle before reserving.");
    error.status = 400;
    throw error;
  }
  if (!vehicleSlugExists(vehicle)) {
    const error = new Error("That Velaire vehicle could not be found. Please choose from the live fleet.");
    error.status = 400;
    throw error;
  }
  return {
    ...reservation,
    vehicle,
  };
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST", "PATCH"])) return;

  const user = currentUser(req);

  if (req.method === "GET") {
    const state = await loadOperationsState();
    sendJson(res, 200, {
      authenticated: Boolean(user),
      bookings: user?.id ? state.bookings.filter((booking) => booking.userId === user.id) : [],
      source: state.meta.available ? "vercel-kv" : "memory-fallback",
    });
    return;
  }

  try {
    const body = await readJson(req);

    if (req.method === "PATCH") {
      const patch = body.patch || {};
      const { booking } = await updateBookingRecord(
        body.id,
        patch.reservation ? { ...patch, reservation: requireReservationVehicle(patch.reservation) } : patch,
      );
      if (!booking) {
        sendJson(res, 404, { error: "booking_not_found", message: "Booking not found." });
        return;
      }
      sendJson(res, 200, { booking });
      return;
    }

    const { booking, persistence } = await createBookingRecord({
      userId: user?.id || null,
      reservation: requireReservationVehicle(body.reservation || body),
      status: body.status || "draft",
    });
    sendJson(res, 201, {
      authenticated: Boolean(user),
      booking,
      persistence,
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "booking_failed", message: publicError(error) });
  }
}
