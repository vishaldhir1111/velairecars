const vehicles = {
  "tesla-model-3-performance": {
    name: "Tesla Model 3 Performance 2020",
    shortName: "Tesla Model 3 Performance",
    category: "Electric performance",
    finish: "White exterior, white interior",
    paint: "Pearl white",
    interior: "White interior",
    rate: 195,
    deposit: 500,
    visualClass: "tesla-model-3-performance",
    modelType: "saloon",
    modelPath: "/models/tesla-model-3-performance-2020-white.glb",
    fallbackImagePath: "/cars/hero-tesla.png",
    modelAvailable: false,
    visualLabel: "Tesla Model 3 Performance 2020, white exterior and white interior",
    description:
      "A white-on-white electric performance saloon with instant torque, a minimalist cabin and understated executive presence.",
  },
  "lamborghini-urus": {
    name: "Lamborghini Urus 2021",
    shortName: "Lamborghini Urus",
    category: "Super SUV",
    finish: "Orange exterior",
    paint: "Orange exterior",
    interior: "Luxury sport cabin",
    rate: 895,
    deposit: 2500,
    visualClass: "lamborghini-urus",
    modelType: "suv",
    modelPath: "/models/lamborghini-urus-2021-orange.glb",
    fallbackImagePath: "/cars/lamborghini-urus-2021-orange.png",
    modelAvailable: false,
    visualLabel: "Lamborghini Urus 2021, orange exterior",
    description:
      "An orange Lamborghini Urus with super SUV theatre, flagship presence and the kind of arrival that turns a booking into a moment.",
  },
  "range-rover-sport-svr": {
    name: "Range Rover Sport SVR 2021",
    shortName: "Range Rover Sport SVR",
    category: "Luxury SUV",
    finish: "Performance SUV",
    paint: "SVR performance finish",
    interior: "Command seating",
    rate: 495,
    deposit: 1500,
    visualClass: "range-rover-sport-svr",
    modelType: "suv",
    modelPath: "/models/range-rover-sport-svr-2021.glb",
    fallbackImagePath: "/cars/range-rover-svr.png",
    modelAvailable: false,
    visualLabel: "Range Rover Sport SVR 2021, performance SUV",
    description:
      "A performance Range Rover with supercharged V8 character, elevated comfort and the confidence expected from a premium SUV handover.",
  },
  "bmw-m440i-convertible": {
    name: "BMW M440i Convertible 2022",
    shortName: "BMW M440i Convertible",
    category: "Convertible GT",
    finish: "Sky blue wrap",
    paint: "Sky blue wrap",
    interior: "Convertible cabin",
    rate: 295,
    deposit: 900,
    visualClass: "bmw-m440i-convertible",
    modelType: "convertible",
    modelPath: "/models/bmw-m440i-convertible-2022-sky-blue.glb",
    fallbackImagePath: "/cars/bmw-m440i-convertible-2022-sky-blue.png",
    modelAvailable: false,
    visualLabel: "BMW M440i Convertible 2022, sky blue wrap",
    description:
      "A sky-blue open-top grand tourer with M Performance pace, polished daily usability and a clean summer-event look.",
  },
  "bmw-m140i-shadow-edition": {
    name: "BMW M140i Shadow Edition 2019",
    shortName: "BMW M140i Shadow Edition",
    category: "Hot hatch",
    finish: "Shadow Edition",
    paint: "Shadow Edition finish",
    interior: "Compact performance cabin",
    rate: 175,
    deposit: 600,
    visualClass: "bmw-m140i-shadow-edition",
    modelType: "hatch",
    modelPath: "/models/bmw-m140i-shadow-edition-2019.glb",
    fallbackImagePath: "/cars/bmw-m140i-black-2019.jpg",
    modelAvailable: false,
    visualLabel: "BMW M140i Shadow Edition 2019",
    description:
      "A compact performance favourite with B58 power, understated Shadow Edition styling and a focused premium cabin.",
  },
};

const storageKey = "velaireReservation";
const accountStorageKey = "velaireAccount";
const backendBookingKey = "velaireBackendBooking";
const favouriteStorageKey = "velaireFavouriteCars";
const adminTokenStorageKey = "velaireAdminToken";
const defaultVehicle = "lamborghini-urus";
const MAPBOX_TOKEN = "pk.eyJ1IjoidmlzaGFsZGhpcjExMTEiLCJhIjoiY21vampwYm54MGQzejJwczFzMHcwN3h2dSJ9.M-zV1ypGN1rPPTgEk0iWgg";
const MAPBOX_GL_VERSION = "v3.10.0";
const MAPBOX_GL_JS = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.js`;
const MAPBOX_GL_CSS = `https://api.mapbox.com/mapbox-gl-js/${MAPBOX_GL_VERSION}/mapbox-gl.css`;
const MAPBOX_GEOCODING_ENDPOINT = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const UK_BOUNDS = {
  west: -8.65,
  south: 49.86,
  east: 1.77,
  north: 60.86,
};
const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };
let mapboxLoaderPromise;
let adminState = {
  bookings: [],
  payments: [],
  leads: [],
  customers: [],
  vehicles: [],
};

const fleetKnowledgeBase = [
  {
    slug: "tesla-model-3-performance",
    name: "Tesla Model 3 Performance 2020",
    category: "Electric performance saloon",
    bodyType: "Electric performance saloon",
    colour: "White exterior",
    interior: "White interior",
    finish: "White exterior, white interior",
    drivetrain: "Electric dual-motor all-wheel drive",
    dailyRate: 195,
    deposit: 500,
    personality: "Refined, clean, quiet and modern with instant electric pace.",
    description: "Refined, clean, quiet and modern with instant electric pace.",
    bestUseCases: ["business travel", "city driving", "quiet luxury", "airport runs", "electric performance"],
    bestFor: "business travel, city driving, quiet luxury, airport runs and electric performance",
    idealCustomer:
      "A client who wants premium movement without shouting, especially for executive journeys and clean city arrivals.",
    keySellingPoints: ["white-on-white specification", "instant torque", "minimal cabin", "low-key executive feel"],
    upsell: "If the client wants more theatre or status, guide them toward the Lamborghini Urus or Range Rover SVR.",
  },
  {
    slug: "lamborghini-urus",
    name: "Lamborghini Urus 2021",
    category: "Super SUV",
    bodyType: "Super SUV",
    colour: "Orange",
    interior: "Luxury sport cabin",
    finish: "Orange exterior",
    drivetrain: "Twin-turbo V8 all-wheel drive",
    dailyRate: 895,
    deposit: 2500,
    personality: "The loudest statement in the fleet: dramatic, exclusive, fast and unmistakably high-impact.",
    description: "The loudest statement in the fleet: dramatic, exclusive, fast and unmistakably high-impact.",
    bestUseCases: ["biggest impact", "luxury flex", "content", "events", "VIP arrivals", "launches"],
    bestFor: "biggest impact, luxury flex, content, events, VIP arrivals and launches",
    idealCustomer:
      "A client who wants maximum presence, attention and an arrival that feels like a moment.",
    keySellingPoints: ["orange exterior", "supercar drama", "SUV usability", "flagship road presence"],
    upsell: "Position it as the definitive upgrade when the customer wants more presence than a normal luxury SUV.",
  },
  {
    slug: "range-rover-sport-svr",
    name: "Land Rover Range Rover Sport SVR 2021",
    category: "Performance luxury SUV",
    bodyType: "Performance luxury SUV",
    colour: "SVR performance finish",
    interior: "Command seating",
    finish: "SVR performance finish",
    drivetrain: "Supercharged V8 four-wheel drive",
    dailyRate: 495,
    deposit: 1500,
    personality: "Powerful, composed and premium with the confidence of a serious performance SUV.",
    description: "Powerful, composed and premium with the confidence of a serious performance SUV.",
    bestUseCases: ["performance SUV", "family use", "airport runs", "luggage", "weekends", "all-weather luxury"],
    bestFor: "performance SUV needs, family use, airport runs, luggage, weekends and all-weather luxury",
    idealCustomer:
      "A client who wants comfort, luggage space and authority without going as extroverted as the Urus.",
    keySellingPoints: ["supercharged V8", "Range Rover comfort", "command seating", "practical premium presence"],
    upsell: "Upsell from standard SUV needs into SVR performance and luxury SUV confidence.",
  },
  {
    slug: "bmw-m440i-convertible",
    name: "BMW M440i Convertible 2022",
    category: "Open-top grand tourer",
    bodyType: "Open-top grand tourer",
    colour: "Sky blue wrap",
    interior: "Convertible cabin",
    finish: "Sky blue wrap",
    drivetrain: "M Performance petrol drivetrain",
    dailyRate: 295,
    deposit: 900,
    personality: "Elegant, expressive and relaxed with open-top theatre and polished daily usability.",
    description: "Elegant, expressive and relaxed with open-top theatre and polished daily usability.",
    bestUseCases: ["weddings", "summer weekends", "open-top grand touring", "coastal drives", "date nights"],
    bestFor: "weddings, summer weekends, open-top grand touring, coastal drives and date nights",
    idealCustomer:
      "A client who wants style, fresh-air driving and a softer form of attention than a super SUV.",
    keySellingPoints: ["sky blue wrap", "convertible roof", "M Performance pace", "event-friendly look"],
    upsell: "Upsell from compact fun into a more polished convertible experience for occasions and weekends.",
  },
  {
    slug: "bmw-m140i-shadow-edition",
    name: "BMW M140i Shadow Edition 2019",
    category: "Compact performance hatch",
    bodyType: "Compact performance hatch",
    colour: "Shadow Edition finish",
    interior: "Compact performance cabin",
    finish: "Shadow Edition finish",
    drivetrain: "B58 turbocharged petrol rear-wheel drive character",
    dailyRate: 175,
    deposit: 600,
    personality: "Small, sharp, quick and driver-focused while staying understated.",
    description: "Small, sharp, quick and driver-focused while staying understated.",
    bestUseCases: ["compact fun", "sporty but subtle", "driver car", "city weekends", "value performance"],
    bestFor: "compact fun, sporty but subtle drives, city weekends and value performance",
    idealCustomer:
      "A client who cares about the drive and wants something quick, discreet and easy to use.",
    keySellingPoints: ["B58 engine", "Shadow Edition styling", "compact size", "accessible performance"],
    upsell: "If the client wants more polish or occasion value, move them toward the M440i Convertible or Tesla.",
  },
];

const fileLabelDefaults = {
  displayPhoto: "Upload a polished client image",
  drivingLicence: "Upload front and back or PDF",
  proofOfAddress: "Utility bill or bank statement",
  selfieId: "Upload a clear verification image",
};

