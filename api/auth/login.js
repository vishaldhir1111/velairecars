import { allowMethods, publicError, readJson, sendJson, sessionCookie } from "../_lib/http.js";
import { getAuthUserRecord } from "../_lib/operations-store.js";
import { authenticateAuthUserRecord, authenticateUser, createSession } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    let user;
    try {
      user = authenticateUser(body);
    } catch (memoryError) {
      const storedUser = await getAuthUserRecord(body.email);
      if (!storedUser) throw memoryError;
      user = authenticateAuthUserRecord(storedUser, body.password);
    }
    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(req, session.token));
    sendJson(res, 200, { user, session: { authenticated: true } });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "login_failed", message: publicError(error) });
  }
}
