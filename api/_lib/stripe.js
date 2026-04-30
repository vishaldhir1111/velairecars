import crypto from "node:crypto";

export function stripeConfigured() {
  return /^sk_(test|live)_/.test(String(process.env.STRIPE_SECRET_KEY || ""));
}

export function originFor(req) {
  if (process.env.VELAIRE_SITE_URL) return process.env.VELAIRE_SITE_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "velairecars.com";
  return `${proto}://${host}`;
}

export async function stripeRequest(path, { method = "GET", body = null } = {}) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    const error = new Error("Stripe is not configured.");
    error.status = 503;
    error.publicMessage = "Stripe payments are not configured. Add STRIPE_SECRET_KEY in Vercel before taking deposits.";
    throw error;
  }

  if (!stripeConfigured()) {
    const error = new Error("Stripe secret key is invalid.");
    error.status = 503;
    error.publicMessage = "Stripe payments are not configured with a valid secret key.";
    throw error;
  }

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || "Stripe request failed.");
    error.status = response.status;
    error.publicMessage = data.error?.message || "Stripe could not process this request.";
    error.stripe = data;
    throw error;
  }
  return data;
}

export async function createStripeCheckoutSession(req, payment, reservation = {}, booking = null) {
  const origin = originFor(req);
  const amount = Math.round(Number(payment.amount || 0) * 100);
  if (!Number.isFinite(amount) || amount < 50) {
    const error = new Error("Deposit amount is too low for Stripe Checkout.");
    error.status = 400;
    error.publicMessage = "The reservation deposit could not be prepared.";
    throw error;
  }

  const vehicleName = booking?.vehicleName || payment.vehicleName || reservation.vehicleName || "Velaire Cars reservation";
  const metadata = {
    velaire: "true",
    payment_id: payment.id,
    booking_id: payment.bookingId || booking?.id || reservation.bookingId || "",
    booking_reference: payment.bookingReference || booking?.reference || reservation.reference || "",
    vehicle_slug: reservation.vehicle || booking?.vehicleSlug || "",
    vehicle_name: vehicleName,
    customer_name: reservation.name || reservation.fullName || booking?.customerName || "",
    customer_email: reservation.email || payment.customerEmail || booking?.customerEmail || "",
    customer_phone: reservation.phone || payment.customerPhone || booking?.customerPhone || "",
    pickup: reservation.pickup || booking?.pickup || "",
    pickup_time: reservation.pickupTime || booking?.pickupTime || "",
    return_date: reservation.return || booking?.return || "",
    return_time: reservation.returnTime || booking?.returnTime || "",
    location: reservation.formattedAddress || reservation.location || booking?.location || "",
    hire_estimate: String(reservation.hireEstimate || booking?.totals?.hireEstimate || ""),
    deposit_amount: String(payment.amount || booking?.totals?.deposit || ""),
  };
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("payment_method_types[0]", "card");
  params.set("client_reference_id", booking?.id || payment.bookingId || payment.id);
  params.set("line_items[0][price_data][currency]", String(payment.currency || "GBP").toLowerCase());
  params.set("line_items[0][price_data][product_data][name]", "Velaire Cars reservation deposit");
  params.set("line_items[0][price_data][product_data][description]", vehicleName);
  params.set("line_items[0][price_data][unit_amount]", String(amount));
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/payment.html?payment=cancelled`);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      params.set(`metadata[${key}]`, String(value).slice(0, 500));
    }
  });
  params.set("payment_intent_data[metadata][payment_id]", payment.id);
  if (metadata.booking_id) params.set("payment_intent_data[metadata][booking_id]", metadata.booking_id);
  params.set("payment_intent_data[metadata][velaire]", "true");
  if (reservation.email) params.set("customer_email", reservation.email);

  return stripeRequest("/checkout/sessions", { method: "POST", body: params });
}

export async function retrieveStripeCheckoutSession(sessionId) {
  if (!sessionId) {
    const error = new Error("Checkout session ID is required.");
    error.status = 400;
    error.publicMessage = "Checkout session ID is required.";
    throw error;
  }
  return stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
}

export async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export function verifyStripeSignature(rawBody, signatureHeader, secret = process.env.STRIPE_WEBHOOK_SECRET) {
  if (!secret || !signatureHeader) return false;
  const timestamp = String(signatureHeader)
    .split(",")
    .find((part) => part.startsWith("t="))
    ?.slice(2);
  const signatures = String(signatureHeader)
    .split(",")
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  if (!timestamp || !signatures.length) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return signatures.some((signature) => {
    const receivedBuffer = Buffer.from(signature, "hex");
    return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  });
}

export function paymentStatusFromCheckoutSession(session = {}) {
  if (session.status === "complete" && session.payment_status === "paid") return "deposit_paid";
  if (session.status === "expired") return "cancelled";
  if (session.payment_status === "unpaid" && session.status === "complete") return "failed";
  return "payment_pending";
}