function money(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function humanStatus(value = "") {
  return String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(value = "") {
  const clean = String(value || "pending").toLowerCase().replaceAll("_", "-");
  return `status-${clean || "pending"}`;
}

function adminActionLabel(action = "") {
  const labels = {
    pending: "pending",
    payment_pending: "payment pending",
    confirm: "confirmed",
    cancel: "cancelled",
    complete: "completed",
  };
  return labels[action] || humanStatus(action).toLowerCase();
}

function loadReservation() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveReservation(next) {
  const reservation = { ...loadReservation(), ...next };
  window.localStorage.setItem(storageKey, JSON.stringify(reservation));
  return reservation;
}

function loadAccount() {
  const reservation = loadReservation();
  try {
    return {
      fullName: reservation.fullName || reservation.name || "",
      email: reservation.email || "",
      phone: reservation.phone || "",
      preferredContact: "Email",
      licenceCountry: "United Kingdom",
      billingAddress: "",
      billingPostcode: "",
      preferredLocation: "",
      savedLocations: [],
      handoverType: "Concierge delivery",
      vehicleCategories: ["Super SUV", "Luxury SUV"],
      communication: ["Concierge updates"],
      files: {},
      cardSummary: "No saved card",
      cardName: "Cards are entered only inside secure Stripe Checkout.",
      membership: "Private client status",
      ...JSON.parse(window.localStorage.getItem(accountStorageKey)),
    };
  } catch {
    return {
      fullName: reservation.fullName || reservation.name || "",
      email: reservation.email || "",
      phone: reservation.phone || "",
      preferredContact: "Email",
      licenceCountry: "United Kingdom",
      billingAddress: "",
      billingPostcode: "",
      preferredLocation: "",
      savedLocations: [],
      handoverType: "Concierge delivery",
      vehicleCategories: ["Super SUV", "Luxury SUV"],
      communication: ["Concierge updates"],
      files: {},
      cardSummary: "No saved card",
      cardName: "Cards are entered only inside secure Stripe Checkout.",
      membership: "Private client status",
    };
  }
}

function saveAccount(next) {
  const account = {
    ...loadAccount(),
    ...next,
    files: {
      ...(loadAccount().files || {}),
      ...(next.files || {}),
    },
  };
  window.localStorage.setItem(accountStorageKey, JSON.stringify(account));
  return account;
}

function loadFavouriteCars() {
  try {
    return JSON.parse(window.localStorage.getItem(favouriteStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveBackendBooking(booking) {
  if (!booking?.id) return booking;
  window.localStorage.setItem(backendBookingKey, JSON.stringify(booking));
  return booking;
}

function loadBackendBooking() {
  try {
    return JSON.parse(window.localStorage.getItem(backendBookingKey)) || null;
  } catch {
    return null;
  }
}

function mergeUniqueById(items = []) {
  const map = new Map();
  items.filter(Boolean).forEach((item) => {
    const key = item.id || item.bookingId || item.checkoutSessionId || JSON.stringify(item);
    map.set(key, { ...(map.get(key) || {}), ...item });
  });
  return [...map.values()];
}

function isDepositPaidState({ reservation = loadReservation(), booking = loadBackendBooking(), payments = [] } = {}) {
  return (
    reservation.paymentStatus === "deposit_paid" ||
    (reservation.status === "confirmed" && Boolean(reservation.paidAt)) ||
    booking?.paymentStatus === "deposit_paid" ||
    (booking?.status === "confirmed" && Boolean(booking?.paidAt)) ||
    payments.some((payment) => payment?.status === "deposit_paid" || payment?.paymentStatus === "deposit_paid")
  );
}

function savePaidState({ booking = null, payment = null } = {}) {
  const reservation = loadReservation();
  const paid = reservation.paymentStatus === "deposit_paid" || booking?.paymentStatus === "deposit_paid" || payment?.status === "deposit_paid";
  if (booking?.id) saveBackendBooking(booking);
  saveReservation({
    bookingId: booking?.id || reservation.bookingId || "",
    reference: booking?.reference || reservation.reference || "",
    status: paid ? booking?.status || reservation.status || "confirmed" : booking?.status || reservation.status || "payment_pending",
    paymentStatus: paid ? "deposit_paid" : booking?.paymentStatus || payment?.status || "deposit_paid",
    paymentIntentId: payment?.id || reservation.paymentIntentId || "",
    checkoutSessionId: booking?.checkoutSessionId || payment?.checkoutSessionId || reservation.checkoutSessionId || "",
    paidAt: paid ? booking?.paidAt || payment?.paidAt || reservation.paidAt || new Date().toISOString() : reservation.paidAt || "",
  });
}

function paymentStateFromResult(result = {}) {
  const bookings = [result.booking, ...(result.bookings || [])].filter(Boolean);
  const payments = [result.payment, ...(result.payments || [])].filter(Boolean);
  const booking = bookings.find((item) => item.paymentStatus === "deposit_paid") || bookings[0] || null;
  const payment = payments.find((item) => item.status === "deposit_paid") || payments[0] || null;
  return {
    paid: isDepositPaidState({ booking, payments }),
    booking,
    payment,
    bookings,
    payments,
  };
}

async function fetchAccountPaymentState(email = "") {
  const cleanEmail = String(email || "").trim();
  if (!cleanEmail) return { paid: isDepositPaidState(), booking: loadBackendBooking(), payment: null, bookings: [], payments: [] };
  const result = await optionalApiRequest(`/api/account?email=${encodeURIComponent(cleanEmail)}`, { method: "GET" }, null);
  if (!result) return { paid: isDepositPaidState(), booking: loadBackendBooking(), payment: null, bookings: [], payments: [] };
  const state = paymentStateFromResult(result);
  if (state.paid) savePaidState({ booking: state.booking, payment: state.payment });
  return state;
}

function loadAdminToken() {
  try {
    return window.localStorage.getItem(adminTokenStorageKey) || "";
  } catch {
    return "";
  }
}

function saveAdminToken(token) {
  const cleanToken = String(token || "").trim();
  if (!cleanToken) {
    window.localStorage.removeItem(adminTokenStorageKey);
    return "";
  }
  window.localStorage.setItem(adminTokenStorageKey, cleanToken);
  return cleanToken;
}

async function logoutBackendSession() {
  await optionalApiRequest("/api/auth/logout", { method: "POST" }, null);
}

function renderFlowAuthNavigation(session = { authenticated: false, user: null }) {
  const navLinks = document.querySelector(".flow-nav-links");
  if (!navLinks) return;
  const authenticated = Boolean(session.authenticated);
  let accountLink = navLinks.querySelector('a[href="account.html"], a[href="login.html"]');
  if (!accountLink) {
    accountLink = document.createElement("a");
    navLinks.appendChild(accountLink);
  }
  accountLink.href = authenticated ? "account.html" : "login.html";
  accountLink.textContent = authenticated ? "Account" : "Login";

  let logoutButton = navLinks.querySelector("[data-flow-auth-logout]");
  if (authenticated) {
    if (!logoutButton) {
      logoutButton = document.createElement("button");
      logoutButton.type = "button";
      logoutButton.className = "flow-nav-button";
      logoutButton.dataset.flowAuthLogout = "true";
      logoutButton.textContent = "Log out";
      logoutButton.addEventListener("click", async () => {
        await logoutBackendSession();
        showFlowToast("Signed out of your Velaire account.");
        renderFlowAuthNavigation({ authenticated: false, user: null });
      });
      navLinks.appendChild(logoutButton);
    }
    return;
  }
  logoutButton?.remove();
}

async function setupFlowAuthNavigation() {
  const session = await fetchAuthSession();
  renderFlowAuthNavigation(session || { authenticated: false, user: null });
}

function showFlowToast(message, tone = "default") {
  let toast = document.querySelector(".flow-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "flow-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("is-warning", tone === "warning");
  toast.classList.add("is-visible");
  window.clearTimeout(showFlowToast.timer);
  showFlowToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const adminToken = path.startsWith("/api/admin") ? loadAdminToken() : "";
  if (adminToken) headers["x-velaire-admin-token"] = adminToken;

  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Velaire backend request failed.");
    error.status = response.status;
    error.payload = data;
    throw error;
  }
  return data;
}

async function optionalApiRequest(path, options = {}, fallback = null) {
  try {
    return await apiRequest(path, options);
  } catch (error) {
    if (error.status === 409) {
      showFlowToast(error.message || "Those dates are no longer available.", "warning");
      throw error;
    }
    if (error.status !== 401) {
      showFlowToast("Saved locally. Backend sync will resume once the API is available.", "warning");
    }
    return fallback;
  }
}

function backendAccountPatchFromLocal(account = loadAccount()) {
  return {
    phone: account.phone || "",
    profile: {
      fullName: account.fullName || "",
      billingAddress: account.billingAddress || "",
      billingPostcode: account.billingPostcode || "",
      licenceCountry: account.licenceCountry || "United Kingdom",
      preferredContact: account.preferredContact || "Email",
    },
    preferences: {
      vehicleCategories: account.vehicleCategories || [],
      handoverType: account.handoverType || "Concierge delivery",
      communication: account.communication || [],
      preferredLocation: account.preferredLocation || "",
      savedLocations: account.savedLocations || [],
    },
    verification: {
      status: verificationStatus(account).toLowerCase().replace(/\s+/g, "_"),
      documents: account.files || {},
    },
    paymentMethod: null,
    favourites: account.favourites || ["lamborghini-urus", "range-rover-sport-svr", "bmw-m440i-convertible"],
  };
}

async function syncAccountToBackend(account = loadAccount()) {
  return optionalApiRequest(
    "/api/account",
    {
      method: "PATCH",
      body: JSON.stringify(backendAccountPatchFromLocal(account)),
    },
    null,
  );
}

async function fetchAuthSession() {
  return optionalApiRequest("/api/auth/session", { method: "GET" }, { authenticated: false, user: null });
}

function mergeAuthenticatedUser(user = null) {
  if (!user) return loadAccount();
  const account = saveAccount({
    fullName: user.profile?.fullName || loadAccount().fullName || "",
    email: user.email || loadAccount().email || "",
    phone: user.phone || loadAccount().phone || "",
    preferredContact: user.profile?.preferredContact || loadAccount().preferredContact || "Email",
    licenceCountry: user.profile?.licenceCountry || loadAccount().licenceCountry || "United Kingdom",
    billingAddress: user.profile?.billingAddress || loadAccount().billingAddress || "",
    billingPostcode: user.profile?.billingPostcode || loadAccount().billingPostcode || "",
  });
  saveReservation({
    email: account.email,
    phone: account.phone,
    name: account.fullName,
    fullName: account.fullName,
  });
  return account;
}

async function fetchAccountContext(email = "") {
  const cleanEmail = String(email || "").trim();
  if (!cleanEmail) return null;
  return optionalApiRequest(`/api/account?email=${encodeURIComponent(cleanEmail)}`, { method: "GET" }, null);
}

function matchingActiveVehicleBooking(bookings = [], reservation = loadReservation()) {
  const vehicle = reservation.vehicle || selectedSlug();
  const released = new Set(["cancelled", "completed", "rejected"]);
  return bookings.find(
    (booking) =>
      booking?.vehicleSlug === vehicle &&
      !released.has(String(booking.status || "").toLowerCase()),
  );
}

function renderLoginState({ tone = "default", title = "", message = "", actions = "" } = {}) {
  const target = document.querySelector("[data-login-state]");
  if (!target) return;
  target.hidden = false;
  target.classList.toggle("is-warning", tone === "warning");
  target.classList.toggle("is-success", tone === "success");
  target.innerHTML = `
    ${title ? `<strong>${escapeHtml(title)}</strong>` : ""}
    ${message ? `<span>${escapeHtml(message)}</span>` : ""}
    ${actions ? `<div class="flow-state-actions">${actions}</div>` : ""}
  `;
}

function clearLoginState() {
  const target = document.querySelector("[data-login-state]");
  if (!target) return;
  target.hidden = true;
  target.innerHTML = "";
  target.classList.remove("is-warning", "is-success");
}

async function ensureBackendAccount({ email, password, phone, fullName, accountExists = false, authAccountExists = false }) {
  const cleanEmail = String(email || "").trim();
  if (!cleanEmail) return null;

  try {
    return await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    });
  } catch {
    if (accountExists && authAccountExists) {
      const error = new Error("A Velaire account already exists for this email. Enter the account password to continue.");
      error.status = 401;
      throw error;
    }
    return optionalApiRequest(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password,
          phone,
          profile: {
            fullName,
            preferredContact: "Email",
            licenceCountry: "United Kingdom",
          },
        }),
      },
      null,
    );
  }
}

async function syncBookingToBackend(status = "draft") {
  const reservation = loadReservation();
  const currentBooking = loadBackendBooking();
  const result = currentBooking?.id
    ? await optionalApiRequest(
        "/api/bookings",
        {
          method: "PATCH",
          body: JSON.stringify({
            id: currentBooking.id,
            patch: {
              reservation,
              status,
            },
          }),
        },
        null,
      )
    : await optionalApiRequest(
        "/api/bookings",
        {
          method: "POST",
          body: JSON.stringify({ reservation, status }),
        },
        null,
      );
  if (result?.booking) {
    saveBackendBooking(result.booking);
    saveReservation({ bookingId: result.booking.id, reference: result.booking.reference });
  }
  if (result?.protected === "deposit_already_paid" || result?.payment?.status === "deposit_paid" || result?.booking?.paymentStatus === "deposit_paid") {
    savePaidState({ booking: result.booking, payment: result.payment });
  }
  if (result?.protected === "reservation_already_exists" && result?.booking) {
    saveReservation({
      bookingId: result.booking.id,
      reference: result.booking.reference,
      status: result.booking.status,
      paymentStatus: result.booking.paymentStatus,
    });
  }
  return result?.booking || null;
}

async function createPaymentIntent() {
  const reservation = loadReservation();
  const booking = loadBackendBooking() || (await syncBookingToBackend("pending"));
  const result = await optionalApiRequest(
    "/api/payments/intent",
    {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking?.id || reservation.bookingId || "",
        reservation,
      }),
    },
    null,
  );
  if (result?.paymentIntent) {
    saveReservation({
      paymentIntentId: result.paymentIntent.id,
      paymentStatus: result.paymentIntent.status,
    });
  }
  return result?.paymentIntent || null;
}

async function createPaymentCheckout() {
  const reservation = loadReservation();
  const booking = loadBackendBooking() || (await syncBookingToBackend("payment_pending"));
  let result;
  try {
    result = await apiRequest("/api/payments/checkout", {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking?.id || reservation.bookingId || "",
        reservation,
      }),
    });
  } catch (error) {
    if (error.status === 409 && error.payload?.error === "deposit_already_paid") {
      savePaidState({ booking: error.payload.booking, payment: error.payload.payment });
      error.alreadyPaid = true;
    }
    throw error;
  }

  if (result?.paymentIntent) {
    saveReservation({
      paymentIntentId: result.paymentIntent.id,
      paymentStatus: result.paymentIntent.status,
      checkoutSessionId: result.checkoutSessionId || result.paymentIntent.checkoutSessionId || "",
    });
  }

  return result;
}

async function verifyCheckoutSession(sessionId) {
  if (!sessionId) return null;
  const result = await optionalApiRequest(
    `/api/payments/session?session_id=${encodeURIComponent(sessionId)}`,
    { method: "GET" },
    null,
  );

  if (result?.booking) {
    saveBackendBooking(result.booking);
    saveReservation({
      bookingId: result.booking.id,
      reference: result.booking.reference,
      status: result.booking.status,
      paymentStatus: result.booking.paymentStatus,
      checkoutSessionId: result.booking.checkoutSessionId || sessionId,
      paidAt: result.booking.paidAt || "",
    });
  } else if (result?.payment) {
    saveReservation({
      paymentIntentId: result.payment.id,
      paymentStatus: result.payment.status,
      checkoutSessionId: result.payment.checkoutSessionId || sessionId,
      paidAt: result.payment.paidAt || "",
    });
  }

  return result;
}

async function checkAvailability() {
  const reservation = loadReservation();
  const target = document.querySelector("[data-availability-text]");
  if (!target) return null;

  const result = await optionalApiRequest(
    "/api/availability",
    {
      method: "POST",
      body: JSON.stringify(reservation),
    },
    null,
  );

  if (result?.message) {
    target.innerHTML = `<span aria-hidden="true"></span>${result.message}`;
    target.classList.toggle("is-unavailable", result.available === false);
    target.classList.toggle("is-available", result.available === true);
  }

  return result;
}

function navigateTo(action) {
  window.location.href = action || "/";
}

function selectedSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("vehicle") || loadReservation().vehicle || defaultVehicle;
}

function selectedVehicle(slug = selectedSlug()) {
  return vehicles[slug] || vehicles[defaultVehicle];
}

