import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";
import { adminAllowed, adminMode } from "../_lib/admin-auth.js";
import { listLeads, updateLead } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Admin token required." });
    return;
  }

  if (req.method === "GET") {
    sendJson(res, 200, {
      leads: listLeads(),
      mode: adminMode(),
    });
    return;
  }

  try {
    const body = await readJson(req);
    const lead = updateLead(body.id, body.patch || {});
    if (!lead) {
      sendJson(res, 404, { error: "lead_not_found", message: "Concierge lead not found." });
      return;
    }
    sendJson(res, 200, { lead });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_lead_update_failed", message: publicError(error) });
  }
}
