import { allowMethods, publicError, readJson, sendJson, sessionCookie } from "../_lib/http.js";
import { authenticateUser, createSession } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const user = authenticateUser(body);
    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(req, session.token));
    sendJson(res, 200, { user, session: { authenticated: true } });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "login_failed", message: publicError(error) });
  }
}