function bindText(name, value) {
  document.querySelectorAll(`[data-bind="${name}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function vehicleModelMarkup() {
  return `
    <span class="vehicle-model-scene" aria-hidden="true">
      <span class="vehicle-model-turntable">
        <span class="model-ground"></span>
        <span class="model-reflection"></span>
        <span class="model-car">
          <span class="model-body"></span>
          <span class="model-body-top"></span>
          <span class="model-cabin"></span>
          <span class="model-glass model-glass-front"></span>
          <span class="model-glass model-glass-rear"></span>
          <span class="model-grille"></span>
          <span class="model-light model-light-front"></span>
          <span class="model-light model-light-rear"></span>
          <span class="model-wheel model-wheel-rear"><span></span></span>
          <span class="model-wheel model-wheel-front"><span></span></span>
          <span class="model-door-line"></span>
          <span class="model-highlight"></span>
        </span>
      </span>
    </span>
  `;
}

function hydrateVehicleModels(root = document) {
  root.querySelectorAll("[data-vehicle-model]").forEach((node) => {
    if (!node.querySelector(".vehicle-model-scene")) {
      node.insertAdjacentHTML("afterbegin", vehicleModelMarkup());
    }
  });
}

function bindVehicleMedia(vehicle) {
  document.querySelectorAll("[data-bind-vehicle-media]").forEach((node) => {
    Object.keys(vehicles).forEach((slug) => {
      node.classList.remove(`flow-vehicle-photo-${slug}`, `vehicle-model-${slug}`);
    });
    ["saloon", "suv", "convertible", "hatch"].forEach((type) => {
      node.classList.remove(`vehicle-model-${type}`);
    });
    node.classList.add(
      `flow-vehicle-photo-${vehicle.visualClass}`,
      `vehicle-model-${vehicle.visualClass}`,
      `vehicle-model-${vehicle.modelType || "saloon"}`,
    );
    node.setAttribute("aria-label", `3D studio mockup of ${vehicle.visualLabel}`);
    node.dataset.modelPath = vehicle.modelPath || "";
    node.dataset.fallbackImage = vehicle.fallbackImagePath || "";
    node.dataset.modelStatus = vehicle.modelAvailable ? "glb-active" : "studio-fallback";
  });

  hydrateVehicleModels();
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateDays(pickup, returnDate) {
  const start = parseDate(pickup);
  const end = parseDate(returnDate);
  if (!start || !end) return null;
  const day = 24 * 60 * 60 * 1000;
  return Math.max(Math.ceil((end - start) / day), 1);
}

function displayDays(days) {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function referenceFor(slug) {
  const referenceCodes = {
    "tesla-model-3-performance": "TM3P",
    "lamborghini-urus": "URUS",
    "range-rover-sport-svr": "SVR",
    "bmw-m440i-convertible": "M440",
    "bmw-m140i-shadow-edition": "M140",
  };
  const code = referenceCodes[slug] || slug.split("-")[0].toUpperCase();
  return `VEL-${code}-1087`;
}

function updateSummary() {
  const reservation = loadReservation();
  const backendBooking = loadBackendBooking();
  const rawSlug = reservation.vehicle || selectedSlug();
  const slug = vehicles[rawSlug] ? rawSlug : defaultVehicle;
  const vehicle = selectedVehicle(slug);
  const days = Math.max(Number.parseInt(reservation.days || "2", 10), 1);
  const location = reservation.formattedAddress || reservation.location || "Delivery location pending";
  const depositPaid = isDepositPaidState({ reservation, booking: backendBooking, payments: [] });
  const resolvedPaymentStatus = depositPaid
    ? "deposit_paid"
    : reservation.paymentStatus || backendBooking?.paymentStatus || "payment_pending";
  const resolvedReservationStatus = depositPaid
    ? backendBooking?.status || reservation.status || "confirmed"
    : reservation.status || backendBooking?.status || "payment_pending";

  bindText("vehicleName", vehicle.name);
  bindText("vehicleShortName", vehicle.shortName);
  bindText("vehicleCategory", vehicle.category);
  bindText("vehicleFinish", vehicle.finish);
  bindText("vehiclePaint", vehicle.paint);
  bindText("vehicleInterior", vehicle.interior);
  bindText("vehicleDescription", vehicle.description);
  bindText("dailyRate", money(vehicle.rate));
  bindText("deposit", `From ${money(vehicle.deposit)}`);
  bindText("depositValue", money(vehicle.deposit));
  bindText("hireEstimate", money(vehicle.rate * days));
  bindText("rentalDays", displayDays(days));
  bindText("handoverLocation", location);
  bindText("reference", reservation.reference || backendBooking?.reference || referenceFor(slug));
  bindText("reservationStatus", humanStatus(resolvedReservationStatus));
  bindText("paymentStatus", humanStatus(resolvedPaymentStatus));
  bindVehicleMedia(vehicle);
  updateSelectedLocationPanel(reservation);
}

function updateSelectedLocationPanel(reservation = loadReservation()) {
  const panel = document.getElementById("selected-location-panel");
  if (!panel) return;

  const title = document.getElementById("selected-location-title");
  const detail = document.getElementById("selected-location-detail");
  const coordinates = document.getElementById("selected-location-coordinates");
  const address = reservation.formattedAddress || reservation.location || "";
  const hasCoordinates = Boolean(reservation.lat && reservation.lng);

  panel.classList.toggle("has-location", Boolean(address && hasCoordinates));

  if (title) {
    title.textContent = address || "Awaiting a precise location";
  }

  if (detail) {
    detail.textContent = hasCoordinates
      ? "Exact handover point saved for concierge review."
      : "Choose a suggestion or place the pin so your concierge receives the exact arrival point.";
  }

  if (coordinates) {
    coordinates.textContent = hasCoordinates
      ? `Pinned at ${Number.parseFloat(reservation.lat).toFixed(5)}, ${Number.parseFloat(reservation.lng).toFixed(5)}`
      : "Latitude and longitude will be secured after pin placement.";
  }
}

function setFieldValue(form, name, value) {
  const field = form?.elements?.[name];
  if (field && value) field.value = value;
}

function formatDisplayDate(value) {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function rangeCoversIso(range = {}, isoDate = "") {
  const day = parseDate(isoDate);
  const start = parseDate(range.start || range.pickup);
  const end = parseDate(range.end || range.return);
  if (!day || !start || !end) return false;
  return day >= start && day < end;
}

function setupElegantDatePicker(form) {
  const popover = document.getElementById("date-popover");
  const triggers = [...document.querySelectorAll("[data-date-trigger]")];
  if (!form || !popover || triggers.length === 0) return;

  let activeName = "";
  let visibleMonth = new Date();
  visibleMonth.setDate(1);

  function valueFor(name) {
    return form.elements[name]?.value || "";
  }

  function updateLabels() {
    triggers.forEach((trigger) => {
      const name = trigger.dataset.dateTrigger;
      const label = document.querySelector(`[data-date-label="${name}"]`);
      const value = valueFor(name);
      label.textContent = value ? formatDisplayDate(value) : name === "pickup" ? "Select pickup date" : "Select return date";
      trigger.classList.toggle("has-value", Boolean(value));
    });
  }

  function minimumDateFor(name) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (name !== "return") return today;
    const pickup = parseDate(valueFor("pickup"));
    return pickup && pickup > today ? pickup : today;
  }

  function chooseDate(value) {
    const field = form.elements[activeName];
    if (!field) return;
    field.value = value;

    if (activeName === "pickup") {
      const pickup = parseDate(value);
      const currentReturn = parseDate(valueFor("return"));
      if (pickup && (!currentReturn || currentReturn < pickup)) {
        form.elements.return.value = value;
      }
    }

    updateLabels();
    form.dispatchEvent(new Event("input", { bubbles: true }));

    if (activeName === "pickup") {
      openCalendar("return");
      return;
    }

    closeCalendar();
  }

  function renderCalendar() {
    const selected = valueFor(activeName);
    const minDate = minimumDateFor(activeName);
    const monthLabel = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(visibleMonth);
    const firstDay = new Date(visibleMonth);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - startOffset);
    const todayIso = formatIsoDate(new Date());

    const days = Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      const iso = formatIsoDate(day);
      const isMuted = day.getMonth() !== visibleMonth.getMonth();
      const isDisabled = day < minDate;
      const isSelected = iso === selected;
      const isToday = iso === todayIso;
      return `
        <button
          class="calendar-day${isMuted ? " is-muted" : ""}${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}"
          type="button"
          data-date="${iso}"
          ${isDisabled ? "disabled" : ""}
        >
          ${day.getDate()}
        </button>
      `;
    }).join("");

    popover.innerHTML = `
      <div class="calendar-topline">
        <span>${activeName === "pickup" ? "Pickup date" : "Return date"}</span>
        <button type="button" class="calendar-close" aria-label="Close calendar">Close</button>
      </div>
      <div class="calendar-header">
        <button type="button" class="calendar-nav" data-calendar-nav="-1" aria-label="Previous month">‹</button>
        <strong>${monthLabel}</strong>
        <button type="button" class="calendar-nav" data-calendar-nav="1" aria-label="Next month">›</button>
      </div>
      <div class="calendar-weekdays" aria-hidden="true">
        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
      </div>
      <div class="calendar-grid">${days}</div>
    `;

    popover.querySelectorAll("[data-calendar-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        visibleMonth = addMonths(visibleMonth, Number.parseInt(button.dataset.calendarNav, 10));
        renderCalendar();
      });
    });

    popover.querySelectorAll("[data-date]").forEach((button) => {
      button.addEventListener("click", () => chooseDate(button.dataset.date));
    });

    popover.querySelector(".calendar-close")?.addEventListener("click", closeCalendar);
  }

  function openCalendar(name) {
    activeName = name;
    const value = valueFor(name);
    const anchorDate = parseDate(value) || minimumDateFor(name);
    visibleMonth = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const trigger = document.querySelector(`[data-date-trigger="${name}"]`);
    trigger?.closest(".date-field")?.appendChild(popover);
    renderCalendar();
    popover.hidden = false;
    triggers.forEach((item) => item.setAttribute("aria-expanded", String(item === trigger)));
  }

  function closeCalendar() {
    popover.hidden = true;
    triggers.forEach((item) => item.setAttribute("aria-expanded", "false"));
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const name = trigger.dataset.dateTrigger;
      if (!popover.hidden && activeName === name) {
        closeCalendar();
        return;
      }
      openCalendar(name);
    });
  });

  document.addEventListener("click", (event) => {
    if (popover.hidden) return;
    if (popover.contains(event.target) || event.target.closest("[data-date-trigger]")) return;
    closeCalendar();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCalendar();
  });

  updateLabels();
}

function normaliseCoordinate(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? String(number) : "";
}

function readBookingForm(form) {
  const data = new FormData(form);
  const pickup = data.get("pickup") || "";
  const returnDate = data.get("return") || "";
  const days = calculateDays(pickup, returnDate) || Number.parseInt(loadReservation().days || "2", 10) || 2;
  const formattedAddress = data.get("formatted-address") || "";
  const typedLocation = data.get("location") || "";

  return {
    vehicle: data.get("vehicle") || defaultVehicle,
    pickup,
    pickupTime: data.get("pickup-time") || "",
    return: returnDate,
    returnTime: data.get("return-time") || "",
    location: formattedAddress || typedLocation,
    formattedAddress,
    placeId: data.get("place-id") || "",
    lat: normaliseCoordinate(data.get("lat")),
    lng: normaliseCoordinate(data.get("lng")),
    handoverNotes: data.get("handover-notes") || "",
    days: String(Math.max(days, 1)),
  };
}

function setDeliveryStatus(message) {
  const status = document.getElementById("delivery-map-status");
  if (status) status.textContent = message;
}

function setDeliveryFields(form, details, shouldSave = true) {
  const address = details.address || "";
  const lat = normaliseCoordinate(details.lat);
  const lng = normaliseCoordinate(details.lng);

  setFieldValue(form, "location", address);
  setFieldValue(form, "formatted-address", address);
  setFieldValue(form, "place-id", details.placeId || "");
  setFieldValue(form, "lat", lat);
  setFieldValue(form, "lng", lng);

  if (shouldSave) {
    saveReservation({
      location: address || loadReservation().location || "",
      formattedAddress: address,
      placeId: details.placeId || "",
      lat,
      lng,
    });
    updateSummary();
  }
}

function coordinateFrom(value) {
  if (Array.isArray(value)) {
    return { lng: Number.parseFloat(value[0]), lat: Number.parseFloat(value[1]) };
  }

  return {
    lat: Number.parseFloat(typeof value.lat === "function" ? value.lat() : value.lat),
    lng: Number.parseFloat(typeof value.lng === "function" ? value.lng() : value.lng),
  };
}

function isConfiguredMapboxToken() {
  return MAPBOX_TOKEN && MAPBOX_TOKEN !== "PASTE_MAPBOX_TOKEN_HERE";
}

function ensureMapboxCss() {
  if (document.querySelector("link[data-velaire-mapbox-css]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = MAPBOX_GL_CSS;
  link.dataset.velaireMapboxCss = "true";
  document.head.appendChild(link);
}

function loadMapboxGl() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (mapboxLoaderPromise) return mapboxLoaderPromise;

  ensureMapboxCss();
  mapboxLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-velaire-mapbox-js]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.mapboxgl), { once: true });
      existing.addEventListener("error", () => reject(new Error("Mapbox GL could not load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = MAPBOX_GL_JS;
    script.async = true;
    script.defer = true;
    script.dataset.velaireMapboxJs = "true";
    script.onload = () => resolve(window.mapboxgl);
    script.onerror = () => reject(new Error("Mapbox GL could not load."));
    document.head.appendChild(script);
  });

  return mapboxLoaderPromise;
}

function mapboxGeocodingUrl(query, params = {}) {
  const url = new URL(`${MAPBOX_GEOCODING_ENDPOINT}/${encodeURIComponent(query)}.json`);
  const search = {
    access_token: MAPBOX_TOKEN,
    country: "gb",
    language: "en",
    limit: "6",
    ...params,
  };

  Object.entries(search).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

function featureAddress(feature) {
  return feature?.place_name || feature?.text || "";
}

function featureTitle(feature) {
  return feature?.text || featureAddress(feature).split(",")[0] || "Selected location";
}

function featureDetail(feature) {
  const address = featureAddress(feature);
  const title = featureTitle(feature);
  return address.replace(title, "").replace(/^,\s*/, "") || "United Kingdom";
}

function createMapMarkerElement() {
  const marker = document.createElement("div");
  marker.className = "velaire-map-marker";
  marker.innerHTML = "<span></span>";
  return marker;
}

function setupMapboxDeliveryPicker(form) {
  const mapElement = document.getElementById("delivery-map");
  const input = document.getElementById("delivery-location");
  const suggestions = document.getElementById("delivery-suggestions");
  const confirmButton = document.getElementById("confirm-pin");
  const shortcutButtons = [...document.querySelectorAll("[data-location-shortcut]")];
  if (!form || !mapElement || !input) return;

  if (!isConfiguredMapboxToken()) {
    mapElement.classList.add("is-map-locked");
    confirmButton?.setAttribute("disabled", "true");
    input.setAttribute("aria-expanded", "false");
    if (suggestions) suggestions.hidden = true;
    setDeliveryStatus("Paste your Mapbox token in flow.js to activate live UK search, map and draggable pin selection.");
    return;
  }

  let map;
  let marker;
  let mapboxglRef;
  let searchTimer;
  let searchController;
  let activeSuggestion = -1;
  let currentSuggestions = [];
  const reservation = loadReservation();
  const savedPosition =
    reservation.lat && reservation.lng
      ? { lng: Number.parseFloat(reservation.lng), lat: Number.parseFloat(reservation.lat) }
      : null;
  let selectedPoint = savedPosition;

  function hideSuggestions() {
    activeSuggestion = -1;
    currentSuggestions = [];
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    if (suggestions) {
      suggestions.hidden = true;
      suggestions.innerHTML = "";
    }
  }

  function ensureMarker(point) {
    if (!map || !mapboxglRef) return;
    if (!marker) {
      marker = new mapboxglRef.Marker({
        element: createMapMarkerElement(),
        draggable: true,
        anchor: "bottom",
      })
        .setLngLat([point.lng, point.lat])
        .addTo(map);

      marker.on("dragend", () => {
        const markerPoint = coordinateFrom(marker.getLngLat());
        commitPosition(markerPoint, "", "", true);
      });
      return;
    }

    marker.setLngLat([point.lng, point.lat]);
  }

  function moveMap(point) {
    if (!map) return;
    ensureMarker(point);
    map.flyTo({
      center: [point.lng, point.lat],
      zoom: 15.4,
      essential: true,
      duration: 900,
    });
  }

  async function reverseGeocode(point) {
    const url = mapboxGeocodingUrl(`${point.lng},${point.lat}`, {
      types: "address,poi,postcode,place,locality,neighborhood",
      limit: "1",
    });
    const response = await fetch(url);
    if (!response.ok) throw new Error("Reverse geocoding failed.");
    const data = await response.json();
    return data.features?.[0] || null;
  }

  function savePoint(point, address, placeId = "") {
    setDeliveryFields(form, {
      address,
      placeId,
      lat: point.lat,
      lng: point.lng,
    });
  }

  async function commitPosition(position, address = "", placeId = "", reverse = false) {
    const point = coordinateFrom(position);
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return;

    selectedPoint = point;
    moveMap(point);

    if (!reverse) {
      const selectedAddress = address || input.value || `Pinned handover ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
      input.value = selectedAddress;
      savePoint(point, selectedAddress, placeId);
      setDeliveryStatus("Handover location selected. Drag the rose-gold pin to refine the exact point.");
      return;
    }

    setDeliveryStatus("Refining the nearest UK address from your selected pin...");
    try {
      const feature = await reverseGeocode(point);
      const resolvedAddress = featureAddress(feature) || `Pinned handover ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
      input.value = resolvedAddress;
      savePoint(point, resolvedAddress, feature?.id || "");
      setDeliveryStatus("Pin refined and saved. Your concierge can confirm any final handover notes.");
    } catch {
      const fallback = `Pinned handover ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
      input.value = fallback;
      savePoint(point, fallback, "");
      setDeliveryStatus("Pin saved. Reverse geocoding could not resolve a full address for this exact point.");
    }
  }

  function renderSuggestions(features) {
    if (!suggestions) return;
    suggestions.innerHTML = "";
    currentSuggestions = features;
    activeSuggestion = -1;

    if (features.length === 0) {
      const empty = document.createElement("div");
      empty.className = "address-suggestion address-suggestion-empty";
      empty.textContent = "No UK matches found. Try a postcode, hotel, airport or landmark.";
      suggestions.appendChild(empty);
      suggestions.hidden = false;
      input.setAttribute("aria-expanded", "true");
      return;
    }

    features.forEach((feature, index) => {
      const button = document.createElement("button");
      button.className = "address-suggestion";
      button.type = "button";
      button.role = "option";
      button.id = `delivery-suggestion-${index}`;
      button.dataset.suggestionIndex = String(index);

      const title = document.createElement("span");
      title.textContent = featureTitle(feature);
      const detail = document.createElement("small");
      detail.textContent = featureDetail(feature);
      button.append(title, detail);

      button.addEventListener("click", () => selectSuggestion(index));
      suggestions.appendChild(button);
    });

    suggestions.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function setActiveSuggestion(index) {
    if (!suggestions || currentSuggestions.length === 0) return;
    activeSuggestion = index;
    suggestions.querySelectorAll(".address-suggestion").forEach((item, itemIndex) => {
      const isActive = itemIndex === activeSuggestion;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    input.setAttribute("aria-activedescendant", `delivery-suggestion-${activeSuggestion}`);
  }

  function selectSuggestion(index) {
    const feature = currentSuggestions[index];
    if (!feature?.center) return;
    hideSuggestions();
    commitPosition(feature.center, featureAddress(feature), feature.id || "", false);
  }

  async function searchAddress(query) {
    searchController?.abort();
    searchController = new AbortController();
    const url = mapboxGeocodingUrl(query, {
      autocomplete: "true",
      bbox: `${UK_BOUNDS.west},${UK_BOUNDS.south},${UK_BOUNDS.east},${UK_BOUNDS.north}`,
      proximity: `${LONDON_CENTER.lng},${LONDON_CENTER.lat}`,
      types: "address,poi,postcode,place,locality,neighborhood,district",
    });

    const response = await fetch(url, { signal: searchController.signal });
    if (!response.ok) throw new Error("Address search failed.");
    const data = await response.json();
    return data.features || [];
  }

  function clearSelectedAddressForTyping() {
    setFieldValue(form, "formatted-address", "");
    setFieldValue(form, "place-id", "");
    setFieldValue(form, "lat", "");
    setFieldValue(form, "lng", "");
    saveReservation({
      location: input.value,
      formattedAddress: "",
      placeId: "",
      lat: "",
      lng: "",
    });
    updateSummary();
  }

  input.addEventListener("input", () => {
    const query = input.value.trim();
    window.clearTimeout(searchTimer);
    shortcutButtons.forEach((button) => button.classList.remove("is-selected"));
    clearSelectedAddressForTyping();

    if (query.length < 3) {
      hideSuggestions();
      setDeliveryStatus("Type at least 3 characters to search UK addresses, hotels, airports and landmarks.");
      return;
    }

    setDeliveryStatus("Searching Mapbox for premium handover locations...");
    searchTimer = window.setTimeout(async () => {
      try {
        const features = await searchAddress(query);
        renderSuggestions(features);
        setDeliveryStatus(
          features.length
            ? "Select a suggestion to place the handover pin, then drag it if needed."
            : "No UK matches found. Try a postcode, hotel, airport or nearby landmark.",
        );
      } catch (error) {
        if (error.name === "AbortError") return;
        hideSuggestions();
        setDeliveryStatus("Mapbox address search could not respond. Check your token and network access.");
      }
    }, 240);
  });

  input.addEventListener("keydown", (event) => {
    if (suggestions?.hidden || currentSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((activeSuggestion + 1) % currentSuggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((activeSuggestion - 1 + currentSuggestions.length) % currentSuggestions.length);
    }

    if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      selectSuggestion(activeSuggestion);
    }

    if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target === input || suggestions?.contains(event.target)) return;
    hideSuggestions();
  });

  shortcutButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const query = button.dataset.query || button.textContent.trim();
      if (!query) return;

      input.value = query;
      shortcutButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
      clearSelectedAddressForTyping();
      setDeliveryStatus(`Preparing premium handover options for ${button.textContent.trim()}...`);

      try {
        const features = await searchAddress(query);
        renderSuggestions(features);
        if (features[0]) {
          selectSuggestion(0);
        } else {
          setDeliveryStatus("No Mapbox match found for that preset. Try the full address or postcode.");
        }
      } catch {
        setDeliveryStatus("Mapbox could not load that concierge preset. Try typing the address manually.");
      }
    });
  });

  confirmButton?.removeAttribute("disabled");
  confirmButton?.addEventListener("click", () => {
    if (marker) {
      commitPosition(marker.getLngLat(), input.value, "", !input.value);
      return;
    }

    if (input.value.trim()) {
      input.focus();
      setDeliveryStatus("Choose a Mapbox suggestion first so Velaire can save the exact latitude and longitude.");
      return;
    }

    setDeliveryStatus("Search an address or click the map to set the handover pin.");
  });

  loadMapboxGl()
    .then((mapboxgl) => {
      mapboxglRef = mapboxgl;
      mapboxglRef.accessToken = MAPBOX_TOKEN;
      const center = selectedPoint || LONDON_CENTER;
      mapElement.dataset.ready = "true";
      mapElement.classList.add("is-map-ready");
      mapElement.innerHTML = "";

      map = new mapboxglRef.Map({
        container: mapElement,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [center.lng, center.lat],
        zoom: savedPosition ? 15 : 10.4,
        attributionControl: false,
        cooperativeGestures: true,
        maxBounds: [
          [UK_BOUNDS.west, UK_BOUNDS.south],
          [UK_BOUNDS.east, UK_BOUNDS.north],
        ],
      });

      map.addControl(
        new mapboxglRef.NavigationControl({
          showCompass: false,
          visualizePitch: false,
        }),
        "bottom-right",
      );
      map.addControl(new mapboxglRef.AttributionControl({ compact: true }), "bottom-left");

      map.on("load", () => {
        map.resize();
        if (selectedPoint) ensureMarker(selectedPoint);
      });

      map.on("click", (event) => {
        commitPosition(event.lngLat, "", "", true);
      });

      if (selectedPoint) {
        ensureMarker(selectedPoint);
        setDeliveryStatus("Saved handover pin restored. Search again or drag the pin to refine it.");
      } else {
        setDeliveryStatus("Search a UK address or click the Mapbox map to set a concierge handover pin.");
      }
    })
    .catch(() => {
      mapElement.classList.add("is-map-locked");
      confirmButton?.setAttribute("disabled", "true");
      setDeliveryStatus("Mapbox GL could not load. Check the token, browser network access and domain settings.");
    });

  window.addEventListener(
    "pagehide",
    () => {
      window.clearTimeout(searchTimer);
      searchController?.abort();
      marker?.remove();
      map?.remove();
    },
    { once: true },
  );
}

function accountInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VC";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function bindAccountText(name, value) {
  document.querySelectorAll(`[data-account-bind="${name}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function verificationStatus(account = loadAccount()) {
  const files = account.files || {};
  const required = ["drivingLicence", "proofOfAddress", "selfieId"];
  const selected = required.filter((key) => files[key]?.name).length;
  if (selected === required.length) return "Ready for review";
  if (selected > 0) return "Documents pending";
  return "Not submitted";
}

function documentMeta(file) {
  return {
    name: file.name,
    type: file.type || "Selected document",
    size: file.size || 0,
    status: "ready_for_review",
    storageStatus: "metadata_saved",
    updatedAt: new Date().toISOString(),
  };
}

function readImagePreview(file) {
  if (!file || !file.type?.startsWith("image/") || file.size > 2 * 1024 * 1024) return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function strongestBooking(bookings = []) {
  const priority = {
    confirmed: 1,
    payment_pending: 2,
    pending: 3,
    draft: 4,
    completed: 5,
    cancelled: 6,
  };
  return bookings
    .slice()
    .sort((a, b) => (priority[a.status] || 9) - (priority[b.status] || 9) || String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))[0];
}

function renderCurrentReservation(bookings = []) {
  const target = document.querySelector("[data-current-reservation]");
  if (!target) return;
  const booking = strongestBooking(bookings) || loadBackendBooking();
  if (!booking) {
    target.innerHTML = `
      <article class="account-empty-state">
        <strong>No active reservation yet</strong>
        <span>Reserve a vehicle and your private client timeline will appear here.</span>
      </article>
    `;
    return;
  }

  target.innerHTML = `
    <article class="account-reservation-card">
      <div>
        <span class="status-pill ${statusClass(booking.status)}">${escapeHtml(humanStatus(booking.status))}</span>
        <h3>${escapeHtml(booking.vehicleName || "Velaire reservation")}</h3>
        <p>${escapeHtml(booking.location || "Concierge handover pending")}</p>
      </div>
      <div class="account-reservation-meta">
        <span>${escapeHtml(formatDisplayDate(booking.pickup) || "Pickup pending")}</span>
        <strong>${escapeHtml(booking.reference || booking.id || "Reference pending")}</strong>
        <small>${escapeHtml(humanStatus(booking.paymentStatus || "not_started"))}</small>
      </div>
    </article>
  `;
}

function readinessItem(label, complete, detail) {
  return {
    label,
    complete,
    detail,
  };
}

function renderClientReadiness(account = loadAccount(), bookings = [], payments = []) {
  const target = document.querySelector("[data-client-readiness]");
  const primaryBooking = strongestBooking(bookings) || loadBackendBooking() || {};
  const reservation = loadReservation();
  const hasPaidDeposit =
    payments.some((payment) => payment.status === "deposit_paid") ||
    primaryBooking.paymentStatus === "deposit_paid" ||
    reservation.paymentStatus === "deposit_paid";
  const hasLocation = Boolean(primaryBooking.location || reservation.formattedAddress || reservation.location);
  const isVerified = verificationStatus(account) === "Ready for review";
  const isApproved = primaryBooking.status === "confirmed";
  const items = [
    readinessItem("Profile", Boolean(account.fullName && account.email && account.phone), account.fullName ? "Client details saved" : "Add your client details"),
    readinessItem("Verification", isVerified, isVerified ? "Documents ready for review" : "Upload licence, proof of address and ID"),
    readinessItem("Deposit", hasPaidDeposit, hasPaidDeposit ? "Stripe deposit received" : "Secure deposit required"),
    readinessItem("Handover", hasLocation, hasLocation ? "Preferred location saved" : "Add delivery or handover point"),
    readinessItem("Approval", isApproved, isApproved ? "Reservation approved" : "Concierge approval pending"),
  ];
  const completeCount = items.filter((item) => item.complete).length;

  bindAccountText(
    "portalStatus",
    completeCount >= 4 ? "Release-ready private client" : completeCount >= 2 ? "Concierge review in progress" : "Concierge profile in progress",
  );
  bindAccountText(
    "portalSummary",
    completeCount >= 4
      ? "Your Velaire profile is prepared for a polished handover. The concierge team will confirm final timing."
      : `${completeCount}/5 readiness steps complete. Finish the remaining checks to prepare your vehicle release.`,
  );

  if (!target) return;
  target.innerHTML = items
    .map(
      (item) => `
        <li class="${item.complete ? "is-complete" : "is-pending"}">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.detail)}</span>
        </li>
      `,
    )
    .join("");
}

function renderPaymentHistory(payments = []) {
  const target = document.querySelector("[data-payment-history]");
  if (!target) return;
  if (!payments.length) {
    target.innerHTML = `<li><strong>No payment records yet</strong><span>Stripe deposit activity will appear here after checkout.</span></li>`;
    return;
  }
  target.innerHTML = payments
    .map(
      (payment) => `
        <li>
          <strong>${escapeHtml(payment.bookingReference || payment.bookingId || "Reservation deposit")}</strong>
          <span>${escapeHtml(humanStatus(payment.status))} · ${money(Number(payment.amount || 0))} · ${escapeHtml(payment.providerReference || payment.checkoutSessionId || "Stripe reference pending")}</span>
        </li>
      `,
    )
    .join("");
}

function renderReceipts(receipts = []) {
  const target = document.querySelector("[data-receipt-list]");
  if (!target) return;
  if (!receipts.length) {
    target.innerHTML = `<article class="receipt-card"><strong>No receipts yet</strong><span>Deposit receipts will appear after a successful Stripe payment.</span></article>`;
    return;
  }
  target.innerHTML = receipts
    .map(
      (payment) => `
        <article class="receipt-card">
          <span>${escapeHtml(humanStatus(payment.status))}</span>
          <strong>${money(Number(payment.amountPaid || payment.amount || 0))}</strong>
          <small>${escapeHtml(payment.bookingReference || payment.bookingId || "Velaire reservation")} · ${escapeHtml(payment.providerReference || payment.checkoutSessionId || "Stripe")}</small>
        </article>
      `,
    )
    .join("");
}

function renderAccountPaymentState(bookings = [], payments = []) {
  const paid = isDepositPaidState({ booking: strongestBooking(bookings) || loadBackendBooking(), payments });
  const statusLabel = paid ? "Deposit Paid" : "Deposit Pending";
  const detail = paid
    ? "Payment confirmed by Stripe. Your booking is now in Velaire concierge review."
    : "Secure the reservation deposit through Stripe Checkout to move this booking into concierge review.";
  bindAccountText("cardSummary", statusLabel);
  bindAccountText("cardName", detail);

  const paidMarkup = `
    <span class="status-pill status-deposit-paid">Deposit paid</span>
    <a class="secondary-button" href="#overview">View booking details</a>
  `;
  const unpaidMarkup = `
    <a class="primary-button" href="payment.html">Secure deposit</a>
    <a class="secondary-button" href="ai.html">Ask concierge</a>
  `;

  document.querySelectorAll("[data-account-primary-actions]").forEach((node) => {
    node.innerHTML = paid
      ? `<span class="status-pill status-deposit-paid">Payment confirmed</span><a class="secondary-button" href="#overview">View booking details</a><a class="secondary-button" href="ai.html">Ask concierge</a>`
      : unpaidMarkup;
  });
  document.querySelectorAll("[data-account-payment-actions], [data-account-checkout-actions]").forEach((node) => {
    node.innerHTML = paid ? paidMarkup : unpaidMarkup;
  });

  const paymentSummary = document.querySelector("[data-account-payment-summary]");
  if (paymentSummary) paymentSummary.textContent = detail;
}

function renderSavedLocations(account = loadAccount()) {
  const target = document.querySelector("[data-saved-locations]");
  if (!target) return;
  const reservation = loadReservation();
  const locations = [
    ...(account.savedLocations || []),
    reservation.formattedAddress || reservation.location
      ? {
          label: reservation.formattedAddress || reservation.location,
          type: "Current booking handover",
          lat: reservation.lat || "",
          lng: reservation.lng || "",
        }
      : null,
  ].filter(Boolean);
  const unique = new Map(locations.map((item) => [String(item.label).toLowerCase(), item]));
  const saved = [...unique.values()].slice(0, 5);
  target.innerHTML = saved.length
    ? saved
        .map(
          (location) => `
            <article class="location-card">
              <strong>${escapeHtml(location.label)}</strong>
              <span>${escapeHtml(location.type || "Saved handover point")}</span>
              ${location.lat && location.lng ? `<small>${escapeHtml(location.lat)}, ${escapeHtml(location.lng)}</small>` : ""}
            </article>
          `,
        )
        .join("")
    : `<article class="location-card"><strong>No saved locations yet</strong><span>Save a handover address from a booking to reuse it next time.</span></article>`;
}

function updateAccountDisplay(account = loadAccount()) {
  const displayName = account.fullName || "Velaire Client";
  const initials = accountInitials(displayName);

  ["client-avatar", "profile-avatar"].forEach((id) => {
    const avatar = document.getElementById(id);
    if (!avatar) return;
    const preview = account.files?.displayPhoto?.preview || "";
    avatar.textContent = preview ? "" : initials;
    avatar.style.backgroundImage = preview ? `url("${preview}")` : "";
    avatar.classList.toggle("has-photo", Boolean(preview));
  });

  bindAccountText("displayName", displayName);
  bindAccountText("membership", account.membership || "Velaire Private Client");
  bindAccountText("upcomingCount", "1");
  bindAccountText("verificationStatus", verificationStatus(account));
  bindAccountText("cardSummary", account.cardSummary || "No saved card");
  bindAccountText("cardName", account.cardName || "Cards are entered only inside secure Stripe Checkout.");
  bindAccountText("documentCount", `${Object.values(account.files || {}).filter((file) => file?.name).length}/4 files`);

  document.querySelectorAll("[data-file-label]").forEach((label) => {
    const key = label.dataset.fileLabel;
    const file = account.files?.[key];
    label.textContent = file?.name ? `${file.name} · ${file.status ? humanStatus(file.status) : "Selected"}` : fileLabelDefaults[key] || "Select file";
  });

  const favouriteGrid = document.querySelector("[data-favourite-grid]");
  if (favouriteGrid) {
    const favourites = account.favourites?.length ? account.favourites : loadFavouriteCars();
    const labels = favourites
      .map((slug) => vehicles[slug]?.shortName || vehicles[slug]?.name)
      .filter(Boolean)
      .slice(0, 4);
    favouriteGrid.innerHTML = (labels.length ? labels : ["Lamborghini Urus", "Range Rover SVR", "BMW M440i"])
      .map((label) => `<span>${label}</span>`)
      .join("");
  }
  renderSavedLocations(account);
  renderClientReadiness(account);
}

function renderBookingHistory(bookings = []) {
  const list = document.querySelector("[data-booking-history]");
  if (!list) return;

  if (!bookings.length) {
    list.innerHTML = `
      <li>
        <strong>No backend bookings yet</strong>
        <span>Your saved reservation will appear here once the API syncs.</span>
      </li>
    `;
    return;
  }

  list.innerHTML = bookings
    .slice()
    .reverse()
    .map(
      (booking) => `
        <li>
          <strong>${booking.vehicleName || "Velaire booking"}</strong>
          <span>
            ${humanStatus(booking.status || "draft")} · ${humanStatus(booking.paymentStatus || "not_started")} ·
            ${booking.location || "Handover pending"}
          </span>
        </li>
      `,
    )
    .join("");
  bindAccountText("upcomingCount", String(bookings.filter((booking) => booking.status !== "completed").length || 0));
}

function mergeBackendAccount(user) {
  if (!user) return loadAccount();
  const next = saveAccount({
    fullName: user.profile?.fullName || loadAccount().fullName || "",
    email: user.email || loadAccount().email || "",
    phone: user.phone || loadAccount().phone || "",
    preferredContact: user.profile?.preferredContact || loadAccount().preferredContact || "Email",
    licenceCountry: user.profile?.licenceCountry || loadAccount().licenceCountry || "United Kingdom",
    billingAddress: user.profile?.billingAddress || loadAccount().billingAddress || "",
    billingPostcode: user.profile?.billingPostcode || loadAccount().billingPostcode || "",
    preferredLocation: user.preferences?.preferredLocation || loadAccount().preferredLocation || "",
    savedLocations: user.preferences?.savedLocations || loadAccount().savedLocations || [],
    handoverType: user.preferences?.handoverType || loadAccount().handoverType || "Concierge delivery",
    vehicleCategories: user.preferences?.vehicleCategories || loadAccount().vehicleCategories || [],
    communication: user.preferences?.communication || loadAccount().communication || [],
    favourites: user.favourites || loadAccount().favourites || [],
    files: user.verification?.documents || loadAccount().files || {},
    cardSummary: user.paymentMethod?.label || loadAccount().cardSummary || "No saved card",
    cardName: user.paymentMethod?.name || loadAccount().cardName || "Cards are entered only inside secure Stripe Checkout.",
    cardExpiry: user.paymentMethod?.expiry || loadAccount().cardExpiry || "",
    membership: verificationStatus(loadAccount()) === "Ready for review" ? "Velaire Private Client" : loadAccount().membership || "Velaire Private Client",
  });
  updateAccountDisplay(next);
  return next;
}

async function hydrateAccountFromBackend() {
  const account = loadAccount();
  const email = account.email || loadReservation().email || "";
  const accountPath = email ? `/api/account?email=${encodeURIComponent(email)}` : "/api/account";
  const result = await optionalApiRequest(accountPath, { method: "GET" }, null);
  if (!result) {
    const localBooking = loadBackendBooking();
    const localBookings = localBooking ? [localBooking] : [];
    renderClientReadiness(loadAccount(), localBookings, []);
    renderCurrentReservation(localBookings);
    renderBookingHistory(localBookings);
    renderPaymentHistory([]);
    renderReceipts([]);
    renderAccountPaymentState(localBookings, []);
    return;
  }
  mergeBackendAccount(result.user);
  const bookings = mergeUniqueById([...(result.bookings || []), loadBackendBooking()]);
  const payments = result.payments || [];
  const paidPayment = payments.find((payment) => payment.status === "deposit_paid");
  const paidBooking = bookings.find((booking) => booking.paymentStatus === "deposit_paid") || strongestBooking(bookings);
  if (paidPayment || paidBooking?.paymentStatus === "deposit_paid") {
    savePaidState({ booking: paidBooking, payment: paidPayment });
  }
  renderClientReadiness(loadAccount(), bookings, payments);
  renderCurrentReservation(bookings);
  renderBookingHistory(bookings);
  renderPaymentHistory(payments);
  renderReceipts(result.receipts || []);
  renderAccountPaymentState(bookings, payments);
  updateSummary();
}

function renderAdminMetrics(summary = {}) {
  const counts = summary.counts || {};
  document.querySelectorAll("[data-admin-count]").forEach((item) => {
    item.textContent = String(counts[item.dataset.adminCount] || 0);
  });
  const mode = document.querySelector("[data-admin-mode]");
  if (mode) mode.textContent = "Operations live";
}

function updateAdminAccessState({ message = "", tone = "default", mode = "", unlocked = null } = {}) {
  const status = document.querySelector("[data-admin-access-status]");
  const modeNode = document.querySelector("[data-admin-mode]");
  const input = document.querySelector("[data-admin-token-input]");
  const isUnlocked = unlocked === null ? mode === "Operations live" : Boolean(unlocked);
  document.body.classList.toggle("is-admin-unlocked", isUnlocked);
  if (status) {
    status.textContent =
      message || (loadAdminToken() ? "Portal password saved in this browser." : "Enter the operations password to load the portal.");
    status.classList.toggle("is-warning", tone === "warning");
  }
  if (modeNode && mode) modeNode.textContent = mode;
  if (input && loadAdminToken()) input.value = loadAdminToken();
}

function renderAdminBookings(bookings = []) {
  const target = document.querySelector("[data-admin-bookings]");
  if (!target) return;

  if (!bookings.length) {
    target.innerHTML = `
      <tr>
        <td colspan="7">
          <strong>No booking requests yet</strong><br />
          <span>New client reservations will appear here once the booking flow syncs to the API.</span>
        </td>
      </tr>
    `;
    return;
  }

  target.innerHTML = bookings
    .map((booking) => {
      const dates = `${formatDisplayDate(booking.pickup) || "Pickup pending"} - ${
        formatDisplayDate(booking.return) || "return pending"
      }`;
      const customer = booking.customerEmail || booking.customerPhone || booking.customerName || "Client details pending";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(booking.reference || booking.id)}</strong>
            <span>${escapeHtml(booking.location || "Handover pending")}</span>
          </td>
          <td>${escapeHtml(booking.vehicleName || "Vehicle pending")}</td>
          <td>${escapeHtml(dates)}</td>
          <td>
            <button type="button" class="admin-text-button" data-admin-view-booking="${booking.id}">
              ${escapeHtml(customer)}
            </button>
          </td>
          <td><span class="status-pill ${statusClass(booking.status)}">${escapeHtml(humanStatus(booking.status))}</span></td>
          <td><span class="status-pill muted ${statusClass(booking.paymentStatus)}">${escapeHtml(
            humanStatus(booking.paymentStatus),
          )}</span></td>
          <td>
            <div class="admin-action-row">
              <button type="button" data-admin-booking-action="pending" data-booking-id="${booking.id}">Pending</button>
              <button type="button" data-admin-booking-action="payment_pending" data-booking-id="${booking.id}">Payment pending</button>
              <button type="button" data-admin-booking-action="confirm" data-booking-id="${booking.id}">Confirm</button>
              <button type="button" data-admin-booking-action="cancel" data-booking-id="${booking.id}">Cancel</button>
              <button type="button" data-admin-booking-action="complete" data-booking-id="${booking.id}">Complete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderAdminBookingDetail(booking) {
  const drawer = document.querySelector("[data-admin-detail]");
  const target = document.querySelector("[data-admin-detail-content]");
  if (!drawer || !target || !booking) return;

  const payment = adminState.payments.find((item) => item.bookingId === booking.id);
  const timeline = booking.timeline?.length ? booking.timeline : [];
  target.innerHTML = `
    <div class="panel-heading">
      <p class="eyebrow">Booking detail</p>
      <h2>${escapeHtml(booking.reference || "Velaire booking")}</h2>
      <span>${escapeHtml(booking.vehicleName || "Vehicle pending")}</span>
    </div>

    <div class="admin-detail-grid">
      <div>
        <span>Client</span>
        <strong>${escapeHtml(booking.customerName || booking.customerEmail || "Client details pending")}</strong>
        <small>${escapeHtml(booking.customerEmail || "Email pending")} · ${escapeHtml(booking.customerPhone || "Phone pending")}</small>
      </div>
      <div>
        <span>Status</span>
        <strong><span class="status-pill ${statusClass(booking.status)}">${escapeHtml(humanStatus(booking.status))}</span></strong>
        <small>Payment: ${escapeHtml(humanStatus(booking.paymentStatus))}</small>
      </div>
      <div>
        <span>Dates</span>
        <strong>${escapeHtml(formatDisplayDate(booking.pickup) || "Pickup pending")}</strong>
        <small>Return: ${escapeHtml(formatDisplayDate(booking.return) || "Return pending")}</small>
      </div>
      <div>
        <span>Deposit</span>
        <strong>${money(Number(booking.totals?.deposit || payment?.amount || 0))}</strong>
        <small>${escapeHtml(payment?.providerReference || payment?.checkoutSessionId || "Provider reference pending")}</small>
      </div>
    </div>

    <div class="admin-detail-section">
      <span>Handover</span>
      <p>${escapeHtml(booking.location || "Handover location pending")}</p>
      <small>${escapeHtml(booking.handoverNotes || "No concierge notes yet")}</small>
    </div>

    <div class="admin-detail-section">
      <span>Timeline</span>
      <ul>
        ${
          timeline.length
            ? timeline
                .map((item) => `<li><strong>${escapeHtml(item.label || "Booking update")}</strong><small>${escapeHtml(item.at || "")}</small></li>`)
                .join("")
            : "<li><strong>No timeline yet</strong><small>Updates will appear here.</small></li>"
        }
      </ul>
    </div>
  `;
  drawer.hidden = false;
}

function renderAdminPayments(payments = []) {
  const target = document.querySelector("[data-admin-payments]");
  if (!target) return;

  if (!payments.length) {
    target.innerHTML = `
      <tr>
        <td colspan="6">
          <strong>No deposit records yet</strong><br />
          <span>Stripe Checkout deposit records appear here once a reservation reaches payment.</span>
        </td>
      </tr>
    `;
    return;
  }

  target.innerHTML = payments
    .map(
      (payment) => `
        <tr>
          <td>
            <strong>${money(Number(payment.amount || 0))}</strong>
            <span>
              ${escapeHtml(payment.currency || "GBP")} · paid ${money(Number(payment.amountPaid || 0))}
            </span>
          </td>
          <td>
            ${escapeHtml(payment.bookingReference || payment.bookingId || "Booking pending")}
            <span>${escapeHtml(payment.vehicleName || "Vehicle pending")}</span>
          </td>
          <td>
            ${escapeHtml(payment.customerEmail || "Client pending")}
            <span>${escapeHtml(payment.customerPhone || "")}</span>
          </td>
          <td><span class="status-pill ${statusClass(payment.status)}">${escapeHtml(humanStatus(payment.status))}</span></td>
          <td>
            ${escapeHtml(payment.provider || "stripe_checkout")}
            <span>${escapeHtml(payment.providerReference || payment.checkoutSessionId || "Reference pending")}</span>
            ${payment.failureReason ? `<span>${escapeHtml(payment.failureReason)}</span>` : ""}
          </td>
          <td>
            <div class="admin-action-row">
              <button type="button" data-admin-payment-status="payment_pending" data-payment-id="${payment.id}">Pending</button>
              <button type="button" data-admin-payment-status="cancelled" data-payment-id="${payment.id}">Cancelled</button>
              <button type="button" data-admin-payment-status="refunded" data-payment-id="${payment.id}">Refunded</button>
              <button type="button" data-admin-payment-status="failed" data-payment-id="${payment.id}">Failed</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
}

