import { allowMethods, publicError, readJson, sendJson, sessionCookie } from "../_lib/http.js";
import {
  getAuthUserRecord,
  getStoredAccountRecord,
  getStoredCustomerContext,
  saveAccountRecord,
  saveAuthUserRecord,
} from "../_lib/operations-store.js";
import {
  authenticateAuthUserRecord,
  authenticateUser,
  createSession,
  getAuthUserRecordForPersistence,
  registerUser,
} from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  try {
    const body = await readJson(req);
    if (!body.password) {
      const error = new Error("Enter your Velaire account password to continue.");
      error.status = 400;
      error.publicMessage = "Enter your Velaire account password to continue.";
      throw error;
    }
    let user;
    try {
      user = authenticateUser(body);
    } catch (memoryError) {
      const noMemoryAccount = /No Velaire account found/i.test(memoryError.publicMessage || memoryError.message || "");
      if (!noMemoryAccount) throw memoryError;
      const storedUser = await getAuthUserRecord(body.email);
      if (storedUser) {
        user = authenticateAuthUserRecord(storedUser, body.password);
      } else {
        const storedAccount = await getStoredAccountRecord(body.email);
        const storedContext = storedAccount ? null : await getStoredCustomerContext(body.email);
        const storedCustomer = storedContext?.customer || null;
        if (!storedAccount && !storedCustomer) throw memoryError;
        user = registerUser({
          email: body.email,
          password: body.password,
          phone: storedAccount?.phone || storedCustomer?.phone || "",
          profile: {
            ...(storedAccount?.profile || {}),
            fullName: storedAccount?.profile?.fullName || storedCustomer?.fullName || "",
            preferredContact:
              storedAccount?.profile?.preferredContact ||
              storedCustomer?.preferredContact ||
              "Email",
            licenceCountry: storedAccount?.profile?.licenceCountry || "United Kingdom",
          },
        });
        const authRecord = getAuthUserRecordForPersistence(user.email);
        await saveAccountRecord(user);
        await saveAuthUserRecord(authRecord);
      }
    }
    const session = createSession(user.id);
    res.setHeader("Set-Cookie", sessionCookie(req, session.token));
    sendJson(res, 200, { user, session: { authenticated: true } });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "login_failed", message: publicError(error) });
  }
}
