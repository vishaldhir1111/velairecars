import { allowMethods, sendJson } from "../_lib/http.js";
import { adminAllowed, adminMode } from "../_lib/admin-auth.js";
import { listStoredOperations } from "../_lib/operations-store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  const operations = await listStoredOperations();
  const notifications = [...(operations.notifications || [])].sort((a, b) =>
    String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")),
  );

  sendJson(res, 200, {
    notifications,
    available: operations.available,
    reason: operations.reason || "",
    mode: adminMode(),
  });
}