function renderAdminLeads(leads = []) {
  const target = document.querySelector("[data-admin-leads]");
  if (!target) return;

  if (!leads.length) {
    target.innerHTML = `<article class="admin-empty">No concierge leads yet.</article>`;
    return;
  }

  target.innerHTML = leads
    .map((lead) => {
      const vehicle = vehicles[lead.recommendedVehicle];
      const needsReply = ["new", "contacted"].includes(lead.status || "new");
      return `
        <article class="admin-lead-card">
          <div>
            <span class="status-pill">${escapeHtml(humanStatus(lead.status))}</span>
            <h3>${escapeHtml(vehicle?.shortName || lead.recommendedVehicle || "Fleet recommendation")}</h3>
            <p>${escapeHtml(lead.prompt || "Concierge question pending")}</p>
          </div>
          <small>${escapeHtml(lead.response || "Lead response pending")}</small>
          <div class="admin-message-state">
            <span>${needsReply ? "Reply needed" : "Reply state updated"}</span>
            <strong>${escapeHtml(lead.customerEmail || "Email follow-up pending")}</strong>
          </div>
          <div class="admin-action-row">
            <button type="button" data-admin-lead-status="new" data-lead-id="${lead.id}">New</button>
            <button type="button" data-admin-lead-status="contacted" data-lead-id="${lead.id}">Contacted</button>
            <button type="button" data-admin-lead-status="converted" data-lead-id="${lead.id}">Converted</button>
            <button type="button" data-admin-lead-status="closed" data-lead-id="${lead.id}">Closed</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function adminCalendarStatus(vehicle, isoDate) {
  const availability = vehicle.availability || {};
  const confirmed = (availability.confirmedBookings || []).find((booking) =>
    rangeCoversIso({ start: booking.pickup, end: booking.return }, isoDate),
  );
  if (confirmed) {
    return {
      className: "is-confirmed",
      label: "Confirmed",
      detail: `${confirmed.reference || "Confirmed booking"} blocks this vehicle`,
    };
  }

  const pending = (availability.pendingBookings || []).find((booking) =>
    rangeCoversIso({ start: booking.pickup, end: booking.return }, isoDate),
  );
  if (pending) {
    return {
      className: "is-pending",
      label: humanStatus(pending.status),
      detail: `${pending.reference || "Pending hold"} is awaiting approval`,
    };
  }

  const blocked = (availability.blockedRanges || []).find((block) => rangeCoversIso(block, isoDate));
  if (blocked) {
    return {
      className: "is-blocked",
      label: "Blocked",
      detail: blocked.reason || "Operations block",
    };
  }

  if (availability.status === "offline") {
    return {
      className: "is-offline",
      label: "Offline",
      detail: "Vehicle marked unavailable by operations",
    };
  }

  return {
    className: "is-clear",
    label: "Clear",
    detail: "No block or booking hold currently recorded",
  };
}

function renderAdminAvailabilityCalendar(vehicle) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric" });
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = addDays(start, index);
    const iso = formatIsoDate(date);
    const status = adminCalendarStatus(vehicle, iso);
    return `
      <span
        class="admin-calendar-day ${status.className}"
        title="${escapeHtml(`${status.label}: ${status.detail}`)}"
        aria-label="${escapeHtml(`${month.format(date)} ${status.label}`)}"
      >
        <small>${escapeHtml(weekday.format(date))}</small>
        <strong>${date.getDate()}</strong>
      </span>
    `;
  }).join("");

  return `
    <div class="admin-calendar" aria-label="${escapeHtml(vehicle.name)} availability calendar">
      <div class="admin-calendar-top">
        <div>
          <span>42 day view</span>
          <strong>Availability calendar</strong>
        </div>
        <div class="admin-calendar-legend" aria-label="Availability legend">
          <span class="is-clear">Clear</span>
          <span class="is-pending">Pending</span>
          <span class="is-confirmed">Confirmed</span>
          <span class="is-blocked">Blocked</span>
        </div>
      </div>
      <div class="admin-calendar-grid">${days}</div>
    </div>
  `;
}

function renderAdminVehicles(vehiclesList = []) {
  const target = document.querySelector("[data-admin-vehicles]");
  if (!target) return;

  if (!vehiclesList.length) {
    target.innerHTML = `<article class="admin-empty">Vehicle operations are unavailable until the dashboard connects to the admin API.</article>`;
    return;
  }

  target.innerHTML = vehiclesList
    .map((vehicle) => {
      const blocks = vehicle.availability?.blockedRanges || [];
      const pendingCount = vehicle.availability?.pendingBookings?.length || 0;
      const paymentPendingCount =
        vehicle.availability?.pendingBookings?.filter((booking) => booking.status === "payment_pending").length || 0;
      const confirmedCount = vehicle.availability?.confirmedBookings?.length || 0;
      return `
        <article class="admin-vehicle-card">
          <div>
            <span class="status-pill">${escapeHtml(vehicle.category)}</span>
            <h3>${escapeHtml(vehicle.name)} ${escapeHtml(vehicle.year)}</h3>
            <p>
              ${escapeHtml(vehicle.finish)} · ${pendingCount} pending holds · ${paymentPendingCount} payment pending ·
              ${confirmedCount} confirmed
            </p>
          </div>

          ${renderAdminAvailabilityCalendar(vehicle)}

          <form class="admin-inline-form" data-admin-vehicle-form data-slug="${vehicle.slug}">
            <label>
              Daily rate
              <input type="number" name="rate" min="0" value="${vehicle.rate}" />
            </label>
            <label>
              Deposit
              <input type="number" name="deposit" min="0" value="${vehicle.deposit}" />
            </label>
            <label>
              Status
              <select name="availabilityStatus">
                <option value="active" ${vehicle.availability?.status === "active" ? "selected" : ""}>Active</option>
                <option value="offline" ${vehicle.availability?.status === "offline" ? "selected" : ""}>Offline</option>
              </select>
            </label>
            <button type="submit">Save</button>
          </form>

          <form class="admin-inline-form block-form" data-admin-block-form data-slug="${vehicle.slug}">
            <label>
              Block from
              <input type="date" name="start" required />
            </label>
            <label>
              Block until
              <input type="date" name="end" required />
            </label>
            <label>
              Reason
              <input type="text" name="reason" placeholder="Service, detailing or private hold" />
            </label>
            <button type="submit">Block dates</button>
          </form>

          <div class="admin-block-list">
            ${
              blocks.length
                ? blocks
                    .map(
                      (block) => `
                        <span>
                          <strong>
                            ${escapeHtml(formatDisplayDate(block.start) || block.start)} - ${escapeHtml(
                              formatDisplayDate(block.end) || block.end,
                            )}
                          </strong>
                          <small>${escapeHtml(block.reason || "Operations block")}</small>
                          <button
                            type="button"
                            data-admin-remove-block
                            data-slug="${vehicle.slug}"
                            data-block-id="${block.id}"
                          >
                            Remove
                          </button>
                        </span>
                      `,
                    )
                    .join("")
                : "<span>No blocked dates</span>"
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAdminFailure(error) {
  const needsToken = error?.status === 401;
  updateAdminAccessState({
    tone: "warning",
    mode: needsToken ? "Token required" : "API unavailable",
    unlocked: false,
    message: needsToken
      ? "This Operations portal is locked. Enter the portal password to load bookings, customers and payments."
      : error?.message || "Operations data could not be loaded. The dashboard is showing safe empty states.",
  });
  renderAdminMetrics({ counts: {} });
  renderAdminBookings([]);
  renderAdminVehicles([]);
  renderAdminCustomers([]);
  renderAdminPayments([]);
  renderAdminLeads([]);
}

async function safeAdminRequest(path) {
  try {
    return { ok: true, data: await apiRequest(path) };
  } catch (error) {
    return { ok: false, error };
  }
}

function renderAdminCustomers(customers = []) {
  const target = document.querySelector("[data-admin-customers]");
  if (!target) return;

  if (!customers.length) {
    target.innerHTML = `
      <tr>
        <td colspan="6">
          <strong>No customers yet</strong><br />
          <span>Client accounts and booking enquiries will appear here once customers use the flow.</span>
        </td>
      </tr>
    `;
    return;
  }

  target.innerHTML = customers
    .map(
      (customer) => `
        <tr>
          <td>
            <strong>${escapeHtml(customer.fullName || "Velaire Client")}</strong>
            <span>${escapeHtml(customer.source === "account" ? "Registered account" : "Booking enquiry")}</span>
          </td>
          <td>
            ${escapeHtml(customer.email || "Email pending")}
            <span>${escapeHtml(customer.phone || "Phone pending")}</span>
          </td>
          <td><span class="status-pill muted">${escapeHtml(humanStatus(customer.verificationStatus))}</span></td>
          <td>
            <strong>${Number(customer.totalBookings || 0)}</strong>
            <span>${Number(customer.upcomingBookings || 0)} active · ${Number(customer.completedBookings || 0)} completed</span>
          </td>
          <td>
            ${escapeHtml(customer.lastBookingReference || "No booking yet")}
            <span>${escapeHtml(customer.lastVehicle || customer.lastStatus || "No enquiry activity")}</span>
          </td>
          <td>${money(Number(customer.hireValue || 0))}</td>
        </tr>
      `,
    )
    .join("");
}

async function refreshAdmin() {
  updateAdminAccessState({ mode: "Loading operations", message: "Loading live bookings, customers and Stripe deposits..." });
  const entries = await Promise.all(
    Object.entries({
      summary: "/api/admin/summary",
      bookings: "/api/admin/bookings",
      vehiclesResponse: "/api/admin/vehicles",
      customers: "/api/admin/customers",
      payments: "/api/admin/payments",
      leads: "/api/admin/leads",
    }).map(async ([key, path]) => [key, await safeAdminRequest(path)]),
  );
  const results = Object.fromEntries(entries);
  const unauthorised = Object.values(results).find((result) => !result.ok && result.error?.status === 401);
  if (unauthorised) {
    renderAdminFailure(unauthorised.error);
    return;
  }

  const failures = Object.values(results).filter((result) => !result.ok);
  if (failures.length) {
    showFlowToast("Some operations data could not be loaded. Available records are shown.", "warning");
  }

  const summary = results.summary.data || { summary: {} };
  const bookings = results.bookings.data || { bookings: [] };
  const vehiclesResponse = results.vehiclesResponse.data || { vehicles: [] };
  const customers = results.customers.data || { customers: [] };
  const payments = results.payments.data || { payments: [] };
  const leads = results.leads.data || { leads: [] };
  adminState = {
    bookings: bookings.bookings || [],
    customers: customers.customers || [],
    vehicles: vehiclesResponse.vehicles || summary.summary?.vehicles || [],
    payments: payments.payments || summary.summary?.latestPayments || [],
    leads: leads.leads || summary.summary?.latestLeads || [],
  };
  renderAdminMetrics(summary.summary || {});
  renderAdminBookings(adminState.bookings);
  renderAdminVehicles(adminState.vehicles);
  renderAdminCustomers(adminState.customers);
  renderAdminPayments(adminState.payments);
  renderAdminLeads(adminState.leads);
  updateAdminAccessState({
    mode: "Operations live",
    unlocked: true,
    message:
      summary.summary?.storedOperations?.available === true
        ? "Admin API loaded from the operations data store and Stripe Checkout ledger."
        : summary.summary?.stripeOperations?.available === false
        ? "Admin API loaded. Stripe payment ledger is unavailable until STRIPE_SECRET_KEY is configured."
        : "Admin API loaded from Stripe Checkout. Add Vercel KV or Upstash Redis REST variables for persisted operations records.",
  });
}

function setupAdmin() {
  const tokenForm = document.querySelector("[data-admin-token-form]");
  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = new FormData(tokenForm).get("adminToken");
    saveAdminToken(token);
    await refreshAdmin();
  });

  document.querySelector("[data-admin-token-clear]")?.addEventListener("click", async () => {
    saveAdminToken("");
    const input = document.querySelector("[data-admin-token-input]");
    if (input) input.value = "";
    await refreshAdmin();
  });

  refreshAdmin().catch((error) => {
    renderAdminFailure(error);
    showFlowToast(error.message || "Operations dashboard could not load.", "warning");
  });

  document.addEventListener("click", async (event) => {
    const closeDetail = event.target.closest("[data-admin-detail-close]");
    if (closeDetail) {
      const drawer = document.querySelector("[data-admin-detail]");
      if (drawer) drawer.hidden = true;
      return;
    }

    const viewBooking = event.target.closest("[data-admin-view-booking]");
    if (viewBooking) {
      const booking = adminState.bookings.find((item) => item.id === viewBooking.dataset.adminViewBooking);
      renderAdminBookingDetail(booking);
      return;
    }

    const removeBlock = event.target.closest("[data-admin-remove-block]");
    if (removeBlock) {
      removeBlock.disabled = true;
      try {
        await apiRequest("/api/admin/vehicles", {
          method: "DELETE",
          body: JSON.stringify({
            slug: removeBlock.dataset.slug,
            blockId: removeBlock.dataset.blockId,
          }),
        });
        showFlowToast("Vehicle block removed.");
        await refreshAdmin();
      } catch (error) {
        showFlowToast(error.message || "Block removal failed.", "warning");
      } finally {
        removeBlock.disabled = false;
      }
      return;
    }

    const paymentButton = event.target.closest("[data-admin-payment-status]");
    if (paymentButton) {
      paymentButton.disabled = true;
      try {
        await apiRequest("/api/admin/payments", {
          method: "PATCH",
          body: JSON.stringify({
            id: paymentButton.dataset.paymentId,
            patch: {
              status: paymentButton.dataset.adminPaymentStatus,
            },
          }),
        });
        showFlowToast(`Deposit marked ${paymentButton.dataset.adminPaymentStatus}.`);
        await refreshAdmin();
      } catch (error) {
        showFlowToast(error.message || "Payment update failed.", "warning");
      } finally {
        paymentButton.disabled = false;
      }
      return;
    }

    const leadButton = event.target.closest("[data-admin-lead-status]");
    if (leadButton) {
      leadButton.disabled = true;
      try {
        await apiRequest("/api/admin/leads", {
          method: "PATCH",
          body: JSON.stringify({
            id: leadButton.dataset.leadId,
            patch: {
              status: leadButton.dataset.adminLeadStatus,
            },
          }),
        });
        showFlowToast(`Lead marked ${leadButton.dataset.adminLeadStatus}.`);
        await refreshAdmin();
      } catch (error) {
        showFlowToast(error.message || "Lead update failed.", "warning");
      } finally {
        leadButton.disabled = false;
      }
      return;
    }

    const button = event.target.closest("[data-admin-booking-action]");
    if (!button) return;
    button.disabled = true;
    try {
      await apiRequest("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({
          id: button.dataset.bookingId,
          action: button.dataset.adminBookingAction,
        }),
      });
      showFlowToast(`Booking marked ${adminActionLabel(button.dataset.adminBookingAction)}.`);
      await refreshAdmin();
    } catch (error) {
      showFlowToast(error.message || "Booking action failed.", "warning");
    } finally {
      button.disabled = false;
    }
  });

  document.addEventListener("submit", async (event) => {
    const vehicleForm = event.target.closest("[data-admin-vehicle-form]");
    const blockForm = event.target.closest("[data-admin-block-form]");
    if (!vehicleForm && !blockForm) return;
    event.preventDefault();

    const form = vehicleForm || blockForm;
    const data = new FormData(form);
    const slug = form.dataset.slug;
    try {
      if (vehicleForm) {
        await apiRequest("/api/admin/vehicles", {
          method: "PATCH",
          body: JSON.stringify({
            slug,
            patch: {
              rate: data.get("rate"),
              deposit: data.get("deposit"),
              availabilityStatus: data.get("availabilityStatus"),
            },
          }),
        });
        showFlowToast("Vehicle pricing and availability saved.");
      } else {
        await apiRequest("/api/admin/vehicles", {
          method: "POST",
          body: JSON.stringify({
            slug,
            block: {
              start: data.get("start"),
              end: data.get("end"),
              reason: data.get("reason"),
            },
          }),
        });
        form.reset();
        showFlowToast("Vehicle dates blocked.");
      }
      await refreshAdmin();
    } catch (error) {
      showFlowToast(error.message || "Operations update failed.", "warning");
    }
  });
}

