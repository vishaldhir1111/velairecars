export function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status;
  Object.entries({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { error: "method_not_allowed", allowed: methods });
  return false;
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.split("=");
        return [decodeURIComponent(key), decodeURIComponent(value.join("="))];
      }),
  );
}

export function sessionCookie(req, token, maxAge = 60 * 60 * 24 * 30) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure = forwardedProto === "https" || req.headers.host?.includes("vercel.app");
  const secure = isSecure ? "; Secure" : "";
  return `velaire_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearSessionCookie(req) {
  return sessionCookie(req, "", 0);
}

export function publicError(error) {
  if (error?.publicMessage) return error.publicMessage;
  if (error?.message) return error.message;
  return "Unexpected Velaire API error.";
}
