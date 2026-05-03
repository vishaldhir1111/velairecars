import { allowMethods, sendJson } from "../_lib/http.js";
import { adminSummary } from "../_lib/store.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  sendJson(res, 200, {
    operationsMode: "scaffold",
    summary: adminSummary(),
    nextProductionStep: "Replace the in-memory store with Postgres, Neon, Supabase or another durable database.",
  });
}