function fillAccountForm(form, account = loadAccount()) {
  [...form.elements].forEach((field) => {
    if (!field.name || field.type === "file") return;

    const value = account[field.name];
    if (field.type === "checkbox") {
      field.checked = Array.isArray(value) ? value.includes(field.value) : Boolean(value);
      return;
    }

    if (field.type === "radio") {
      field.checked = value === field.value;
      return;
    }

    if (value) field.value = value;
  });
}

function readAccountForm(form) {
  const next = {};

  [...form.elements].forEach((field) => {
    if (!field.name || field.type === "file") return;

    if (field.type === "checkbox") {
      if (!Array.isArray(next[field.name])) next[field.name] = [];
      if (field.checked) next[field.name].push(field.value);
      return;
    }

    if (field.type === "radio") {
      if (field.checked) next[field.name] = field.value;
      return;
    }

    next[field.name] = field.value;
  });

  return next;
}

function pulseSaved(button, label = "Saved") {
  if (!button) return;
  const original = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1400);
}

function appendConciergeMessage(role, message) {
  const chat = document.getElementById("concierge-chat");
  if (!chat) return;

  const bubble = document.createElement("div");
  bubble.className = `concierge-message ${role}`;
  const label = document.createElement("strong");
  label.textContent = role === "user" ? "You" : "Velaire Concierge";
  const text = document.createElement("p");
  text.textContent = message;
  bubble.append(label, text);
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
}

