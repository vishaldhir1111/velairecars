import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { createBooking, currentUser, listBookings, updateBooking } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST", "PATCH"])) return;

  const user = currentUser(req);

  if (req.method === "GET") {
    sendJson(res, 200, {
      authenticated: Boolean(user),
      bookings: listBookings(user?.id),
    });
    return;
  }

  try {
    const body = await readJson(req);

    if (req.method === "PATCH") {
      const booking = updateBooking(body.id, body.patch || {});
      if (!booking) {
        sendJson(res, 404, { error: "booking_not_found", message: "Booking not found." });
        return;
      }
      sendJson(res, 200, { booking });
      return;
    }

    const booking = createBooking({
      userId: user?.id || null,
      reservation: body.reservation || body,
      status: body.status || "draft",
    });
    sendJson(res, 201, {
      authenticated: Boolean(user),
      booking,
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "booking_failed", message: publicError(error) });
  }
}
