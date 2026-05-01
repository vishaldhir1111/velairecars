import { allowMethods, sendJson } from "../_lib/http.js";
import { sendNotification } from "../_lib/notifications.js";
import { listStoredOperations } from "../_lib/operations-store.js";
import { listAllBookings } from "../_lib/store.js";
import { listStripeOperations, mergeOperations } from "../_lib/stripe-operations.js";

function adminAllowed(req) {
  const expected = process.env.VELAIRE_ADMIN_TOKEN;
  if (!expected) return true;
  return req.headers.authorization === `Bearer ${expected}` || req.headers["x-velaire-admin-token"] === expected;
}

function withinReminderWindow(booking = {}) {
  if (!booking.pickup || ["cancelled", "completed", "rejected"].includes(booking.status)) return false;
  if (!["confirmed", "payment_pending"].includes(String(booking.status || ""))) return false;
  const pickup = new Date(`${booking.pickup}T${booking.pickupTime || "10:00"}:00`);
  if (Number.isNaN(pickup.getTime())) return false;
  const hours = (pickup.getTime() - Date.now()) / 3600000;
  return hours >= 0 && hours <= Number(process.env.VELAIRE_REMINDER_WINDOW_HOURS || 48);
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  const [storedOperations, stripeOperations] = await Promise.all([listStoredOperations(), listStripeOperations()]);
  const bookings = mergeOperations(mergeOperations(listAllBookings(), storedOperations.bookings), stripeOperations.bookings);
  const reminders = [];

  for (const booking of bookings.filter(withinReminderWindow)) {
    reminders.push(
      await sendNotification({
        type: "handover_reminder",
        to: booking.customerEmail,
        booking,
        dedupeKey: `handover_reminder:${booking.id || booking.reference}:${booking.pickup}:${booking.pickupTime || ""}`,
      }),
    );
  }

  sendJson(res, 200, {
    reminders,
    count: reminders.length,
    windowHours: Number(process.env.VELAIRE_REMINDER_WINDOW_HOURS || 48),
  });
}
