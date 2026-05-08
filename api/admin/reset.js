import { adminAllowed } from "../_lib/admin-auth.js";
import { allowMethods, publicError, readJson, sendJson } from "../_lib/http.js";

const operationsKey = "velaire:operations:v1";

function now() {
  return new Date().toISOString();
}

function kvConfig() {
  const url = process.env.KV_REST_API_URL || "";
  const token = process.env.KV_REST_API_TOKEN || "";
  return { url: url.replace(/\/$/, ""), token };
}

async function kvCommand(command, args = []) {
  const { url, token } = kvConfig();
  if (!url || !token) {
    const error = new Error("Vercel KV REST is not configured.");
    error.status = 503;
    error.publicMessage = "Operations storage is temporarily unavailable.";
    throw error;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command, ...args]),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Vercel KV request failed.");
    error.status = response.status;
    throw error;
  }
  return payload.result;
}

function parseState(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function count(array) {
  return Array.isArray(array) ? array.length : 0;
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  if (!adminAllowed(req)) {
    sendJson(res, 401, { error: "admin_unauthorised", message: "Operations password required." });
    return;
  }

  try {
    const body = await readJson(req);
    if (body.confirm !== "CLEAR_BOOKINGS") {
      sendJson(res, 400, {
        error: "reset_confirmation_required",
        message: "Send confirm: CLEAR_BOOKINGS to clear launch-test booking records.",
      });
      return;
    }

    const current = parseState(await kvCommand("GET", [operationsKey]));
    const before = {
      bookings: count(current.bookings),
      payments: count(current.payments),
      customers: count(current.customers),
      notifications: count(current.notifications),
      leads: count(current.leads),
      auditLog: count(current.auditLog),
    };
    const next = {
      ...current,
      version: current.version || 1,
      vehicleOperations: Array.isArray(current.vehicleOperations) ? current.vehicleOperations : [],
      bookings: [],
      payments: [],
      customers: [],
      notifications: [],
      leads: [],
      auditLog: [],
      updatedAt: now(),
    };

    await kvCommand("SET", [operationsKey, JSON.stringify(next)]);

    sendJson(res, 200, {
      ok: true,
      message: "Launch-test bookings, payments, customers and notification records cleared.",
      before,
      after: {
        bookings: 0,
        payments: 0,
        customers: 0,
        notifications: 0,
        leads: 0,
        auditLog: 0,
      },
      preserved: {
        vehicleOperations: count(next.vehicleOperations),
      },
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: "admin_reset_failed", message: publicError(error) });
  }
}
