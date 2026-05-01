import { allowMethods, publicError, readJson, sendJson, sessionCookie } from "../_lib/http.js";
import { getStoredAccountRecord, saveAccountRecord } from "../_lib/operations-store.js";
import { createSession, findUserByEmail, registerUser } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const existingUser = findUserByEmail(body.email);
    if (existingUser) {
      sendJson(res, 409, {
        error: "account_exists",
        message: "A Velaire account already exists for this email. Sign in to continue the reservation.",
        user: existingUser,
      });
      return;
    }
    const storedAccount = await getStoredAccountRecord(body.email);
    const user = registerUser({
      ...body,
      phone: body.phone || storedAccount?.phone || "",
      profile: {
        ...(storedAccount?.profile || {}),
        ...(body.profile || {}),
      },
    });
    await saveAccountRecord(user);
    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(req, session.token));
    sendJson(res, 201, { user, session: { authenticated: true } });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "register_failed", message: publicError(error) });
  }
}
