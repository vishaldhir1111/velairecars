import crypto from "node:crypto";
import { allowMethods, sendJson } from "../_lib/http.js";
import { markPaymentStatus } from "../_lib/store.js";

async function readRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!secret) return true;
  const parts = Object.fromEntries(
    String(signatureHeader || "")
      .split(",")
      .map((part) => part.split("="))
      .filter(([key, value]) => key && value),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const rawBody = await readRawBody(req);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers["stripe-signature"];

  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    sendJson(res, 400, { error: "invalid_signature", message: "Stripe webhook signature could not be verified." });
    return;
  }

  const event = JSON.parse(rawBody || "{}");
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object || {};
    markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status: "paid",
      providerReference: session.id,
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data?.object || {};
    markPaymentStatus({
      paymentId: session.metadata?.payment_id,
      bookingId: session.metadata?.booking_id,
      status: "expired",
      providerReference: session.id,
    });
  }

  sendJson(res, 200, { received: true });
}
