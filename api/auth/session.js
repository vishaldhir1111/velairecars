import { allowMethods, sendJson } from "../_lib/http.js";
import { currentUser } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  const user = currentUser(req);
  sendJson(res, 200, {
    authenticated: Boolean(user),
    user,
  });
}
