import { allowMethods, publicError, readJson, sendJson, sessionCookie } from "../_lib/http.js";
import { createSession, registerUser } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const user = registerUser(body);
    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(req, session.token));
    sendJson(res, 201, { user, session: { authenticated: true } });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "register_failed", message: publicError(error) });
  }
}
