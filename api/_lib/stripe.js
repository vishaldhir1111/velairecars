import crypto from "node:crypto";

const stripeApiBase = "https://api.stripe.com/v1";
const stripeApiVersion = "2026-02-25.clover";

function clean(value = "") {
  return String(value || "").trim();
}

function siteUrl(req = null) {
  const configured = clean(process.env.VELAIRE_SITE_URL || process.env.SITE_URL || process.env.VERCEL_URL);
  if (configured) {
    const withProtocol = configured.startsWith("http") ? configured : `https://${configured}`;
    return withProtocol.replace(/\/$/, "");
  }
  const host = req?.headers?.host || "www.velairecars.com";
  const protocol = req?.headers?.["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`.replace(/\/$/, "");
}

export function stripeConfigured() {
  return Boolean(clean(process.env.STRIPE_SECRET_KEY));
}

function stripeError(message, status = 500, code = "stripe_error") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.publicMessage = message;
  return error;
}

function appendFormValue(params, key, value) {
  if (value === undefined || value === null || value === "") return;
  params.append(key, String(value));
}

export async function createStripeCheckoutSession({ req, payment, booking } = {}) {
  const secretKey = clean(process.env.STRIPE_SECRET_KEY);
  if (!secretKey) {
    throw stripeError("Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel and redeploy.", 503, "stripe_not_configured");
  }
  if (!payment?.id) {
    throw stripeError("Create a deposit record before starting Stripe Checkout.", 400, "payment_required");
  }

  const baseUrl = siteUrl(req);
  const amount = Math.round(Number(payment.amount || booking?.totals?.deposit || 0) * 100);
  if (!Number.isFinite(amount) || amount < 50) {
    throw stripeError("The reservation deposit amount is not valid.", 400, "invalid_deposit_amount");
  }

  const params = new URLSearchParams();
  appendFormValue(params, "mode", "payment");
  appendFormValue(params, "success_url", `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}&booking=${encodeURIComponent(booking?.id || payment.bookingId || "")}`);
  appendFormValue(params, "cancel_url", `${baseUrl}/payment.html?payment=cancelled&booking=${encodeURIComponent(booking?.id || payment.bookingId || "")}`);
  appendFormValue(params, "client_reference_id", booking?.id || payment.bookingId);
  appendFormValue(params, "customer_email", payment.customerEmail || booking?.customerEmail);
  appendFormValue(params, "line_items[0][quantity]", 1);
  appendFormValue(params, "line_items[0][price_data][currency]", (payment.currency || "GBP").toLowerCase());
  appendFormValue(params, "line_items[0][price_data][unit_amount]", amount);
  appendFormValue(params, "line_items[0][price_data][product_data][name]", `Velaire reservation deposit - ${payment.vehicleName || booking?.vehicleName || "Selected vehicle"}`);
  appendFormValue(
    params,
    "line_items[0][price_data][product_data][description]",
    `Secure deposit for ${booking?.reference || payment.bookingReference || "Velaire reservation"}.`,
  );
  appendFormValue(params, "metadata[bookingId]", booking?.id || payment.bookingId);
  appendFormValue(params, "metadata[paymentId]", payment.id);
  appendFormValue(params, "metadata[bookingReference]", booking?.reference || payment.bookingReference);
  appendFormValue(params, "metadata[vehicleSlug]", booking?.vehicleSlug || payment.vehicleSlug);
  appendFormValue(params, "payment_intent_data[metadata][bookingId]", booking?.id || payment.bookingId);
  appendFormValue(params, "payment_intent_data[metadata][paymentId]", payment.id);
  appendFormValue(params, "payment_intent_data[metadata][bookingReference]", booking?.reference || payment.bookingReference);

  const response = await fetch(`${stripeApiBase}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": stripeApiVersion,
    },
    body: params.toString(),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    throw stripeError(payload.error?.message || "Stripe Checkout could not be created. Please try again.", response.status || 500, payload.error?.code || "checkout_failed");
  }
  return payload;
}

export async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

export function verifyStripeWebhookSignature(rawBody, signatureHeader = "") {
  const secret = clean(process.env.STRIPE_WEBHOOK_SECRET);
  if (!secret) {
    throw stripeError("Stripe webhook secret is not configured.", 503, "stripe_webhook_not_configured");
  }
  const parts = Object.fromEntries(
    String(signatureHeader || "")
      .split(",")
      .map((part) => part.split("="))
      .filter(([key, value]) => key && value),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    throw stripeError("Stripe webhook signature is missing.", 400, "invalid_stripe_signature");
  }
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    throw stripeError("Stripe webhook signature could not be verified.", 400, "invalid_stripe_signature");
  }
}
