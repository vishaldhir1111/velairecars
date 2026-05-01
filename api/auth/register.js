import { allowMethods, publicError, readJson, sendJson, sessionCookie } from "../_lib/http.js";
import { getAuthUserRecord, getStoredAccountRecord, saveAccountRecord, saveAuthUserRecord } from "../_lib/operations-store.js";
import { createSession, findUserByEmail, getAuthUserRecordForPersistence, registerUser } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    const existingUser = findUserByEmail(body.email);
    const existingAuthUser = existingUser || (await getAuthUserRecord(body.email));
    const storedAccount = await getStoredAccountRecord(body.email);
    const existingPublicUser = existingUser || (existingAuthUser ? {
      id: existingAuthUser.id,
      email: existingAuthUser.email,
      phone: existingAuthUser.phone || "",
      profile: existingAuthUser.profile || {},
      preferences: existingAuthUser.preferences || {},
      verification: existingAuthUser.verification || { status: "not_submitted", documents: {} },
      paymentMethod: null,
      favourites: existingAuthUser.favourites || [],
      createdAt: existingAuthUser.createdAt,
      updatedAt: existingAuthUser.updatedAt,
    } : null) || (storedAccount ? {
      id: storedAccount.id,
      email: storedAccount.email,
      phone: storedAccount.phone || "",
      profile: storedAccount.profile || {},
      preferences: storedAccount.preferences || {},
      verification: storedAccount.verification || { status: "not_submitted", documents: {} },
      paymentMethod: null,
      favourites: storedAccount.favourites || [],
      createdAt: storedAccount.createdAt,
      updatedAt: storedAccount.updatedAt,
    } : null);
    if (existingPublicUser) {
      sendJson(res, 409, {
        error: "account_exists",
        message: "A Velaire account already exists for this email. Sign in to continue the reservation.",
        user: existingPublicUser,
      });
      return;
    }
    const user = registerUser({
      ...body,
      phone: body.phone || "",
      profile: {
        ...(body.profile || {}),
      },
    });
    const authRecord = getAuthUserRecordForPersistence(user.email);
    await saveAccountRecord(user);
    await saveAuthUserRecord(authRecord);
    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(req, session.token));
    sendJson(res, 201, { user, session: { authenticated: true } });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "register_failed", message: publicError(error) });
  }
}
