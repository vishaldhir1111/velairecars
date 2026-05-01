import crypto from "node:crypto";
import { getNotificationRecord, saveNotificationRecord } from "./operations-store.js";

const eventCopy = {
  booking_created: {
    subject: "Your Velaire reservation request has been received",
    title: "Reservation request received.",
    intro:
      "Your guest reservation is now with the Velaire concierge team. We will review availability, timing and handover details before final release.",
    nextSteps: ["Your deposit step is secure through Stripe.", "Concierge will review the booking details.", "You will receive a clear update once the reservation is approved."],
    ctaLabel: "View the fleet",
    ctaPath: "/#fleet",
  },
  deposit_paid: {
    subject: "Your Velaire deposit has been received",
    title: "Deposit paid. Your reservation is moving forward.",
    intro:
      "Stripe has confirmed your reservation deposit. Velaire operations will now finalise handover timing, checks and vehicle release details.",
    nextSteps: ["Your payment status is now deposit paid.", "The vehicle remains in concierge review.", "We will confirm release details before handover."],
    ctaLabel: "Reserve another vehicle",
    ctaPath: "/booking.html",
  },
  payment_failed: {
    subject: "Your Velaire deposit payment needs attention",
    title: "Deposit payment was not completed.",
    intro:
      "Stripe did not confirm the reservation deposit. Your booking is not treated as paid until the deposit is completed securely.",
    nextSteps: ["Return to the secure payment page if you want to retry.", "No raw card details are stored by Velaire.", "Concierge can assist if your booking details need adjusting."],
    ctaLabel: "Return to payment",
    ctaPath: "/payment.html",
  },
  payment_cancelled: {
    subject: "Your Velaire deposit session was cancelled",
    title: "Deposit session cancelled.",
    intro:
      "The Stripe Checkout session ended before payment was completed. The booking is not confirmed as paid.",
    nextSteps: ["You can restart the secure deposit step.", "Concierge will only treat the booking as paid once Stripe confirms it.", "No card details were stored by Velaire."],
    ctaLabel: "Restart deposit",
    ctaPath: "/payment.html",
  },
  booking_approved: {
    subject: "Your Velaire reservation has been approved",
    title: "Reservation approved.",
    intro:
      "Your booking has been approved by Velaire operations. The concierge team will coordinate the final handover details with you.",
    nextSteps: ["Keep your licence and ID available for handover checks.", "Watch for delivery timing confirmation.", "Reply to Velaire if access notes or arrival timing change."],
    ctaLabel: "Browse Velaire",
    ctaPath: "/",
  },
  booking_rejected: {
    subject: "Update on your Velaire reservation request",
    title: "Reservation request update.",
    intro:
      "We cannot approve this booking in its current form. The concierge team can help adjust the vehicle, dates or handover requirements.",
    nextSteps: ["Review alternative dates or vehicles.", "Concierge can advise on the closest suitable option.", "No release is confirmed for this reservation."],
    ctaLabel: "Choose another vehicle",
    ctaPath: "/booking.html",
  },
  booking_cancelled: {
    subject: "Your Velaire reservation has been cancelled",
    title: "Reservation cancelled.",
    intro:
      "This reservation has been cancelled in Velaire operations. If this was unexpected, contact the concierge team before creating another booking.",
    nextSteps: ["The booking is no longer holding vehicle availability.", "Any deposit/refund handling will be reviewed separately.", "You can start a fresh guest reservation when ready."],
    ctaLabel: "Start a fresh booking",
    ctaPath: "/booking.html",
  },
  handover_reminder: {
    subject: "Your Velaire handover is approaching",
    title: "Handover reminder.",
    intro:
      "Your Velaire handover window is approaching. Please make sure access notes, delivery timing and required documents are ready.",
    nextSteps: ["Keep licence and ID available.", "Confirm the handover address is accessible.", "Send concierge any gate, hotel or arrival notes before delivery."],
    ctaLabel: "View Velaire",
    ctaPath: "/",
  },
  admin_new_booking: {
    subject: "New Velaire booking request",
    title: "New booking request.",
    intro: "A guest reservation has entered the Velaire operations queue and requires review.",
    nextSteps: ["Check customer details and dates.", "Confirm availability and handover feasibility.", "Approve or cancel the booking from the operations portal."],
    ctaLabel: "Open operations",
    ctaPath: "/portal",
  },
  admin_deposit_paid: {
    subject: "Velaire deposit paid",
    title: "Deposit paid.",
    intro: "Stripe has confirmed a Velaire reservation deposit. The booking is ready for operations approval and handover checks.",
    nextSteps: ["Confirm vehicle availability.", "Check customer and billing details.", "Prepare approval or follow-up from the portal."],
    ctaLabel: "Open operations",
    ctaPath: "/portal",
  },
  admin_payment_failed: {
    subject: "Velaire deposit failed",
    title: "Deposit payment failed.",
    intro: "Stripe reported that a reservation deposit did not complete successfully.",
    nextSteps: ["Review the booking in operations.", "Check whether the customer retried payment.", "Follow up only if the reservation should remain active."],
    ctaLabel: "Open operations",
    ctaPath: "/portal",
  },
  admin_payment_cancelled: {
    subject: "Velaire Checkout session cancelled",
    title: "Checkout session cancelled.",
    intro: "A Stripe Checkout session ended before the deposit was paid.",
    nextSteps: ["Review whether the booking should remain pending.", "Watch for a fresh Checkout attempt.", "Cancel stale holds if required."],
    ctaLabel: "Open operations",
    ctaPath: "/portal",
  },
  admin_booking_review: {
    subject: "Velaire booking requires review",
    title: "Booking requires review.",
    intro: "A reservation is waiting for operational review before it can move forward.",
    nextSteps: ["Check availability and handover notes.", "Review deposit status.", "Approve, cancel or request follow-up from the portal."],
    ctaLabel: "Open operations",
    ctaPath: "/portal",
  },
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(amount = 0, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function humanStatus(status = "") {
  return String(status || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayDate(value = "", time = "") {
  if (!value) return "Pending";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  const formatted = Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  return time ? `${formatted}, ${time}` : formatted;
}

function notificationId({ type, audience, booking = {}, payment = {}, dedupeKey = "" } = {}) {
  const stableKey =
    dedupeKey ||
    `${type}:${audience}:${booking.id || payment.bookingId || booking.reference || ""}:${payment.id || payment.checkoutSessionId || ""}`;
  const raw = stableKey.includes(":") && (booking.id || payment.id || payment.checkoutSessionId || dedupeKey)
    ? stableKey
    : `${stableKey}:${Date.now()}`;
  return `ntf_${crypto.createHash("sha256").update(raw).digest("hex").slice(0, 18)}`;
}

function detailsRows({ audience = "client", booking = {}, payment = {} } = {}) {
  const deposit =
    payment.amount
      ? money(payment.amount, payment.currency || "GBP")
      : booking.totals?.deposit
      ? money(booking.totals.deposit, booking.totals.currency || "GBP")
      : "To be confirmed";
  const rows = [
    ["Vehicle", booking.vehicleName || payment.vehicleName || "Velaire vehicle"],
    ["Reference", booking.reference || payment.bookingReference || booking.id || "Pending"],
    ["Customer", booking.customerName || booking.customerEmail || payment.customerEmail || "Guest client"],
    ["Email", booking.customerEmail || payment.customerEmail || "Pending"],
    ["Pickup", displayDate(booking.pickup, booking.pickupTime)],
    ["Return", displayDate(booking.return, booking.returnTime)],
    ["Handover", booking.location || "Concierge handover pending"],
    ["Booking status", humanStatus(booking.status || "pending")],
    ["Payment", humanStatus(booking.paymentStatus || payment.status || "not_started")],
    ["Deposit", deposit],
  ];
  if (booking.billingPostcode || booking.billingCity || booking.billingCountry) {
    rows.splice(4, 0, ["Billing", [booking.billingPostcode, booking.billingCity, booking.billingCountry].filter(Boolean).join(", ")]);
  }
  if (audience === "admin") {
    rows.splice(4, 0, ["Phone", booking.customerPhone || payment.customerPhone || "Pending"]);
    rows.push(["Provider ref", payment.providerReference || payment.checkoutSessionId || booking.checkoutSessionId || "Pending"]);
  }
  return rows;
}

function absoluteUrl(path = "/") {
  const siteUrl = (process.env.VELAIRE_SITE_URL || "https://www.velairecars.com").replace(/\/$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function emailHtml({ type, audience = "client", booking = {}, payment = {}, note = "" }) {
  const copy = eventCopy[type] || eventCopy.booking_created;
  const rows = detailsRows({ audience, booking, payment });
  const label = audience === "admin" ? "Velaire operations" : "Velaire concierge";
  const ctaPath = copy.ctaPath || (audience === "admin" ? "/portal" : "/booking.html");

  return `
    <div style="margin:0;padding:34px;background:#060505;color:#f8f2ec;font-family:Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;border:1px solid rgba(215,161,140,.34);border-radius:18px;background:#11100f;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.32);">
        <div style="padding:30px 32px;border-bottom:1px solid rgba(215,161,140,.18);background:linear-gradient(135deg,rgba(215,161,140,.14),rgba(255,255,255,.03));">
          <p style="margin:0 0 10px;color:#d7a18c;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(label)}</p>
          <h1 style="margin:0;color:#fff;font-size:30px;line-height:1.08;font-weight:700;">${escapeHtml(copy.title)}</h1>
        </div>
        <div style="padding:30px 32px;">
          <p style="margin:0 0 24px;color:#d8d0c8;font-size:15px;line-height:1.75;">${escapeHtml(copy.intro)}</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 26px;">
            ${rows
              .map(
                ([rowLabel, value]) => `
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid rgba(248,242,236,.12);color:#a99f96;font-size:12px;text-transform:uppercase;letter-spacing:1.3px;">${escapeHtml(rowLabel)}</td>
                    <td style="padding:12px 0;border-bottom:1px solid rgba(248,242,236,.12);color:#fff;text-align:right;font-size:14px;line-height:1.45;">${escapeHtml(value)}</td>
                  </tr>
                `,
              )
              .join("")}
          </table>
          <div style="margin:0 0 24px;padding:18px;border:1px solid rgba(215,161,140,.2);border-radius:12px;background:rgba(215,161,140,.08);">
            <p style="margin:0 0 10px;color:#d7a18c;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.4px;">Next steps</p>
            <ul style="margin:0;padding-left:18px;color:#efe4db;font-size:14px;line-height:1.7;">
              ${(copy.nextSteps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
            </ul>
          </div>
          ${note ? `<p style="margin:0 0 22px;color:#d8d0c8;font-size:14px;line-height:1.7;">${escapeHtml(note)}</p>` : ""}
          <a href="${absoluteUrl(ctaPath)}" style="display:inline-block;background:#d7a18c;color:#130d0b;text-decoration:none;border-radius:999px;padding:13px 20px;font-weight:700;">${escapeHtml(copy.ctaLabel || "Open Velaire")}</a>
          <p style="margin:24px 0 0;color:#8d8179;font-size:12px;line-height:1.6;">Velaire Cars uses secure hosted payment through Stripe Checkout. No raw card details are stored by Velaire.</p>
        </div>
      </div>
    </div>
  `;
}

function emailText({ type, audience = "client", booking = {}, payment = {}, note = "" }) {
  const copy = eventCopy[type] || eventCopy.booking_created;
  const rows = detailsRows({ audience, booking, payment }).map(([label, value]) => `${label}: ${value}`);
  return [
    "Velaire Cars",
    copy.title,
    "",
    copy.intro,
    "",
    ...rows,
    "",
    "Next steps:",
    ...(copy.nextSteps || []).map((step) => `- ${step}`),
    note ? `\n${note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function rememberNotification(notification) {
  try {
    await saveNotificationRecord(notification);
  } catch {
    // Email delivery must not fail the booking, payment or webhook path.
  }
}

async function existingNotification(id) {
  try {
    return await getNotificationRecord(id);
  } catch {
    return null;
  }
}

export async function sendNotification({
  type,
  to,
  booking = {},
  payment = {},
  note = "",
  audience = "client",
  dedupeKey = "",
} = {}) {
  const copy = eventCopy[type] || eventCopy.booking_created;
  const id = notificationId({ type, audience, booking, payment, dedupeKey });
  const existing = await existingNotification(id);
  if (existing?.status === "sent") return { ...existing, skippedDuplicate: true };

  const notification = {
    id,
    type,
    audience,
    to: to || "",
    subject: copy.subject,
    bookingId: booking.id || payment.bookingId || "",
    bookingReference: booking.reference || payment.bookingReference || "",
    paymentId: payment.id || "",
    paymentStatus: booking.paymentStatus || payment.status || "",
    bookingStatus: booking.status || "",
    vehicleName: booking.vehicleName || payment.vehicleName || "",
    customerEmail: booking.customerEmail || payment.customerEmail || to || "",
    status: "queued",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!to) {
    notification.status = "skipped";
    notification.reason = "missing_recipient";
    await rememberNotification(notification);
    return notification;
  }

  if (!process.env.RESEND_API_KEY) {
    notification.status = "skipped";
    notification.reason = "resend_not_configured";
    await rememberNotification(notification);
    return notification;
  }

  try {
    const payload = {
      from: process.env.VELAIRE_EMAIL_FROM || "Velaire Cars <reservations@velairecars.com>",
      to,
      subject: copy.subject,
      html: emailHtml({ type, audience, booking, payment, note }),
      text: emailText({ type, audience, booking, payment, note }),
    };
    if (process.env.VELAIRE_EMAIL_REPLY_TO) payload.reply_to = process.env.VELAIRE_EMAIL_REPLY_TO;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    notification.status = response.ok ? "sent" : "failed";
    notification.providerId = data.id || "";
    notification.reason = response.ok ? "" : data.message || data.error?.message || data.error || "resend_send_failed";
    notification.updatedAt = new Date().toISOString();
  } catch (error) {
    notification.status = "failed";
    notification.reason = error.message || "resend_send_failed";
    notification.updatedAt = new Date().toISOString();
  }

  await rememberNotification(notification);
  return notification;
}

export async function notifyClientAndAdmin({ clientType, adminType, booking = {}, payment = {}, note = "" } = {}) {
  const baseKey = `${booking.id || payment.bookingId || booking.reference || "booking"}:${payment.id || payment.checkoutSessionId || "event"}`;
  const tasks = [];
  if (clientType) {
    tasks.push(
      sendNotification({
        type: clientType,
        to: booking.customerEmail || payment.customerEmail || "",
        booking,
        payment,
        note,
        audience: "client",
        dedupeKey: `${clientType}:client:${baseKey}`,
      }),
    );
  }
  if (adminType && process.env.VELAIRE_ADMIN_EMAIL) {
    tasks.push(
      sendNotification({
        type: adminType,
        to: process.env.VELAIRE_ADMIN_EMAIL,
        booking,
        payment,
        note,
        audience: "admin",
        dedupeKey: `${adminType}:admin:${baseKey}`,
      }),
    );
  }
  return Promise.all(tasks);
}
