const resendEndpoint = "https://api.resend.com/emails";

function now() {
  return new Date().toISOString();
}

function clean(value = "") {
  return String(value || "").trim();
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function plainText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function emailConfig() {
  return {
    apiKey: clean(process.env.RESEND_API_KEY),
    from: clean(process.env.VELAIRE_EMAIL_FROM) || "Velaire Cars <onboarding@resend.dev>",
    replyTo: clean(process.env.VELAIRE_REPLY_TO),
    adminEmail: clean(process.env.VELAIRE_ADMIN_EMAIL || process.env.ADMIN_EMAIL),
    siteUrl: (clean(process.env.VELAIRE_SITE_URL) || "https://www.velairecars.com").replace(/\/$/, ""),
  };
}

function money(value = 0, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function dateLabel(value = "", time = "") {
  if (!value) return "To be confirmed";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  const date = Number.isNaN(parsed.getTime())
    ? clean(value)
    : new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(parsed);
  return time ? `${date}, ${time}` : date;
}

function statusLabel(status = "") {
  return clean(status || "pending")
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function bookingReference(booking = {}) {
  return booking.reference || booking.id || "Velaire reservation";
}

function bookingRows(booking = {}) {
  const rows = [
    ["Reference", bookingReference(booking)],
    ["Vehicle", booking.vehicleName || "Selected Velaire vehicle"],
    ["Pickup", dateLabel(booking.pickup, booking.pickupTime)],
    ["Return", dateLabel(booking.return, booking.returnTime)],
    ["Handover", booking.location || "Concierge handover to be confirmed"],
    ["Reserve deposit", money(booking.totals?.deposit || 0, booking.totals?.currency || "GBP")],
  ];
  return rows.filter(([, value]) => clean(value));
}

function rowsHtml(rows = []) {
  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid rgba(211,170,113,.16);color:#b8aea0;font-size:13px;letter-spacing:.05em;text-transform:uppercase;">${escapeHtml(label)}</td>
          <td style="padding:14px 0;border-bottom:1px solid rgba(211,170,113,.16);color:#fff7ee;font-size:15px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");
}

function emailShell({ preheader = "", eyebrow = "Velaire Cars", title = "", intro = "", rows = [], ctaLabel = "", ctaUrl = "", footnote = "" } = {}) {
  const preview = escapeHtml(preheader || intro || title);
  const action = ctaLabel && ctaUrl
    ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;margin-top:22px;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#f1c28f,#b98252);color:#120d0a;text-decoration:none;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px;">${escapeHtml(ctaLabel)}</a>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title || "Velaire Cars")}</title>
  </head>
  <body style="margin:0;background:#090706;color:#fff7ee;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:radial-gradient(circle at top,#2b1712 0,#090706 42%,#050404 100%);padding:34px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border:1px solid rgba(211,170,113,.24);border-radius:28px;background:rgba(12,10,9,.92);box-shadow:0 24px 80px rgba(0,0,0,.45);overflow:hidden;">
            <tr>
              <td style="padding:34px 34px 18px;border-bottom:1px solid rgba(211,170,113,.16);">
                <div style="color:#d3aa71;font-size:12px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin:12px 0 0;color:#fff7ee;font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-.02em;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 34px 34px;">
                <p style="margin:0;color:#d8cec1;font-size:16px;line-height:1.75;">${escapeHtml(intro)}</p>
                ${rows.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;">${rowsHtml(rows)}</table>` : ""}
                ${action}
                ${footnote ? `<p style="margin:24px 0 0;color:#93887b;font-size:13px;line-height:1.7;">${escapeHtml(footnote)}</p>` : ""}
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;color:#786d62;font-size:12px;">Velaire Cars · Concierge handover, depart with class</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function eventFor({ type, audience, recipient, subject, booking, payment, status = "queued", provider = "resend", providerId = "", reason = "" }) {
  return {
    type,
    audience,
    recipient: clean(recipient),
    subject: clean(subject),
    status,
    provider,
    providerId,
    reason: plainText(reason),
    bookingId: booking?.id || payment?.bookingId || "",
    bookingReference: booking?.reference || payment?.bookingReference || "",
    paymentId: payment?.id || "",
    createdAt: now(),
  };
}

async function sendEmail({ type, audience, to, subject, html, text, booking, payment, idempotencyKey }) {
  const config = emailConfig();
  const recipient = clean(to);
  if (!recipient) {
    return eventFor({ type, audience, recipient, subject, booking, payment, status: "skipped", reason: "No recipient configured." });
  }
  if (!config.apiKey) {
    return eventFor({
      type,
      audience,
      recipient,
      subject,
      booking,
      payment,
      status: "skipped",
      reason: "RESEND_API_KEY is not configured.",
    });
  }

  try {
    const payload = {
      from: config.from,
      to: recipient,
      subject,
      html,
      text: plainText(text),
    };
    if (config.replyTo) payload.reply_to = config.replyTo;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    const response = await fetch(resendEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey || `${type}:${booking?.id || payment?.id || recipient}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return eventFor({
        type,
        audience,
        recipient,
        subject,
        booking,
        payment,
        status: "failed",
        reason: body.message || body.error || `Resend returned HTTP ${response.status}.`,
      });
    }
    return eventFor({
      type,
      audience,
      recipient,
      subject,
      booking,
      payment,
      status: "sent",
      providerId: body.id || "",
    });
  } catch (error) {
    return eventFor({
      type,
      audience,
      recipient,
      subject,
      booking,
      payment,
      status: "failed",
      reason: error.message || "Resend request failed.",
    });
  }
}

export async function sendBookingCreatedNotifications({ booking } = {}) {
  const config = emailConfig();
  const reference = bookingReference(booking);
  const customerSubject = `Velaire reservation received: ${reference}`;
  const adminSubject = `New Velaire booking: ${reference}`;
  const rows = bookingRows(booking);

  return Promise.all([
    sendEmail({
      type: "booking_confirmation",
      audience: "customer",
      to: booking?.customerEmail,
      subject: customerSubject,
      booking,
      html: emailShell({
        preheader: "Your Velaire reservation request has been received.",
        title: "Your reservation is in motion.",
        intro: "Thank you for choosing Velaire. Our concierge team has received your request and will confirm the final handover details with care.",
        rows,
        ctaLabel: "View the fleet",
        ctaUrl: `${config.siteUrl}/#fleet`,
        footnote: "No account is required. The concierge team will contact you using the details supplied with your reservation.",
      }),
      text: `Your Velaire reservation has been received. Reference ${reference}.`,
      idempotencyKey: `booking-confirmation:${booking?.id || reference}`,
    }),
    sendEmail({
      type: "admin_new_booking",
      audience: "admin",
      to: config.adminEmail,
      subject: adminSubject,
      booking,
      html: emailShell({
        preheader: "A new Velaire reservation needs review.",
        eyebrow: "Velaire Operations",
        title: "New booking received.",
        intro: `${booking?.customerName || "A guest client"} has submitted a reservation request. Review availability, handover details and client follow-up in Operations.`,
        rows: [
          ["Client", booking?.customerName || "Guest client"],
          ["Email", booking?.customerEmail || "No email supplied"],
          ["Phone", booking?.customerPhone || "No phone supplied"],
          ...rows,
        ],
        ctaLabel: "Open operations",
        ctaUrl: `${config.siteUrl}/portal`,
      }),
      text: `New Velaire booking ${reference} from ${booking?.customerEmail || "guest client"}.`,
      idempotencyKey: `admin-new-booking:${booking?.id || reference}`,
    }),
  ]);
}

