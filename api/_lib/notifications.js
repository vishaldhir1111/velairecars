import crypto from "node:crypto";
import { saveNotificationRecord } from "./operations-store.js";

const eventCopy = {
  booking_created: {
    subject: "Your Velaire reservation request has been received",
    title: "Reservation request received.",
    intro:
      "Your Velaire booking request is now with the concierge team. We will review availability, driver details and handover requirements.",
  },
  deposit_paid: {
    subject: "Your Velaire deposit has been received",
    title: "Deposit paid. Your reservation is moving forward.",
    intro:
      "Stripe has confirmed your reservation deposit. The concierge team will now finalise handover timing, documents and vehicle release details.",
  },
  payment_failed: {
    subject: "Your Velaire deposit payment needs attention",
    title: "Deposit payment was not completed.",
    intro:
      "Stripe did not confirm the reservation deposit. Your booking is not treated as paid until the deposit is completed securely.",
  },
  booking_approved: {
    subject: "Your Velaire reservation has been approved",
    title: "Reservation approved.",
    intro:
      "Your booking has been approved by Velaire operations. The concierge team will coordinate final handover details.",
  },
  booking_rejected: {
    subject: "Update on your Velaire reservation request",
    title: "Reservation request update.",
    intro:
      "We cannot approve this booking in its current form. The concierge team can help adjust vehicle, dates or handover requirements.",
  },
  handover_reminder: {
    subject: "Your Velaire handover is approaching",
    title: "Handover reminder.",
    intro:
      "Your Velaire handover is approaching. Please ensure licence, address and identity checks are complete before release.",
  },
  admin_new_booking: {
    subject: "New Velaire booking request",
    title: "New booking request.",
    intro: "A new client reservation has entered the Velaire operations queue.",
  },
  admin_deposit_paid: {
    subject: "Velaire deposit paid",
    title: "Deposit paid.",
    intro: "Stripe has confirmed a Velaire reservation deposit.",
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

function emailId(type, booking = {}, payment = {}) {
  return `ntf_${crypto
    .createHash("sha256")
    .update(`${type}:${booking.id || booking.reference || ""}:${payment.id || payment.checkoutSessionId || ""}:${Date.now()}`)
    .digest("hex")
    .slice(0, 18)}`;
}

function emailHtml({ type, booking = {}, payment = {}, note = "" }) {
  const copy = eventCopy[type] || eventCopy.booking_created;
  const siteUrl = (process.env.VELAIRE_SITE_URL || "https://www.velairecars.com").replace(/\/$/, "");
  const rows = [
    ["Vehicle", booking.vehicleName || payment.vehicleName || "Velaire vehicle"],
    ["Reference", booking.reference || payment.bookingReference || booking.id || "Pending"],
    ["Status", booking.status || payment.status || "Pending"],
    ["Payment", booking.paymentStatus || payment.status || "Not started"],
    ["Deposit", payment.amount ? money(payment.amount, payment.currency || "GBP") : booking.totals?.deposit ? money(booking.totals.deposit, booking.totals.currency || "GBP") : "To be confirmed"],
    ["Handover", booking.location || "Concierge handover pending"],
  ];

  return `
    <div style="margin:0;padding:32px;background:#070605;color:#f8f2ec;font-family:Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;border:1px solid rgba(215,161,140,.28);border-radius:18px;background:#11100f;overflow:hidden;">
        <div style="padding:28px 30px;border-bottom:1px solid rgba(215,161,140,.18);">
          <p style="margin:0 0 8px;color:#d7a18c;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Velaire Cars</p>
          <h1 style="margin:0;color:#fff;font-size:28px;line-height:1.1;">${escapeHtml(copy.title)}</h1>
        </div>
        <div style="padding:28px 30px;">
          <p style="margin:0 0 22px;color:#d8d0c8;font-size:15px;line-height:1.7;">${escapeHtml(copy.intro)}</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
            ${rows
              .map(
                ([label, value]) => `
                  <tr>
                    <td style="padding:11px 0;border-bottom:1px solid rgba(248,242,236,.12);color:#a99f96;font-size:12px;text-transform:uppercase;letter-spacing:1.4px;">${escapeHtml(label)}</td>
                    <td style="padding:11px 0;border-bottom:1px solid rgba(248,242,236,.12);color:#fff;text-align:right;font-size:14px;">${escapeHtml(value)}</td>
                  </tr>
                `,
              )
              .join("")}
          </table>
          ${note ? `<p style="margin:0 0 20px;color:#d8d0c8;font-size:14px;line-height:1.7;">${escapeHtml(note)}</p>` : ""}
          <a href="${siteUrl}/account.html" style="display:inline-block;background:#d7a18c;color:#130d0b;text-decoration:none;border-radius:999px;padding:13px 20px;font-weight:700;">Open client lounge</a>
        </div>
      </div>
    </div>
  `;
}

async function rememberNotification(notification) {
  try {
    await saveNotificationRecord(notification);
  } catch {
    // Email delivery must not fail the booking, payment or webhook path.
  }
}

export async function sendNotification({ type, to, booking = {}, payment = {}, note = "", audience = "client" } = {}) {
  const copy = eventCopy[type] || eventCopy.booking_created;
  const notification = {
    id: emailId(type, booking, payment),
    type,
    audience,
    to: to || "",
    subject: copy.subject,
    bookingId: booking.id || payment.bookingId || "",
    paymentId: payment.id || "",
    status: "queued",
    createdAt: new Date().toISOString(),
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
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.VELAIRE_EMAIL_FROM || "Velaire Cars <reservations@velairecars.com>",
        to,
        subject: copy.subject,
        html: emailHtml({ type, booking, payment, note }),
      }),
    });
    const data = await response.json().catch(() => ({}));
    notification.status = response.ok ? "sent" : "failed";
    notification.providerId = data.id || "";
    notification.reason = response.ok ? "" : data.message || data.error || "resend_send_failed";
  } catch (error) {
    notification.status = "failed";
    notification.reason = error.message || "resend_send_failed";
  }

  await rememberNotification(notification);
  return notification;
}

export async function notifyClientAndAdmin({ clientType, adminType, booking = {}, payment = {}, note = "" } = {}) {
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
      }),
    );
  }
  return Promise.all(tasks);
}