function conciergeVehicleAliases(vehicle) {
  const aliases = [
    vehicle.name,
    vehicle.slug,
    vehicle.category,
    vehicle.bodyType,
    vehicle.colour,
    vehicle.finish,
    ...vehicle.bestUseCases,
  ];

  if (vehicle.slug === "lamborghini-urus") aliases.push("urus", "lamborghini", "super suv", "lambo");
  if (vehicle.slug === "range-rover-sport-svr") aliases.push("svr", "range rover", "range rover svr", "land rover");
  if (vehicle.slug === "tesla-model-3-performance") aliases.push("tesla", "model 3", "electric");
  if (vehicle.slug === "bmw-m440i-convertible") aliases.push("m440i", "convertible", "open top", "open-top");
  if (vehicle.slug === "bmw-m140i-shadow-edition") aliases.push("m140i", "m140", "shadow edition", "hot hatch");

  return aliases;
}

function matchConciergeFleet(question) {
  const lower = question.toLowerCase();
  return fleetKnowledgeBase.filter((vehicle) =>
    conciergeVehicleAliases(vehicle).some((alias) => lower.includes(alias.toLowerCase())),
  );
}

function conciergeVehicleScore(vehicle, question) {
  const lower = question.toLowerCase();
  let score = 0;

  if (
    vehicle.slug === "lamborghini-urus" &&
    /(impact|presence|flex|vip|content|event|launch|attention|impress|biggest|exclusive|upsell)/.test(lower)
  ) {
    score += 10;
  }
  if (
    vehicle.slug === "range-rover-sport-svr" &&
    /(performance suv|family|luggage|airport|practical|all-weather|comfort|svr|passengers|four)/.test(lower)
  ) {
    score += 9;
  }
  if (
    vehicle.slug === "tesla-model-3-performance" &&
    /(electric|quiet|refined|business|executive|clean|city|modern|subtle)/.test(lower)
  ) {
    score += 8;
  }
  if (
    vehicle.slug === "bmw-m440i-convertible" &&
    /(wedding|summer|convertible|open|coastal|date|grand touring|weekend|occasion)/.test(lower)
  ) {
    score += 8;
  }
  if (
    vehicle.slug === "bmw-m140i-shadow-edition" &&
    /(compact|subtle|driver|fun|sporty|budget|value|hatch|understated)/.test(lower)
  ) {
    score += 8;
  }

  const haystack = [
    vehicle.name,
    vehicle.category,
    vehicle.bodyType,
    vehicle.colour,
    vehicle.personality,
    vehicle.idealCustomer,
    ...vehicle.bestUseCases,
    ...vehicle.keySellingPoints,
  ]
    .join(" ")
    .toLowerCase();

  lower
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .forEach((token) => {
      if (haystack.includes(token)) score += 1;
    });

  return score;
}

function compareConciergeVehicles(vehicles) {
  const comparison = vehicles
    .slice(0, 3)
    .map(
      (vehicle) =>
        `${vehicle.name}: ${vehicle.personality} Best for ${vehicle.bestUseCases
          .slice(0, 3)
          .join(", ")}. Reference rate ${money(vehicle.dailyRate)}/day.`,
    )
    .join(" ");
  const premiumPick = vehicles.slice(0, 3).sort((a, b) => b.dailyRate - a.dailyRate)[0];
  return `${comparison} My premium pick is ${premiumPick.name} if the goal is the strongest impression. I would reserve it with concierge delivery and a confirmed handover window.`;
}

function conciergeRecommendation(question) {
  const lower = question.toLowerCase();
  const matchedVehicles = matchConciergeFleet(question);

  if (lower.includes("compare") && matchedVehicles.length >= 2) {
    return compareConciergeVehicles(matchedVehicles);
  }

  if (/(fleet|what cars|available|options|list)/.test(lower)) {
    return `The Velaire fleet is ${fleetKnowledgeBase
      .map((vehicle) => vehicle.name)
      .join(", ")}. Tell me the occasion, passenger count and desired impression and I will guide you to the strongest choice.`;
  }

  if (matchedVehicles.length === 1 && /(detail|spec|about|price|cost|how much|tell)/.test(lower)) {
    const vehicle = matchedVehicles[0];
    return `${vehicle.name} is a ${vehicle.bodyType} in ${vehicle.colour} with ${vehicle.interior}. It is strongest for ${vehicle.bestUseCases
      .slice(0, 4)
      .join(", ")}. Key selling points: ${vehicle.keySellingPoints.join(", ")}. Reference rate ${money(
      vehicle.dailyRate,
    )}/day with deposit guidance from ${money(vehicle.deposit)}. ${vehicle.upsell}`;
  }

  const ranked = [...fleetKnowledgeBase].sort(
    (a, b) => conciergeVehicleScore(b, question) - conciergeVehicleScore(a, question),
  );
  const pick = ranked[0];
  const alternative = ranked[1];

  return `${pick.name} is my recommendation. ${pick.personality} It is best for ${pick.bestUseCases
    .slice(0, 4)
    .join(", ")} and suits ${pick.idealCustomer.toLowerCase()} Reference rate ${money(
    pick.dailyRate,
  )}/day with deposit guidance from ${money(
    pick.deposit,
  )}. A strong alternative is ${alternative.name} if you want ${alternative.personality.toLowerCase()} ${pick.upsell} I would reserve with concierge delivery, pre-handover detailing and a confirmed arrival window.`;
}

function setupConciergeAssistant() {
  const form = document.getElementById("concierge-form");
  const input = form?.elements?.conciergeQuestion;
  if (!form || !input) return;

  async function ask(question) {
    const clean = question.trim();
    if (!clean) return;
    appendConciergeMessage("user", clean);
    try {
      const result = await apiRequest("/api/concierge", {
        method: "POST",
        body: JSON.stringify({ prompt: clean }),
      });
      appendConciergeMessage("assistant", result.response || conciergeRecommendation(clean));
    } catch {
      appendConciergeMessage("assistant", conciergeRecommendation(clean));
    }
    input.value = "";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  document.querySelectorAll("[data-concierge-prompt]").forEach((button) => {
    button.addEventListener("click", () => ask(button.dataset.conciergePrompt || button.textContent));
  });
}

function setupAccount() {
  const account = loadAccount();

  document.querySelectorAll("[data-account-form]").forEach((form) => {
    fillAccountForm(form, account);

    form.addEventListener("input", () => {
      updateAccountDisplay(saveAccount(readAccountForm(form)));
    });
    form.addEventListener("change", () => {
      updateAccountDisplay(saveAccount(readAccountForm(form)));
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      updateAccountDisplay(saveAccount(readAccountForm(form)));
      await syncAccountToBackend(loadAccount());
      pulseSaved(form.querySelector('button[type="submit"]'));
    });
  });

  document.querySelectorAll("[data-file-input]").forEach((input) => {
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      const accountNext = loadAccount();
      const key = input.dataset.fileInput;
      const meta = documentMeta(file);
      if (key === "displayPhoto") {
        meta.preview = await readImagePreview(file);
      }
      updateAccountDisplay(
        saveAccount({
          files: {
            ...(accountNext.files || {}),
            [key]: meta,
          },
        }),
      );
      syncAccountToBackend(loadAccount());
    });
  });

  document.querySelector("[data-save-current-location]")?.addEventListener("click", () => {
    const reservation = loadReservation();
    const label = reservation.formattedAddress || reservation.location;
    if (!label) {
      showFlowToast("Add a delivery location in the booking flow first.", "warning");
      return;
    }
    const accountNext = loadAccount();
    const savedLocations = [
      ...(accountNext.savedLocations || []),
      {
        label,
        type: "Concierge delivery",
        lat: reservation.lat || "",
        lng: reservation.lng || "",
        updatedAt: new Date().toISOString(),
      },
    ];
    updateAccountDisplay(saveAccount({ savedLocations }));
    syncAccountToBackend(loadAccount());
    showFlowToast("Handover location saved to your client lounge.");
  });

  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await logoutBackendSession();
    renderFlowAuthNavigation({ authenticated: false, user: null });
    showFlowToast("Signed out of the backend session. Local booking details remain on this device.");
  });

  updateAccountDisplay(account);
  hydrateAccountFromBackend();
  setupConciergeAssistant();
}

