import { calculateBookingTotals, findVehicle } from "./fleet-data.js";
import { paymentStatusFromCheckoutSession, stripeConfigured, stripeRequest } from "./stripe.js";

function nowFromStripe(value) {
  const timestamp = Number(value || 0);
  return timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString();
}

function amountFromStripe(value) {
  return Math.round(Number(value || 0)) / 100;
}

function bookingStatusForPayment(paymentStatus) {
  if (paymentStatus === "deposit_paid") return "confirmed";
  if (["failed", "cancelled", "refunded"].includes(paymentStatus)) return "cancelled";
  return "payment_pending";
}

function sessionIsVelaire(session = {}) {
  const metadata = session.metadata || {};
  return (
    metadata.velaire === "true" ||
    Boolean(metadata.payment_id) ||
    Boolean(metadata.booking_id) ||
    String(session.client_reference_id || "").startsWith("bok_")
  );
}

function normaliseSession(session = {}, statusOverride = "") {
  const metadata = session.metadata || {};
  const customer = session.customer_details || {};
  const vehicleSlug = metadata.vehicle_slug || metadata.vehicle || "";
  const vehicle = findVehicle(vehicleSlug);
  const paymentStatus = statusOverride || paymentStatusFromCheckoutSession(session);
  const amount = amountFromStripe(session.amount_total || metadata.deposit_amount * 100 || vehicle.deposit * 100);
  const createdAt = nowFromStripe(session.created);
  const bookingId = metadata.booking_id || session.client_reference_id || `stripe_${session.id}`;
  const bookingReference =
    metadata.booking_reference || (String(bookingId).startsWith("bok_") ? String(bookingId).slice(-8).toUpperCase() : `STRIPE-${String(session.id || "").slice(-8).toUpperCase()}`);
  const totals = calculateBookingTotals({
    vehicleSlug: vehicle.slug,
    pickup: metadata.pickup,
    returnDate: metadata.return_date,
    days: 0,
  });

  const booking = {
    id: bookingId,
    reference: bookingReference,
    userId: "",
    customerName: metadata.customer_name || customer.name || "Stripe Checkout client",
    customerEmail: metadata.customer_email || customer.email || session.customer_email || "",
    customerPhone: metadata.customer_phone || customer.phone || "",
    vehicleSlug: vehicle.slug,
    vehicleName: metadata.vehicle_name || `${vehicle.name} ${vehicle.year}`,
    status: bookingStatusForPayment(paymentStatus),
    paymentStatus,
    paymentIntentId: metadata.payment_id || "",
    checkoutSessionId: session.id,
    paidAt: paymentStatus === "deposit_paid" ? nowFromStripe(session.created) : "",
    pickup: metadata.pickup || "",
    pickupTime: metadata.pickup_time || "",
    return: metadata.return_date || "",
    returnTime: metadata.return_time || "",
    location: metadata.location || "",
    lat: "",
    lng: "",
    handoverNotes: "Created through Stripe Checkout session data.",
    totals: {
      ...totals,
      deposit: amount || totals.deposit,
      hireEstimate: Number(metadata.hire_estimate || totals.hireEstimate || 0),
    },
    timeline: [
      {
        label: paymentStatus === "deposit_paid" ? "Stripe deposit paid" : "Stripe Checkout session created",
        at: createdAt,
      },
    ],
    createdAt,
    updatedAt: createdAt,
  };

  const payment = {
    id: metadata.payment_id || `stripe_${session.id}`,
    bookingId,
    bookingReference,
    vehicleName: booking.vehicleName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    amount,
    currency: String(session.currency || "gbp").toUpperCase(),
    status: paymentStatus,
    provider: "stripe_checkout",
    providerReference: session.payment_intent || session.id,
    checkoutSessionId: session.id,
    checkoutUrl: session.url || "",
    amountPaid: paymentStatus === "deposit_paid" ? amount : 0,
    paidAt: paymentStatus === "deposit_paid" ? nowFromStripe(session.created) : "",
    failureReason: paymentStatus === "failed" ? "Stripe reported this Checkout session as unpaid." : "",
    refundedAt: "",
    cancelledAt: paymentStatus === "cancelled" ? nowFromStripe(session.created) : "",
    note: "Loaded from Stripe Checkout as the durable payment source.",
    createdAt,
    updatedAt: createdAt,
  };

  return { booking, payment };
}

