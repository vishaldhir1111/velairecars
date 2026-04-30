import { allowMethods, clearSessionCookie, parseCookies, sendJson } from "../_lib/http.js";
import { destroySession } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const token = parseCookies(req).velaire_session;
  if (token) destroySession(token);
  res.setHeader("Set-Cookie", clearSessionCookie(req));
  sendJson(res, 200, { session: { authenticated: false } });
}