function setupBooking() {
  const form = document.querySelector("form");
  const reservation = loadReservation();
  const slug = selectedSlug();
  const radio = document.querySelector(`input[name="vehicle"][value="${slug}"]`);
  if (radio) radio.checked = true;

  setFieldValue(form, "pickup", reservation.pickup);
  setFieldValue(form, "pickup-time", reservation.pickupTime);
  setFieldValue(form, "return", reservation.return);
  setFieldValue(form, "return-time", reservation.returnTime);
  setFieldValue(form, "location", reservation.location);
  setFieldValue(form, "formatted-address", reservation.formattedAddress);
  setFieldValue(form, "place-id", reservation.placeId);
  setFieldValue(form, "lat", reservation.lat);
  setFieldValue(form, "lng", reservation.lng);
  setFieldValue(form, "handover-notes", reservation.handoverNotes);

  function refreshCards() {
    document.querySelectorAll("[data-vehicle-card]").forEach((card) => {
      const input = card.querySelector('input[name="vehicle"]');
      card.classList.toggle("is-selected", Boolean(input?.checked));
    });

    const checked = document.querySelector('input[name="vehicle"]:checked');
    if (checked) {
      saveReservation({ vehicle: checked.value });
      updateSummary();
    }
  }

  function persistDraft() {
    if (!form) return;
    saveReservation(readBookingForm(form));
    updateSummary();
    window.clearTimeout(persistDraft.availabilityTimer);
    persistDraft.availabilityTimer = window.setTimeout(checkAvailability, 360);
  }

  document.querySelectorAll('input[name="vehicle"]').forEach((input) => {
    input.addEventListener("change", () => {
      refreshCards();
      persistDraft();
    });
  });

  form?.addEventListener("input", persistDraft);
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveReservation(readBookingForm(form));
    try {
      const availability = await checkAvailability();
      if (availability && availability.available === false) return;
      await syncBookingToBackend("draft");
      navigateTo(form.getAttribute("action") || "login.html");
    } catch {
      // Conflict messaging is handled by the API helper toast.
    }
  });

  refreshCards();
  persistDraft();
  setupElegantDatePicker(form);
  setupMapboxDeliveryPicker(form);
}

function setupLogin() {
  const form = document.querySelector("form");
  const reservation = loadReservation();
  const account = loadAccount();

  setFieldValue(form, "fullName", account.fullName || reservation.fullName || reservation.name);
  setFieldValue(form, "email", reservation.email);
  setFieldValue(form, "phone", reservation.phone);

  async function continueSignedIn(user) {
    mergeAuthenticatedUser(user);
    const context = await fetchAccountContext(user.email);
    const existingBooking = matchingActiveVehicleBooking(context?.bookings || []);
    if (existingBooking) {
      saveBackendBooking(existingBooking);
      saveReservation({
        bookingId: existingBooking.id,
        reference: existingBooking.reference,
        status: existingBooking.status,
        paymentStatus: existingBooking.paymentStatus,
      });
      if (existingBooking.paymentStatus === "deposit_paid") savePaidState({ booking: existingBooking });
      renderLoginState({
        tone: existingBooking.paymentStatus === "deposit_paid" ? "success" : "warning",
        title: existingBooking.paymentStatus === "deposit_paid" ? "Reservation already secured" : "Reservation already exists",
        message:
          existingBooking.paymentStatus === "deposit_paid"
            ? "You already have a paid deposit for this vehicle. Open your client lounge for the latest booking state."
            : "You already have an active reservation for this vehicle. Continue to the existing reservation instead of creating a duplicate.",
        actions: `<a class="secondary-button" href="account.html">Open client lounge</a>${
          existingBooking.paymentStatus === "deposit_paid" ? "" : '<a class="primary-button" href="payment.html">Continue existing reservation</a>'
        }`,
      });
      return false;
    }

    renderLoginState({
      tone: "success",
      title: "Signed in",
      message: "Your Velaire account is active. Continuing to the reservation step.",
    });
    await syncAccountToBackend(loadAccount());
    await syncBookingToBackend("pending");
    window.setTimeout(() => navigateTo(form?.getAttribute("action") || "payment.html"), 650);
    return true;
  }

  fetchAuthSession().then((session) => {
    if (session?.authenticated && session.user) continueSignedIn(session.user);
  });

  form?.elements?.email?.addEventListener("blur", async () => {
    const email = form.elements.email.value.trim();
    if (!email) return;
    const context = await fetchAccountContext(email);
    if (!context?.exists) {
      clearLoginState();
      return;
    }
    const existingBooking = matchingActiveVehicleBooking(context.bookings || []);
    if (existingBooking) {
      renderLoginState({
        tone: "warning",
        title: "Existing Velaire reservation found",
        message:
          existingBooking.paymentStatus === "deposit_paid"
            ? "This email already has a paid deposit for the selected vehicle."
            : "This email already has an active reservation for the selected vehicle. Sign in or continue the existing booking.",
      });
      return;
    }
    if (context.authAccountExists) {
      renderLoginState({
        title: "Welcome back",
        message: "A Velaire account already exists for this email. Enter the account password and we will continue the reservation securely.",
      });
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearLoginState();
    const data = new FormData(form);
    const fullName = data.get("fullName") || "";
    const email = data.get("email") || "";
    const phone = data.get("phone") || "";
    const password = data.get("password") || "";
    saveReservation({
      name: fullName,
      fullName,
      email,
      phone,
    });
    saveAccount({
      fullName,
      email: data.get("email") || "",
      phone: data.get("phone") || "",
    });
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Checking client record...";
    }
    try {
      const context = await fetchAccountContext(email);
      const existingBooking = matchingActiveVehicleBooking(context?.bookings || []);
      if (existingBooking) {
        saveBackendBooking(existingBooking);
        saveReservation({
          bookingId: existingBooking.id,
          reference: existingBooking.reference,
          status: existingBooking.status,
          paymentStatus: existingBooking.paymentStatus,
        });
        if (existingBooking.paymentStatus === "deposit_paid") savePaidState({ booking: existingBooking });
        renderLoginState({
          tone: existingBooking.paymentStatus === "deposit_paid" ? "success" : "warning",
          title: existingBooking.paymentStatus === "deposit_paid" ? "Deposit already paid" : "Existing reservation found",
          message:
            existingBooking.paymentStatus === "deposit_paid"
              ? "This email already has a paid reservation deposit for the selected vehicle. We have loaded the confirmed booking state."
              : "This email already has an active reservation for the selected vehicle. Continue with that booking instead of creating a duplicate.",
          actions: `<a class="secondary-button" href="account.html">View booking details</a>${
            existingBooking.paymentStatus === "deposit_paid" ? "" : '<a class="primary-button" href="payment.html">Continue existing reservation</a>'
          }`,
        });
        return;
      }

      const authResult = await ensureBackendAccount({
        email,
        phone,
        password,
        fullName,
        accountExists: Boolean(context?.exists),
        authAccountExists: Boolean(context?.authAccountExists),
      });
      if (authResult?.user) mergeAuthenticatedUser(authResult.user);
      await syncAccountToBackend(loadAccount());
      await syncBookingToBackend("pending");
      navigateTo(form.getAttribute("action") || "payment.html");
    } catch (error) {
      renderLoginState({
        tone: "warning",
        title: "Sign in to continue",
        message:
          error.message ||
          "A Velaire account already exists for this email. Enter the correct password to continue the reservation.",
      });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Continue to reservation";
      }
    }
  });
}

function setupPayment() {
  const form = document.querySelector("form");
  const providerStatus = document.querySelector("[data-payment-provider-status]");
  const paymentAlert = document.querySelector("[data-payment-alert]");
  const paidPanel = document.querySelector("[data-payment-paid-panel]");
  const submitButton = form?.querySelector('button[type="submit"]');
  const params = new URLSearchParams(window.location.search);

  function renderPaidPaymentState({ booking = loadBackendBooking(), payment = null } = {}) {
    savePaidState({ booking, payment });
    if (providerStatus) providerStatus.textContent = "Deposit already paid. No further checkout is required.";
    if (paymentAlert) paymentAlert.hidden = true;
    if (paidPanel) paidPanel.hidden = false;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Deposit paid";
    }
    form?.classList.add("is-payment-confirmed");
    updateSummary();
  }

  if (params.get("payment") === "cancelled") {
    saveReservation({ status: "payment_pending", paymentStatus: "cancelled" });
    if (providerStatus) providerStatus.textContent = "Checkout was cancelled. No deposit has been taken.";
    if (paymentAlert) {
      paymentAlert.hidden = false;
      paymentAlert.classList.add("is-warning");
      paymentAlert.textContent = "Payment was cancelled before completion. Your booking is not confirmed yet.";
    }
    if (submitButton) submitButton.textContent = "Retry secure deposit checkout";
  }

  if (isDepositPaidState()) {
    renderPaidPaymentState();
  } else {
    const email = loadReservation().email || loadAccount().email || "";
    fetchAccountPaymentState(email)
      .then((state) => {
        if (state.paid) renderPaidPaymentState({ booking: state.booking, payment: state.payment });
      })
      .catch(() => {
        // The page remains usable offline; the submit handler still checks the server before redirecting.
      });
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isDepositPaidState()) {
      renderPaidPaymentState();
      return;
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Preparing secure Checkout...";
    }
    if (providerStatus) providerStatus.textContent = "Creating a secure Stripe Checkout session.";
    try {
      await syncBookingToBackend("payment_pending");
      const checkout = await createPaymentCheckout();
      if (!checkout?.checkoutUrl) {
        throw new Error("Stripe Checkout did not return a payment URL.");
      }
      if (providerStatus) providerStatus.textContent = "Redirecting to secure Stripe Checkout.";
      window.location.href = checkout.checkoutUrl;
    } catch (error) {
      if (error.alreadyPaid) {
        renderPaidPaymentState({ booking: error.payload?.booking, payment: error.payload?.payment });
        showFlowToast("Deposit is already paid for this reservation.");
        return;
      }
      if (providerStatus) providerStatus.textContent = "Secure Stripe Checkout could not be started.";
      if (paymentAlert) {
        paymentAlert.hidden = false;
        paymentAlert.classList.add("is-warning");
        paymentAlert.textContent =
          error.message || "Stripe Checkout is unavailable. The deposit has not been paid and this booking is not confirmed.";
      }
    } finally {
      if (submitButton) {
        const paid = isDepositPaidState();
        submitButton.disabled = paid;
        submitButton.textContent = paid ? "Deposit paid" : "Create secure deposit session";
      }
    }
  });
}

async function setupSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const title = document.querySelector("[data-success-title]");
  const message = document.querySelector("[data-success-message]");
  const banner = document.querySelector("[data-success-payment-banner]");

  if (!sessionId) {
    saveReservation({
      status: loadReservation().status || "payment_pending",
      paymentStatus: loadReservation().paymentStatus || "payment_pending",
    });
    if (title) title.textContent = "Payment confirmation is pending.";
    if (message) {
      message.textContent =
        "This confirmation screen has no Stripe session attached. Return to payment to complete the deposit securely.";
    }
    if (banner) {
      banner.classList.add("is-warning");
      banner.textContent = "No Stripe Checkout session was found for this visit.";
    }
    updateSummary();
    return;
  }

  if (banner) banner.textContent = "Verifying your Stripe deposit session...";
  const result = await verifyCheckoutSession(sessionId);
  const status = result?.paymentStatus || result?.payment?.status || "payment_pending";
  if (status === "deposit_paid") {
    savePaidState({ booking: result?.booking, payment: result?.payment });
    saveReservation({ status: "confirmed", paymentStatus: "deposit_paid", confirmedAt: new Date().toISOString() });
    if (title) title.textContent = "Deposit paid. Your Velaire reservation is confirmed.";
    if (message) {
      message.textContent =
        "Stripe has confirmed the reservation deposit. The concierge team will now finalise handover timing, documents and delivery details.";
    }
    if (banner) {
      banner.classList.add("is-success");
      banner.textContent = "Deposit paid securely through Stripe Checkout.";
    }
  } else {
    saveReservation({ status: "payment_pending", paymentStatus: status });
    if (title) title.textContent = "Payment is still pending.";
    if (message) {
      message.textContent =
        "Stripe has not confirmed a paid deposit yet. Your booking is held for payment review, but it is not confirmed as paid.";
    }
    if (banner) {
      banner.classList.add("is-warning");
      banner.textContent = `Stripe status: ${humanStatus(status)}.`;
    }
  }
  updateSummary();
}

const page = document.body.dataset.page;
hydrateVehicleModels();
setupFlowAuthNavigation();
if (page === "booking") setupBooking();
if (page === "login") setupLogin();
if (page === "payment") setupPayment();
if (page === "success") setupSuccess();
if (page === "account") setupAccount();
if (page === "ai") setupConciergeAssistant();
if (page === "admin") setupAdmin();
updateSummary();