function uniqueById(items = []) {
  const map = new Map();
  for (const item of items) {
    if (!item?.id) continue;
    map.set(item.id, { ...map.get(item.id), ...item });
  }
  return [...map.values()].sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
}

export function customersFromBookings(bookings = []) {
  const byEmail = new Map();
  for (const booking of bookings) {
    const email = String(booking.customerEmail || "").toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) {
      byEmail.set(email, {
        id: `stripe_customer_${email}`,
        source: "stripe_checkout",
        fullName: booking.customerName || "Stripe Checkout client",
        email,
        phone: booking.customerPhone || "",
        preferredContact: "Concierge follow-up",
        verificationStatus: "payment_verified",
        favourites: [],
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        hireValue: 0,
        lastBookingReference: "",
        lastVehicle: "",
        lastStatus: "",
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      });
    }
    const customer = byEmail.get(email);
    customer.totalBookings += 1;
    customer.upcomingBookings += booking.status !== "completed" && booking.status !== "cancelled" ? 1 : 0;
    customer.completedBookings += booking.status === "completed" ? 1 : 0;
    customer.hireValue += Number(booking.totals?.hireEstimate || 0);
    customer.lastBookingReference = booking.reference;
    customer.lastVehicle = booking.vehicleName;
    customer.lastStatus = booking.status;
    customer.updatedAt = booking.updatedAt;
  }
  return [...byEmail.values()].sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
}

export function recordsFromStripeSession(session = {}, statusOverride = "") {
  const { booking, payment } = normaliseSession(session, statusOverride);
  return {
    booking,
    payment,
    bookings: booking ? [booking] : [],
    payments: payment ? [payment] : [],
    customers: booking ? customersFromBookings([booking]) : [],
  };
}

export async function listStripeOperations() {
  if (!stripeConfigured()) {
    return { bookings: [], payments: [], customers: [], available: false, reason: "stripe_not_configured" };
  }

  try {
    const response = await stripeRequest("/checkout/sessions?limit=100");
    const records = (response.data || []).filter(sessionIsVelaire).map((session) => normaliseSession(session));
    const bookings = uniqueById(records.map((record) => record.booking));
    const payments = uniqueById(records.map((record) => record.payment));
    return {
      bookings,
      payments,
      customers: customersFromBookings(bookings),
      available: true,
      reason: "",
    };
  } catch (error) {
    return {
      bookings: [],
      payments: [],
      customers: [],
      available: false,
      reason: error.publicMessage || error.message || "stripe_operations_unavailable",
    };
  }
}

export function mergeOperations(localItems = [], stripeItems = []) {
  return uniqueById([...localItems, ...stripeItems]);
}

export function mergeCustomers(localCustomers = [], stripeCustomers = []) {
  const map = new Map();
  for (const customer of [...stripeCustomers, ...localCustomers]) {
    const key = String(customer.email || customer.id || "").toLowerCase();
    if (!key) continue;
    const current = map.get(key) || {};
    map.set(key, {
      ...current,
      ...customer,
      totalBookings: Math.max(Number(current.totalBookings || 0), Number(customer.totalBookings || 0)),
      upcomingBookings: Math.max(Number(current.upcomingBookings || 0), Number(customer.upcomingBookings || 0)),
      completedBookings: Math.max(Number(current.completedBookings || 0), Number(customer.completedBookings || 0)),
      hireValue: Math.max(Number(current.hireValue || 0), Number(customer.hireValue || 0)),
    });
  }
  return [...map.values()].sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));
}
