import { adminAllowed } from "../_lib/admin-auth.js";
import { allowMethods, sendJson } from "../_lib/http.js";
import { operationsSummary } from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Operations password required." });
    return;
  }

  sendJson(res, 200, {
    operationsMode: "vercel-kv",
    summary: await operationsSummary(),
  });
}
