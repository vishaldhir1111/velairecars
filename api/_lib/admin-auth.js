export const defaultPortalPassword = "AG23HS60";

export function adminAllowed(req) {
  const expected = process.env.VELAIRE_PORTAL_PASSWORD || defaultPortalPassword;
  const headerToken = req.headers["x-velaire-admin-token"] || "";
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const queryToken = req.query?.token || "";
  return [headerToken, bearer, queryToken].some((token) => String(token || "").trim() === expected);
}