export async function sendPaymentPendingNotifications({ payment, booking } = {}) {
  const config = emailConfig();
  const reference = bookingReference(booking || payment);
  const subject = `Velaire deposit step prepared: ${reference}`;
  return Promise.all([
    sendEmail({
      type: "deposit_session_created",
      audience: "customer",
      to: payment?.customerEmail || booking?.customerEmail,
      subject,
      payment,
      booking,
      html: emailShell({
        preheader: "Your secure deposit step is ready.",
        title: "Secure deposit step prepared.",
        intro: "Your reservation details have been prepared for the deposit step. Once payment is complete, the concierge team will hold the vehicle for final approval.",
        rows: [
          ["Reference", reference],
          ["Vehicle", payment?.vehicleName || booking?.vehicleName || "Selected Velaire vehicle"],
          ["Deposit", money(payment?.amount || booking?.totals?.deposit || 0, payment?.currency || "GBP")],
          ["Status", statusLabel(payment?.status || "payment_pending")],
        ],
        footnote: "If you have already completed payment, no further action is required while the system updates the reservation state.",
      }),
      text: `Your Velaire deposit step has been prepared for ${reference}.`,
      idempotencyKey: `deposit-session-created:${payment?.id || reference}`,
    }),
  ]);
}

export async function sendDepositPaidNotifications({ payment, booking } = {}) {
  const config = emailConfig();
  const reference = bookingReference(booking || payment);
  const rows = [
    ["Reference", reference],
    ["Vehicle", payment?.vehicleName || booking?.vehicleName || "Selected Velaire vehicle"],
    ["Deposit paid", money(payment?.amount || booking?.totals?.deposit || 0, payment?.currency || "GBP")],
    ["Booking status", statusLabel(booking?.status || "confirmed")],
  ];

  return Promise.all([
    sendEmail({
      type: "deposit_paid_confirmation",
      audience: "customer",
      to: payment?.customerEmail || booking?.customerEmail,
      subject: `Deposit confirmed: ${reference}`,
      payment,
      booking,
      html: emailShell({
        preheader: "Your Velaire reservation deposit is confirmed.",
        title: "Deposit confirmed.",
        intro: "Your reservation deposit has been received. Velaire will now finalise availability, handover timing and concierge delivery details.",
        rows,
        ctaLabel: "Browse Velaire",
        ctaUrl: `${config.siteUrl}/#fleet`,
        footnote: "The remaining balance and any delivery details will be confirmed privately by the concierge team.",
      }),
      text: `Deposit confirmed for Velaire reservation ${reference}.`,
      idempotencyKey: `deposit-paid-customer:${payment?.id || reference}`,
    }),
    sendEmail({
      type: "admin_deposit_paid",
      audience: "admin",
      to: config.adminEmail,
      subject: `Deposit paid: ${reference}`,
      payment,
      booking,
      html: emailShell({
        preheader: "A Velaire reservation deposit has been paid.",
        eyebrow: "Velaire Operations",
        title: "Deposit paid.",
        intro: "A reservation deposit has been recorded. Review the booking and prepare concierge approval or handover follow-up.",
        rows: [
          ["Client", booking?.customerName || payment?.customerName || "Guest client"],
          ["Email", booking?.customerEmail || payment?.customerEmail || "No email supplied"],
          ...rows,
        ],
        ctaLabel: "Open operations",
        ctaUrl: `${config.siteUrl}/portal`,
      }),
      text: `Deposit paid for Velaire reservation ${reference}.`,
      idempotencyKey: `deposit-paid-admin:${payment?.id || reference}`,
    }),
  ]);
}

export async function sendBookingStatusUpdateNotifications({ booking, status } = {}) {
  const config = emailConfig();
  const reference = bookingReference(booking);
  const label = statusLabel(status || booking?.status);
  return Promise.all([
    sendEmail({
      type: "booking_status_update",
      audience: "customer",
      to: booking?.customerEmail,
      subject: `Velaire booking update: ${reference}`,
      booking,
      html: emailShell({
        preheader: `Your Velaire booking is now ${label}.`,
        title: "Booking status updated.",
        intro: `Your reservation is now ${label}. The Velaire concierge team will contact you if any further handover detail is needed.`,
        rows: [
          ["Reference", reference],
          ["Vehicle", booking?.vehicleName || "Selected Velaire vehicle"],
          ["Status", label],
          ["Handover", booking?.location || "Concierge handover to be confirmed"],
        ],
        ctaLabel: "View Velaire",
        ctaUrl: `${config.siteUrl}/#fleet`,
      }),
      text: `Your Velaire booking ${reference} is now ${label}.`,
      idempotencyKey: `booking-status:${booking?.id || reference}:${status || booking?.status}`,
    }),
  ]);
}
