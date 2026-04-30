import { allowMethods, publicError, readJson, sendJson } from "./_lib/http.js";
import { currentUser, listBookings, updateAccount } from "./_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  const user = currentUser(req);
  if (!user) {
    sendJson(res, 401, { error: "unauthenticated", message: "Sign in to access the Velaire client lounge." });
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, {
      user,
      bookings: listBookings(user.id),
    });
    return;
  }

  try {
    const body = await readJson(req);
    const updated = updateAccount(user.id, body);
    sendJson(res, 200, {
      user: updated,
      bookings: listBookings(user.id),
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "account_update_failed", message: publicError(error) });
  }
}
