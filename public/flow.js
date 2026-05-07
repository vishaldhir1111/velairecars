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
    fallbackImagePath: "/cars/studio-tesla-model-3-performance-2020.png",
    modelAvailable: false,
    viewerMode: "studio-3d-render",
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
    fallbackImagePath: "/cars/studio-lamborghini-urus-2021-orange.png",
    modelAvailable: false,
    viewerMode: "studio-3d-render",
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
    fallbackImagePath: "/cars/studio-range-rover-sport-svr-2021.png",
    modelAvailable: false,
    viewerMode: "studio-3d-render",
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
    fallbackImagePath: "/cars/studio-bmw-m440i-convertible-2022-sky-blue.png",
    modelAvailable: false,
    viewerMode: "studio-3d-render",
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
    fallbackImagePath: "/cars/studio-bmw-m140i-shadow-edition-2019.png",
    modelAvailable: false,
    viewerMode: "studio-3d-render",
    visualLabel: "BMW M140i Shadow Edition 2019",
    description:
      "A compact performance favourite with B58 power, understated Shadow Edition styling and a focused premium cabin.",
  },
};

Object.entries(vehicles).forEach(([slug, vehicle]) => {
  vehicle.slug = slug;
});

const generatedVehicleMedia = Object.freeze(
  Object.fromEntries(
    Object.entries(vehicles).map(([slug, vehicle]) => [
      slug,
      Object.freeze({
        visualClass: vehicle.visualClass,
        modelType: vehicle.modelType,
        modelPath: vehicle.modelPath,
        fallbackImagePath: vehicle.fallbackImagePath,
        modelAvailable: false,
        viewerMode: "studio-3d-render",
        visualLabel: vehicle.visualLabel,
      }),
    ]),
  ),
);

const storageKey = "velaireReservation";
const accountStorageKey = "velaireAccount";
const backendBookingKey = "velaireBackendBooking";
const favouriteStorageKey = "velaireFavouriteCars";
const adminTokenStorageKey = "velaireAdminToken";
const defaultVehicle = Object.keys(vehicles)[0] || "";
const RESERVATION_FEE = 79;
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

const blockedAnalyticsKey = /email|phone|name|address|postcode|lat|lng|token|password|secret/i;

function cleanAnalyticsData(data = {}) {
  const safe = {
    page: document.body?.dataset.page || "unknown",
  };
  Object.entries(data || {}).forEach(([key, value]) => {
    if (blockedAnalyticsKey.test(key)) return;
    if (typeof value === "boolean") {
      safe[key] = value;
      return;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      safe[key] = value;
      return;
    }
    if (typeof value === "string") {
      safe[key] = value.trim().slice(0, 96);
    }
  });
  return safe;
}

function trackVelaireEvent(name, data = {}) {
  try {
    if (typeof window.va !== "function") return;
    window.va("event", {
      name,
      data: cleanAnalyticsData(data),
    });
  } catch {
    // Analytics must never interrupt booking, payment or operations flows.
  }
}

function trackVelaireEventOnce(key, name, data = {}) {
  try {
    const storageKey = `velaireAnalytics:${key}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "1");
  } catch {
    // If sessionStorage is unavailable, still allow the event attempt.
  }
  trackVelaireEvent(name, data);
}

function humanStatus(value = "") {
  const labels = {
    reservation_fee_paid: "Reservation Fee Paid",
    rental_paid: "Rental Paid",
    deposit_paid: "Deposit Paid",
  };
  const clean = String(value || "pending").toLowerCase();
  if (labels[clean]) return labels[clean];
  return String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusPill(value = "", extraClass = "") {
  const status = String(value || "pending").toLowerCase();
  return `<span class="status-pill ${extraClass}" data-status="${escapeHtml(status)}">${humanStatus(status)}</span>`;
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

function isKnownVehicleSlug(slug = "") {
  return Boolean(slug && vehicles[String(slug).trim()]);
}

function normaliseVehicleSlug(slug = "") {
  const clean = String(slug || "").trim();
  return isKnownVehicleSlug(clean) ? clean : "";
}

function firstBookableVehicleSlug() {
  return Object.keys(vehicles)[0] || "";
}

function checkedVehicleSlug() {
  return normaliseVehicleSlug(document.querySelector('input[name="vehicle"]:checked')?.value || "");
}

function queryVehicleSlug() {
  const params = new URLSearchParams(window.location.search);
  return normaliseVehicleSlug(params.get("vehicle") || "");
}

function resolveSelectedVehicleSlug({ preferUrl = true, preferChecked = false, preferStored = true } = {}) {
  const reservation = loadReservation();
  const candidates = [
    preferUrl ? queryVehicleSlug() : "",
    preferChecked ? checkedVehicleSlug() : "",
    preferStored ? normaliseVehicleSlug(reservation.vehicle) : "",
    preferChecked ? "" : checkedVehicleSlug(),
    firstBookableVehicleSlug(),
    defaultVehicle,
  ];
  return candidates.find((slug) => isKnownVehicleSlug(slug)) || "";
}

function syncVehicleQueryParam(slug = "") {
  const selected = normaliseVehicleSlug(slug);
  if (!selected || !window.history?.replaceState) return;
  const url = new URL(window.location.href);
  url.searchParams.set("vehicle", selected);
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function saveSelectedVehicleSlug(slug = "") {
  const selected = normaliseVehicleSlug(slug) || resolveSelectedVehicleSlug({ preferUrl: false, preferChecked: true });
  if (!selected) return loadReservation();
  return saveReservation({ vehicle: selected });
}

function loadAccount() {
  const reservation = loadReservation();
  try {
    return {
      fullName: "",
      email: reservation.email || "",
      phone: reservation.phone || "",
      preferredContact: "Email",
      licenceCountry: "United Kingdom",
      billingAddress: "",
      billingPostcode: "",
      preferredLocation: "",
      handoverType: "Concierge delivery",
      vehicleCategories: ["Super SUV", "Luxury SUV"],
      communication: ["Concierge updates"],
      files: {},
      cardSummary: "No saved card",
      cardName: "Add a preferred card for reservation holds.",
      membership: "Private client status",
      ...JSON.parse(window.localStorage.getItem(accountStorageKey)),
    };
  } catch {
    return {
      fullName: "",
      email: reservation.email || "",
      phone: reservation.phone || "",
      preferredContact: "Email",
      licenceCountry: "United Kingdom",
      billingAddress: "",
      billingPostcode: "",
      preferredLocation: "",
      handoverType: "Concierge delivery",
      vehicleCategories: ["Super SUV", "Luxury SUV"],
      communication: ["Concierge updates"],
      files: {},
      cardSummary: "No saved card",
      cardName: "Add a preferred card for reservation holds.",
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

function reusableDraftBooking(booking, reservation = loadReservation()) {
  if (!booking?.id) return null;
  const selectedVehicle = normaliseVehicleSlug(reservation.vehicle);
  const bookingVehicle = normaliseVehicleSlug(booking.vehicleSlug);
  const terminalStatuses = new Set(["confirmed", "completed", "cancelled", "rejected"]);
  const settledPaymentStatuses = new Set(["reservation_fee_paid", "deposit_paid", "rental_paid", "paid", "refunded"]);
  if (selectedVehicle && bookingVehicle && selectedVehicle !== bookingVehicle) return null;
  if (terminalStatuses.has(String(booking.status || ""))) return null;
  if (settledPaymentStatuses.has(String(booking.paymentStatus || ""))) return null;
  return booking;
}

function loadAdminToken() {
  try {
    return window.localStorage.getItem(adminTokenStorageKey) || "";
  } catch {
    return "";
  }
}

function saveAdminToken(token) {
  const clean = String(token || "").trim();
  if (!clean) {
    window.localStorage.removeItem(adminTokenStorageKey);
    return "";
  }
  window.localStorage.setItem(adminTokenStorageKey, clean);
  return clean;
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
  if (path.startsWith("/api/admin")) {
    const adminToken = loadAdminToken();
    if (adminToken) headers["x-velaire-admin-token"] = adminToken;
  }
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
    if (window.location.protocol !== "file:" && path.startsWith("/api/bookings")) throw error;
    if (window.location.protocol !== "file:" && path.startsWith("/api/payments")) throw error;
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
    },
    verification: {
      status: verificationStatus(account).toLowerCase().replace(/\s+/g, "_"),
      documents: account.files || {},
    },
    paymentMethod:
      account.cardSummary && account.cardSummary !== "No saved card"
        ? {
            label: account.cardSummary,
            name: account.cardName || "",
            expiry: account.cardExpiry || "",
            provider: "manual_masked_reference",
          }
        : null,
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

async function ensureBackendAccount({ email, password, phone }) {
  const cleanEmail = String(email || "").trim();
  if (!cleanEmail) return null;

  try {
    return await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: cleanEmail, password }),
    });
  } catch {
    return optionalApiRequest(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password,
          phone,
          profile: {
            preferredContact: "Email",
            licenceCountry: "United Kingdom",
          },
        }),
      },
      null,
    );
  }
}

async function syncBookingToBackend(status = "draft", { strict = false } = {}) {
  const reservation = loadReservation();
  const currentBooking = reusableDraftBooking(loadBackendBooking(), reservation);
  const path = "/api/bookings";
  const options = currentBooking?.id
    ? {
        method: "PATCH",
        body: JSON.stringify({
          id: currentBooking.id,
          patch: {
            reservation,
            status,
          },
        }),
      }
    : {
        method: "POST",
        body: JSON.stringify({ reservation, status }),
      };
  const result = strict ? await apiRequest(path, options) : await optionalApiRequest(path, options, null);
  if (result?.booking) {
    saveBackendBooking(result.booking);
    saveReservation({ bookingId: result.booking.id, reference: result.booking.reference });
  }
  return result?.booking || null;
}

async function createPaymentIntent() {
  const reservation = loadReservation();
  const booking = reusableDraftBooking(loadBackendBooking(), reservation) || (await syncBookingToBackend("payment_review", { strict: true }));
  const result = await apiRequest(
    "/api/payments/intent",
    {
      method: "POST",
      body: JSON.stringify({
        bookingId: booking?.id || reservation.bookingId || "",
        reservation,
      }),
    },
  );
  if (result?.paymentIntent) {
    saveReservation({
      paymentIntentId: result.paymentIntent.id,
      paymentStatus: result.paymentIntent.status,
      checkoutSessionId: result.checkoutSessionId || "",
      checkoutUrl: result.checkoutUrl || "",
    });
  }
  if (!result?.paymentIntent) {
    throw new Error("The reservation fee session could not be created. Please try again.");
  }
  if (!result.checkoutUrl) {
    throw new Error("Stripe Checkout did not return a secure payment link. Please try again.");
  }
  return {
    ...result.paymentIntent,
    checkoutUrl: result.checkoutUrl,
    checkoutSessionId: result.checkoutSessionId || "",
  };
}

async function checkAvailability() {
  const selectedVehicleSlug = resolveSelectedVehicleSlug({ preferUrl: false, preferChecked: true, preferStored: true });
  const reservation = saveReservation({ vehicle: selectedVehicleSlug });
  const target = document.querySelector("[data-availability-text]");
  if (!target) return null;

  if (!selectedVehicleSlug) {
    target.innerHTML = `<span aria-hidden="true"></span>Select a Velaire vehicle before checking availability.`;
    return { available: false, status: "vehicle_required" };
  }

  const result = await optionalApiRequest(
    `/api/availability?ts=${Date.now()}`,
    {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ ...reservation, vehicle: selectedVehicleSlug }),
    },
    null,
  );

  if (result?.message) {
    const vehicle = vehicles[result.vehicle] || vehicles[selectedVehicleSlug];
    if (vehicle) {
      if (Number.isFinite(Number(result.dailyRate))) vehicle.rate = Number(result.dailyRate);
      if (Number.isFinite(Number(result.deposit))) vehicle.deposit = Number(result.deposit);
      updateBookingVehicleCards();
      updateSummary();
    }
    target.innerHTML = `<span aria-hidden="true"></span>${result.message}`;
  }

  return result;
}

function navigateTo(action) {
  window.location.href = action || "/";
}

function selectedSlug() {
  if (page === "booking") {
    return resolveSelectedVehicleSlug({ preferUrl: false, preferChecked: true, preferStored: true }) || queryVehicleSlug();
  }
  return resolveSelectedVehicleSlug({ preferUrl: true, preferChecked: true, preferStored: true });
}

function selectedVehicle(slug = selectedSlug()) {
  const cleanSlug = normaliseVehicleSlug(slug) || resolveSelectedVehicleSlug({ preferUrl: true, preferChecked: true, preferStored: true });
  return vehicles[cleanSlug] || vehicles[firstBookableVehicleSlug()] || vehicles[defaultVehicle];
}

function exactGeneratedMediaFor(slug = "") {
  return generatedVehicleMedia[normaliseVehicleSlug(slug)] || null;
}

function mediaForVehicle(vehicle = {}) {
  const media = exactGeneratedMediaFor(vehicle.slug);
  return {
    visualClass: media?.visualClass || vehicle.visualClass,
    modelType: media?.modelType || vehicle.modelType || "saloon",
    modelPath: media?.modelPath || vehicle.modelPath || "",
    fallbackImagePath: media?.fallbackImagePath || vehicle.fallbackImagePath || "",
    modelAvailable: Boolean(media?.modelAvailable),
    viewerMode: media?.viewerMode || vehicle.viewerMode || "studio-3d-render",
    visualLabel: media?.visualLabel || vehicle.visualLabel || vehicle.name || "Velaire fleet vehicle",
  };
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

function vehiclePhotoMarkup(src = "", alt = "") {
  if (!src) return "";
  const localSrc = src.startsWith("/cars/") ? `public${src}` : src;
  return `<img class="vehicle-media-image" src="${escapeHtml(src)}" data-canonical-src="${escapeHtml(
    src,
  )}" data-local-src="${escapeHtml(localSrc)}" alt="${escapeHtml(
    alt,
  )}" loading="lazy" decoding="async" onerror="if(!this.dataset.triedLocal&&this.dataset.localSrc){this.dataset.triedLocal='true';this.src=this.dataset.localSrc}" />`;
}

function hydrateVehicleModels(root = document) {
  const nodes = root.matches?.("[data-vehicle-model]") ? [root] : [...root.querySelectorAll("[data-vehicle-model]")];
  nodes.forEach((node) => {
    const imagePath = node.dataset.fallbackImage || "";
    const label = node.getAttribute("aria-label") || "Velaire fleet vehicle";
    if (imagePath) {
      node.style.setProperty("--vehicle-card-image", `url("${imagePath}")`);
    }
    const existingImage = node.querySelector(".vehicle-media-image");
    if (imagePath && !existingImage) {
      node.insertAdjacentHTML("afterbegin", vehiclePhotoMarkup(imagePath, label));
    } else if (imagePath && existingImage?.dataset.canonicalSrc !== imagePath) {
      const localPath = imagePath.startsWith("/cars/") ? `public${imagePath}` : imagePath;
      existingImage.dataset.canonicalSrc = imagePath;
      existingImage.dataset.localSrc = localPath;
      existingImage.setAttribute("src", imagePath);
      existingImage.setAttribute("alt", label);
    }
    node.classList.toggle("has-photo", Boolean(imagePath));
    if (imagePath && !node.querySelector(".vehicle-media-backup")) {
      const backup = document.createElement("span");
      backup.className = "vehicle-media-backup";
      backup.setAttribute("aria-hidden", "true");
      node.appendChild(backup);
    }
    if (!node.querySelector(".vehicle-model-scene")) {
      node.insertAdjacentHTML("beforeend", vehicleModelMarkup());
    }
  });
}

function bindVehicleMedia(vehicle) {
  const media = mediaForVehicle(vehicle);
  document.querySelectorAll("[data-bind-vehicle-media]").forEach((node) => {
    Object.keys(vehicles).forEach((slug) => {
      node.classList.remove(`flow-vehicle-photo-${slug}`, `vehicle-model-${slug}`);
    });
    ["saloon", "suv", "convertible", "hatch"].forEach((type) => {
      node.classList.remove(`vehicle-model-${type}`);
    });
    node.classList.add(
      `flow-vehicle-photo-${media.visualClass}`,
      `vehicle-model-${media.visualClass}`,
      `vehicle-model-${media.modelType}`,
    );
    node.setAttribute("aria-label", `Premium vehicle image of ${media.visualLabel}`);
    node.dataset.modelPath = media.modelPath;
    node.dataset.fallbackImage = media.fallbackImagePath;
    node.dataset.modelStatus = media.modelAvailable ? "glb-active" : media.viewerMode;
    hydrateVehicleModels(node);
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
  const slug = selectedSlug();
  if (slug && reservation.vehicle !== slug) saveReservation({ vehicle: slug });
  const vehicle = selectedVehicle(slug);
  const days = Math.max(Number.parseInt(reservation.days || "2", 10), 1);
  const location = reservation.formattedAddress || reservation.location || "Delivery location pending";
  const pickupLine = [formatDisplayDate(reservation.pickup) || reservation.pickup, reservation.pickupTime].filter(Boolean).join(" at ") || "Pickup pending";
  const returnLine = [formatDisplayDate(reservation.return) || reservation.return, reservation.returnTime].filter(Boolean).join(" at ") || "Return pending";
  const paymentStatus = reservation.paymentStatus || (new URLSearchParams(window.location.search).get("session_id") ? "reservation_fee_paid" : "payment_pending");

  bindText("vehicleName", vehicle.name);
  bindText("vehicleShortName", vehicle.shortName);
  bindText("vehicleCategory", vehicle.category);
  bindText("vehicleFinish", vehicle.finish);
  bindText("vehiclePaint", vehicle.paint);
  bindText("vehicleInterior", vehicle.interior);
  bindText("vehicleDescription", vehicle.description);
  bindText("dailyRate", money(vehicle.rate));
  bindText("deposit", `${money(vehicle.deposit)} handled later`);
  bindText("depositValue", money(RESERVATION_FEE));
  bindText("reservationFee", money(RESERVATION_FEE));
  bindText("securityDeposit", `${money(vehicle.deposit)} handled later`);
  bindText("hireEstimate", money(vehicle.rate * days));
  bindText("rentalDays", displayDays(days));
  bindText("handoverLocation", location);
  bindText("reference", referenceFor(slug));
  bindText("pickupDate", pickupLine);
  bindText("returnDate", returnLine);
  bindText("paymentStatusDisplay", humanStatus(paymentStatus));
  bindText("customerName", reservation.name || reservation.fullName || "Guest client");
  bindText("customerEmail", reservation.email || "Email supplied at checkout");
  bindText("customerPhone", reservation.phone || "Phone supplied at checkout");
  bindText("billingAddress", [
    reservation.billingAddress1,
    reservation.billingAddress2,
    reservation.billingTown,
    reservation.billingCity,
    reservation.billingPostcode,
    reservation.billingCountry,
  ].filter(Boolean).join(", ") || "Billing details supplied");
  bindVehicleMedia(vehicle);
  updateSelectedLocationPanel(reservation);
}

function mergeFleetVehicle(vehicle = {}) {
  const current = vehicles[vehicle.slug];
  if (!current) return;
  const media = exactGeneratedMediaFor(current.slug);
  current.name = vehicle.name || current.name;
  current.shortName = vehicle.shortName || current.shortName || vehicle.name || current.name;
  current.category = vehicle.category || current.category;
  current.finish = vehicle.finish || current.finish;
  current.paint = vehicle.paint || current.paint;
  current.interior = vehicle.interior || current.interior;
  current.visualClass = media?.visualClass || current.visualClass;
  current.modelType = media?.modelType || current.modelType;
  current.modelPath = media?.modelPath || current.modelPath;
  current.fallbackImagePath = media?.fallbackImagePath || current.fallbackImagePath;
  current.modelAvailable = Boolean(media?.modelAvailable);
  current.viewerMode = media?.viewerMode || current.viewerMode || "studio-3d-render";
  current.visualLabel = media?.visualLabel || vehicle.visualLabel || vehicle.alt || current.visualLabel;
  current.rate = Number(vehicle.rate || current.rate);
  current.deposit = Number(vehicle.deposit || current.deposit);
  current.availability = vehicle.availability || current.availability || {};
}

function updateBookingVehicleCards() {
  document.querySelectorAll("[data-vehicle-card]").forEach((card) => {
    const input = card.querySelector('input[name="vehicle"]');
    const vehicle = vehicles[input?.value];
    if (!input || !vehicle) return;
    const name = card.querySelector(".choice-name");
    const detail = card.querySelector("small");
    const price = card.querySelector("strong");
    const isOffline = vehicle.availability?.status === "offline";
    if (name) name.textContent = vehicle.shortName || vehicle.name;
    if (detail) detail.textContent = isOffline ? "Temporarily unavailable" : vehicle.finish || vehicle.category;
    if (price) price.textContent = `${money(vehicle.rate)}/day`;
    const media = card.querySelector("[data-vehicle-model]");
    if (media) {
      const exactMedia = mediaForVehicle(vehicle);
      media.setAttribute("aria-label", `Premium vehicle image of ${exactMedia.visualLabel}`);
      media.dataset.modelPath = exactMedia.modelPath;
      media.dataset.fallbackImage = exactMedia.fallbackImagePath;
      media.dataset.modelStatus = exactMedia.modelAvailable ? "glb-active" : exactMedia.viewerMode;
      hydrateVehicleModels(media);
    }
    input.disabled = isOffline;
    card.classList.toggle("is-disabled", isOffline);
    card.setAttribute("aria-disabled", String(isOffline));
  });
}

async function hydrateFleetPricing() {
  const result = await optionalApiRequest(
    `/api/fleet?ts=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
    null,
  );
  (result?.fleet || []).forEach(mergeFleetVehicle);
  updateBookingVehicleCards();
  updateSummary();
  return result;
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

function rangeCoversIso(range = {}, isoDate = "") {
  const day = parseDate(isoDate);
  const start = parseDate(range.start || range.pickup);
  const end = parseDate(range.end || range.return);
  if (!day || !start || !end) return false;
  return day >= start && day < end;
}

function selectedVehicleAvailability() {
  return selectedVehicle().availability || {};
}

function dateIsSelectedVehicleBlocked(isoDate = "") {
  const availability = selectedVehicleAvailability();
  if (availability.status === "offline") return true;
  const ranges = [
    ...(availability.blockedRanges || []),
    ...(availability.pendingBookings || []),
    ...(availability.confirmedBookings || []),
  ];
  return ranges.some((range) => rangeCoversIso(range, isoDate));
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
      const isBlocked = dateIsSelectedVehicleBlocked(iso);
      const isDisabled = day < minDate || isBlocked;
      const isSelected = iso === selected;
      const isToday = iso === todayIso;
      return `
        <button
          class="calendar-day${isMuted ? " is-muted" : ""}${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}${
            isBlocked ? " is-blocked" : ""
          }"
          type="button"
          data-date="${iso}"
          title="${isBlocked ? "Unavailable through Velaire operations" : ""}"
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
  const vehicleSlug =
    normaliseVehicleSlug(data.get("vehicle")) ||
    checkedVehicleSlug() ||
    normaliseVehicleSlug(loadReservation().vehicle) ||
    resolveSelectedVehicleSlug({ preferUrl: false, preferChecked: true, preferStored: true });
  const pickup = data.get("pickup") || "";
  const returnDate = data.get("return") || "";
  const days = calculateDays(pickup, returnDate) || Number.parseInt(loadReservation().days || "2", 10) || 2;
  const formattedAddress = data.get("formatted-address") || "";
  const typedLocation = data.get("location") || "";

  return {
    vehicle: vehicleSlug,
    fullName: data.get("fullName") || data.get("name") || "",
    name: data.get("fullName") || data.get("name") || "",
    email: data.get("email") || "",
    phone: data.get("phone") || "",
    billingAddress1: data.get("billingAddress1") || "",
    billingAddress2: data.get("billingAddress2") || "",
    billingTown: data.get("billingTown") || "",
    billingCity: data.get("billingCity") || "",
    billingPostcode: data.get("billingPostcode") || "",
    billingCountry: data.get("billingCountry") || "United Kingdom",
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

function updateAccountDisplay(account = loadAccount()) {
  const displayName = account.fullName || "Velaire Client";
  const initials = accountInitials(displayName);

  ["client-avatar", "profile-avatar"].forEach((id) => {
    const avatar = document.getElementById(id);
    if (avatar) avatar.textContent = initials;
  });

  bindAccountText("displayName", displayName);
  bindAccountText("membership", account.membership || "Private client status");
  bindAccountText("upcomingCount", "1");
  bindAccountText("verificationStatus", verificationStatus(account));
  bindAccountText("cardSummary", account.cardSummary || "No saved card");
  bindAccountText("cardName", account.cardName || "Add a preferred card for reservation holds.");

  document.querySelectorAll("[data-file-label]").forEach((label) => {
    const key = label.dataset.fileLabel;
    label.textContent = account.files?.[key]?.name || fileLabelDefaults[key] || "Select file";
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
          <span>${booking.status || "draft"} · ${booking.location || "Handover pending"}</span>
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
    handoverType: user.preferences?.handoverType || loadAccount().handoverType || "Concierge delivery",
    vehicleCategories: user.preferences?.vehicleCategories || loadAccount().vehicleCategories || [],
    communication: user.preferences?.communication || loadAccount().communication || [],
    favourites: user.favourites || loadAccount().favourites || [],
    files: user.verification?.documents || loadAccount().files || {},
    cardSummary: user.paymentMethod?.label || loadAccount().cardSummary || "No saved card",
    cardName: user.paymentMethod?.name || loadAccount().cardName || "Add a preferred card for reservation holds.",
    cardExpiry: user.paymentMethod?.expiry || loadAccount().cardExpiry || "",
  });
  updateAccountDisplay(next);
  return next;
}

async function hydrateAccountFromBackend() {
  const result = await optionalApiRequest("/api/account", { method: "GET" }, null);
  if (!result) {
    renderBookingHistory([]);
    return;
  }
  mergeBackendAccount(result.user);
  renderBookingHistory(result.bookings || []);
}

function fillAccountForm(form, account = loadAccount()) {
  [...form.elements].forEach((field) => {
    if (!field.name || field.type === "file" || field.name === "cardNumber") return;

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
    if (!field.name || field.type === "file" || field.name === "cardNumber") return;

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

function maskCard(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "";
  return `Card ending ${digits.slice(-4)}`;
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

    if (form.dataset.accountForm !== "payment") {
      form.addEventListener("input", () => {
        updateAccountDisplay(saveAccount(readAccountForm(form)));
      });
      form.addEventListener("change", () => {
        updateAccountDisplay(saveAccount(readAccountForm(form)));
      });
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (form.dataset.accountForm === "payment") {
        const cardSummary = maskCard(form.elements.cardNumber?.value || "");
        const cardName = form.elements.cardName?.value || "Preferred card saved";
        const cardExpiry = form.elements.cardExpiry?.value || "";
        updateAccountDisplay(
          saveAccount({
            cardSummary: cardSummary || "No saved card",
            cardName,
            cardExpiry,
          }),
        );
        if (form.elements.cardNumber) form.elements.cardNumber.value = "";
      } else {
        updateAccountDisplay(saveAccount(readAccountForm(form)));
      }

      await syncAccountToBackend(loadAccount());
      pulseSaved(form.querySelector('button[type="submit"]'));
    });
  });

  document.querySelectorAll("[data-file-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const accountNext = loadAccount();
      updateAccountDisplay(
        saveAccount({
          files: {
            ...(accountNext.files || {}),
            [input.dataset.fileInput]: {
              name: file.name,
              type: file.type || "Selected document",
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      );
      syncAccountToBackend(loadAccount());
    });
  });

  document.getElementById("remove-card")?.addEventListener("click", () => {
    updateAccountDisplay(
      saveAccount({
        cardSummary: "No saved card",
        cardName: "Add a preferred card for reservation holds.",
        cardExpiry: "",
      }),
    );
    syncAccountToBackend(loadAccount());
  });

  document.querySelector("[data-logout]")?.addEventListener("click", async () => {
    await optionalApiRequest("/api/auth/logout", { method: "POST" }, null);
    showFlowToast("Signed out of the backend session. Local booking details remain on this device.");
  });

  updateAccountDisplay(account);
  hydrateAccountFromBackend();
  setupConciergeAssistant();
}

function setupBooking() {
  const form = document.querySelector("form");
  const requestedVehicle = queryVehicleSlug();
  let reservation = loadReservation();
  const slug = resolveSelectedVehicleSlug({ preferUrl: Boolean(requestedVehicle), preferChecked: false, preferStored: true });
  if (slug) reservation = saveSelectedVehicleSlug(slug);
  const radio = document.querySelector(`input[name="vehicle"][value="${slug}"]`);
  if (radio) radio.checked = true;
  if (slug) syncVehicleQueryParam(slug);

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
  setFieldValue(form, "fullName", reservation.fullName || reservation.name);
  setFieldValue(form, "email", reservation.email);
  setFieldValue(form, "phone", reservation.phone);
  setFieldValue(form, "billingAddress1", reservation.billingAddress1);
  setFieldValue(form, "billingAddress2", reservation.billingAddress2);
  setFieldValue(form, "billingTown", reservation.billingTown);
  setFieldValue(form, "billingCity", reservation.billingCity);
  setFieldValue(form, "billingPostcode", reservation.billingPostcode);
  setFieldValue(form, "billingCountry", reservation.billingCountry);

  function trackBookingStarted(source = "form_interaction") {
    const vehicle = selectedVehicle();
    trackVelaireEventOnce(`booking-started:${source}`, "Booking Started", {
      source,
      vehicle: vehicle.slug,
      dailyRate: vehicle.rate,
      reservationFee: RESERVATION_FEE,
      securityDeposit: vehicle.deposit,
    });
  }

  function refreshCards() {
    document.querySelectorAll("[data-vehicle-card]").forEach((card) => {
      const input = card.querySelector('input[name="vehicle"]');
      card.classList.toggle("is-selected", Boolean(input?.checked));
    });

    const checked = document.querySelector('input[name="vehicle"]:checked');
    if (checked) {
      saveReservation({ vehicle: checked.value });
      syncVehicleQueryParam(checked.value);
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
      const vehicle = selectedVehicle(input.value);
      trackBookingStarted("vehicle_selection");
      trackVelaireEvent("Car Selected", {
        source: "booking_page",
        vehicle: vehicle.slug,
        dailyRate: vehicle.rate,
        reservationFee: RESERVATION_FEE,
        securityDeposit: vehicle.deposit,
      });
    });
  });

  updateBookingVehicleCards();
  refreshCards();
  updateSummary();

  form?.addEventListener("input", () => {
    trackBookingStarted("form_interaction");
    persistDraft();
  });
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const draft = saveReservation(readBookingForm(form));
    try {
      trackVelaireEvent("Booking Form Submitted", {
        vehicle: draft.vehicle,
        days: Number.parseInt(draft.days || "1", 10) || 1,
        hasDeliveryLocation: Boolean(draft.formattedAddress || draft.location),
      });
      const availability = await checkAvailability();
      if (availability && availability.available === false) {
        trackVelaireEvent("Booking Availability Blocked", {
          vehicle: draft.vehicle,
          status: availability.status || "unavailable",
        });
        showFlowToast(availability.message || "That vehicle is unavailable for the selected dates.", "warning");
        return;
      }
      const booking = await syncBookingToBackend("draft", { strict: true });
      trackVelaireEvent("Guest Details Completed", {
        vehicle: draft.vehicle,
        days: Number.parseInt(draft.days || "1", 10) || 1,
        hasDeliveryLocation: Boolean(draft.formattedAddress || draft.location),
        bookingCreated: Boolean(booking?.id),
      });
      navigateTo(form.getAttribute("action") || "payment.html");
    } catch (error) {
      trackVelaireEvent("Booking Save Failed", {
        vehicle: draft.vehicle,
        status: error.status ? String(error.status) : "error",
      });
      showFlowToast(error.message || "Those reservation details could not be saved. Please adjust the selection.", "warning");
    }
  });

  hydrateFleetPricing().finally(() => {
    refreshCards();
    persistDraft();
  });
  setupElegantDatePicker(form);
  setupMapboxDeliveryPicker(form);
}

const adminHandoverChecklist = [
  {
    key: "licenceChecked",
    label: "Licence checked",
    text: "Driving licence and driver eligibility reviewed.",
  },
  {
    key: "insuranceChecked",
    label: "Insurance checked",
    text: "Hire conditions and cover requirements reviewed.",
  },
  {
    key: "depositConfirmed",
    label: "Security deposit confirmed",
    text: "Security deposit status verified by the team.",
  },
  {
    key: "rentalPaid",
    label: "Rental balance paid",
    text: "Daily rental balance or final hire charge confirmed.",
  },
  {
    key: "vehiclePrepared",
    label: "Vehicle prepared",
    text: "Clean, inspected and ready for concierge handover.",
  },
  {
    key: "customerContacted",
    label: "Customer contacted",
    text: "Final timing, address and expectations confirmed.",
  },
  {
    key: "handoverCompleted",
    label: "Handover completed",
    text: "Keys, condition check and release completed.",
  },
];

let adminState = { bookings: [], vehicles: [], customers: [], payments: [], notifications: [], auditLog: [], selectedBookingId: "" };
let adminFilters = { query: "", status: "all", payment: "all", followUp: "all", date: "", view: "all" };

function renderAdminCounts(counts = {}) {
  document.querySelectorAll("[data-admin-count]").forEach((node) => {
    node.textContent = String(counts[node.dataset.adminCount] || 0);
  });
}

function renderAdminVehicles(vehiclesList = []) {
  const target = document.querySelector("[data-admin-vehicles]");
  if (!target) return;
  if (!vehiclesList.length) {
    target.innerHTML = `<article class="admin-empty">No vehicle operations data found.</article>`;
    return;
  }
  target.innerHTML = vehiclesList
    .map((vehicle) => {
      const blocks = vehicle.availability?.blockedRanges || [];
      return `
        <article class="admin-vehicle-card">
          <div class="admin-card-heading">
            <div>
              <span class="eyebrow">${escapeHtml(vehicle.category || "Vehicle")}</span>
              <h3>${escapeHtml(vehicle.name)} ${escapeHtml(vehicle.year || "")}</h3>
            </div>
            <strong class="admin-rate-badge">${money(vehicle.rate)}/day</strong>
          </div>
          <div class="admin-vehicle-actions">
            <form class="admin-inline-form admin-pricing-form" data-admin-vehicle-form data-slug="${escapeHtml(vehicle.slug)}">
              <div class="admin-control-heading">
                <div>
                  <span>Tariff control</span>
                  <small>Updates the live daily rate and later deposit guidance.</small>
                </div>
              </div>
              <label class="field admin-field">Daily rate
                <input type="number" name="rate" min="0" value="${Number(vehicle.rate || 0)}" />
              </label>
              <label class="field admin-field">Deposit
                <input type="number" name="deposit" min="0" value="${Number(vehicle.deposit || 0)}" />
              </label>
              <label class="field admin-field">Status
                <select name="availabilityStatus">
                  <option value="request-to-confirm" ${vehicle.availability?.status !== "offline" ? "selected" : ""}>Active</option>
                  <option value="offline" ${vehicle.availability?.status === "offline" ? "selected" : ""}>Offline</option>
                </select>
              </label>
              <button class="primary-button admin-submit" type="submit">Save changes</button>
            </form>
            <form class="admin-inline-form admin-block-form" data-admin-block-form data-slug="${escapeHtml(vehicle.slug)}">
              <div class="admin-control-heading">
                <div>
                  <span>Availability hold</span>
                  <small>Block customer reservations for service, detailing or owner holds.</small>
                </div>
              </div>
              <label class="field admin-field">Block from
                <input type="date" name="start" required />
              </label>
              <label class="field admin-field">Block until
                <input type="date" name="end" required />
              </label>
              <label class="field admin-field">Reason
                <input name="reason" placeholder="Service, detailing, owner hold" />
              </label>
              <button class="secondary-button admin-submit admin-block-submit" type="submit">Block dates</button>
            </form>
          </div>
          <div class="admin-block-list" aria-label="Blocked dates for ${escapeHtml(vehicle.name)}">
            ${
              blocks.length
                ? blocks
                    .map(
                      (block) => `
                        <div class="admin-block-chip">
                          <span class="admin-block-copy">
                            <strong>${escapeHtml(block.start)} to ${escapeHtml(block.end)}</strong>
                            <small>${escapeHtml(block.reason || "Operations block")}</small>
                          </span>
                          <button class="admin-remove-block" type="button" data-admin-remove-block data-slug="${escapeHtml(vehicle.slug)}" data-block-id="${escapeHtml(block.id)}">Remove</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<div class="admin-block-empty">No blocked dates currently.</div>`
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function adminDateOnly(value = "") {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function adminBookingCoversDate(booking = {}, dateValue = "") {
  if (!dateValue) return true;
  const selected = adminDateOnly(dateValue);
  if (!selected) return true;
  const pickup = adminDateOnly(booking.pickup);
  const returnDate = adminDateOnly(booking.return || booking.pickup);
  if (!pickup) return false;
  const end = returnDate && returnDate >= pickup ? returnDate : pickup;
  return selected >= pickup && selected <= end;
}

function isUpcomingAdminBooking(booking = {}, days = 7) {
  const pickup = adminDateOnly(booking.pickup);
  if (!pickup) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  return pickup >= today && pickup <= limit && !["cancelled", "completed", "rejected"].includes(String(booking.status || "").toLowerCase());
}

function bookingMatchesAdminFilters(booking = {}) {
  const query = adminFilters.query.trim().toLowerCase();
  const haystack = [
    booking.reference,
    booking.customerName,
    booking.customerEmail,
    booking.customerPhone,
    booking.vehicleName,
    booking.vehicleSlug,
    booking.location,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (query && !haystack.includes(query)) return false;
  if (adminFilters.status !== "all" && String(booking.status || "") !== adminFilters.status) return false;
  if (adminFilters.payment !== "all" && String(booking.paymentStatus || "") !== adminFilters.payment) return false;
  if (adminFilters.followUp !== "all" && String(booking.followUpStatus || "new") !== adminFilters.followUp) return false;
  if (adminFilters.view === "needs_reply" && String(booking.followUpStatus || "new") !== "needs_reply") return false;
  if (adminFilters.view === "reminders" && !isUpcomingAdminBooking(booking, 7)) return false;
  if (!adminBookingCoversDate(booking, adminFilters.date)) return false;
  return true;
}

function filteredAdminBookings() {
  return adminState.bookings.filter(bookingMatchesAdminFilters);
}

function updateAdminFilterSummary(count = 0) {
  const target = document.querySelector("[data-admin-booking-filter-summary]");
  if (!target) return;
  const total = adminState.bookings.length;
  const active = [
    adminFilters.query ? "search" : "",
    adminFilters.status !== "all" ? humanStatus(adminFilters.status) : "",
    adminFilters.payment !== "all" ? humanStatus(adminFilters.payment) : "",
    adminFilters.followUp !== "all" ? humanStatus(adminFilters.followUp) : "",
    adminFilters.date ? `date ${adminFilters.date}` : "",
    adminFilters.view !== "all" ? humanStatus(adminFilters.view) : "",
  ].filter(Boolean);
  target.textContent = active.length
    ? `${count} of ${total} bookings shown · ${active.join(" · ")}`
    : `${total} bookings shown · use filters to move faster.`;
}

function syncAdminFilterInputs() {
  document.querySelectorAll("[data-admin-filter]").forEach((field) => {
    const key = field.dataset.adminFilter;
    if (key in adminFilters) field.value = adminFilters[key];
  });
}

function rerenderAdminBookingViews() {
  renderAdminReminders(adminState.bookings);
  renderAdminBookings(filteredAdminBookings());
}

function handleAdminFilterInput(event) {
  const field = event.target.closest("[data-admin-filter]");
  if (!field) return;
  const key = field.dataset.adminFilter;
  if (!(key in adminFilters)) return;
  adminFilters[key] = field.value || (field.tagName === "SELECT" ? "all" : "");
  adminFilters.view = "all";
  rerenderAdminBookingViews();
}

function renderAdminManualVehicleOptions() {
  const select = document.querySelector("[data-admin-manual-vehicle]");
  if (!select) return;
  const current = select.value;
  select.innerHTML = [
    `<option value="">Select vehicle</option>`,
    ...adminState.vehicles.map(
      (vehicle) => `<option value="${escapeHtml(vehicle.slug)}">${escapeHtml(vehicle.name)} ${escapeHtml(vehicle.year || "")} · ${money(Number(vehicle.rate || 0))}/day</option>`,
    ),
  ].join("");
  if (current && adminState.vehicles.some((vehicle) => vehicle.slug === current)) select.value = current;
}

function renderAdminReminders(bookings = adminState.bookings) {
  const target = document.querySelector("[data-admin-reminders]");
  if (!target) return;
  const reminders = bookings
    .filter((booking) => String(booking.followUpStatus || "new") === "needs_reply" || isUpcomingAdminBooking(booking, 7) || String(booking.paymentStatus || "") === "payment_pending")
    .slice(0, 6);
  if (!reminders.length) {
    target.innerHTML = `<article class="admin-empty">No urgent follow-ups. New handovers and customer replies will appear here.</article>`;
    return;
  }
  target.innerHTML = reminders
    .map((booking) => {
      const reasons = [
        String(booking.followUpStatus || "new") === "needs_reply" ? "Needs reply" : "",
        isUpcomingAdminBooking(booking, 7) ? "Handover soon" : "",
        String(booking.paymentStatus || "") === "payment_pending" ? "Reservation fee pending" : "",
      ].filter(Boolean);
      return `
        <article class="admin-record-card admin-reminder-card">
          <div>
            <span class="admin-record-kicker">${escapeHtml(reasons.join(" · ") || "Follow-up")}</span>
            <strong>${escapeHtml(booking.reference || booking.id || "Velaire booking")}</strong>
            <small>${escapeHtml(booking.customerName || "Guest client")} · ${escapeHtml(booking.vehicleName || booking.vehicleSlug || "Vehicle")} · ${escapeHtml(bookingDateLine(booking))}</small>
          </div>
          <button type="button" data-admin-open-booking data-booking-id="${escapeHtml(booking.id)}">View</button>
        </article>
      `;
    })
    .join("");
}

function renderAdminBookings(bookings = []) {
  const target = document.querySelector("[data-admin-bookings]");
  if (!target) return;
  updateAdminFilterSummary(bookings.length);
  if (!bookings.length) {
    target.innerHTML = `<article class="admin-empty">No bookings match this view. Clear the filters or create a manual reservation.</article>`;
    return;
  }
  target.innerHTML = bookings
    .map(
      (booking) => `
        <article class="admin-record-card admin-booking-card" data-admin-booking-card data-booking-id="${escapeHtml(booking.id)}" tabindex="0" role="button" aria-label="Open booking ${escapeHtml(booking.reference || booking.id)}">
          <div class="admin-booking-client">
            <span class="admin-record-kicker">Client</span>
            <strong>${escapeHtml(booking.customerName || "Guest client")}</strong>
            <span>${escapeHtml(booking.customerEmail || "No email")} · ${escapeHtml(booking.customerPhone || "No phone")}</span>
          </div>
          <div class="admin-booking-vehicle">
            <span class="admin-record-kicker">Reservation</span>
            <strong>${escapeHtml(booking.vehicleName || booking.vehicleSlug)}</strong>
            <span>${escapeHtml(booking.pickup || "Pickup pending")} to ${escapeHtml(booking.return || "Return pending")}</span>
          </div>
          <div class="admin-booking-statuses" aria-label="Booking status">
            ${statusPill(booking.status)}
            ${statusPill(booking.paymentStatus)}
            ${statusPill(booking.followUpStatus || "new", "follow-up-pill")}
          </div>
          <div class="admin-action-row">
            <button type="button" data-admin-open-booking data-booking-id="${escapeHtml(booking.id)}">View</button>
            <button type="button" data-admin-booking-action="approve" data-booking-id="${escapeHtml(booking.id)}">Approve</button>
            <button type="button" data-admin-booking-action="reject" data-booking-id="${escapeHtml(booking.id)}">Reject</button>
            <button type="button" data-admin-booking-action="cancel" data-booking-id="${escapeHtml(booking.id)}">Cancel</button>
            <button type="button" data-admin-booking-action="complete" data-booking-id="${escapeHtml(booking.id)}">Complete</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function csvCell(value = "") {
  const clean = String(value ?? "").replace(/\r?\n/g, " ").trim();
  return `"${clean.replace(/"/g, '""')}"`;
}

function exportAdminBookingsCsv() {
  if (!adminState.bookings.length) {
    showFlowToast("No bookings available to export yet.", "warning");
    return;
  }
  const headers = [
    "Reference",
    "Customer",
    "Email",
    "Phone",
    "Vehicle",
    "Pickup",
    "Return",
    "Handover",
    "Booking status",
    "Payment status",
    "Follow-up",
    "Reservation fee",
    "Security deposit",
    "Hire estimate",
  ];
  const rows = adminState.bookings.map((booking) => {
    const totals = booking.totals || {};
    return [
      booking.reference || booking.id,
      booking.customerName || "Guest client",
      booking.customerEmail || "",
      booking.customerPhone || "",
      booking.vehicleName || booking.vehicleSlug || "",
      [booking.pickup, booking.pickupTime].filter(Boolean).join(" "),
      [booking.return, booking.returnTime].filter(Boolean).join(" "),
      booking.location || "",
      humanStatus(booking.status || "pending"),
      humanStatus(booking.paymentStatus || "payment_pending"),
      humanStatus(booking.followUpStatus || "new"),
      totals.reservationFee || RESERVATION_FEE,
      totals.deposit || "",
      totals.hireEstimate || "",
    ];
  });
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `velaire-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  const blobUrl = link.href;
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
  showFlowToast("Bookings export prepared.", "success");
  trackVelaireEvent("Admin Bookings Exported", { count: adminState.bookings.length });
}

function downloadCsv(filename, headers = [], rows = []) {
  if (!rows.length) {
    showFlowToast("No records available to export yet.", "warning");
    return;
  }
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  const blobUrl = link.href;
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 500);
}

function exportAdminCustomersCsv() {
  const rows = adminState.customers.map((customer) => [
    customer.fullName || "Guest client",
    customer.email || "",
    customer.phone || "",
    customer.totalBookings || 0,
    customer.upcomingBookings || 0,
    customer.completedBookings || 0,
    customer.hireValue || 0,
    customer.lastVehicle || "",
    customer.lastStatus || "",
  ]);
  downloadCsv(`velaire-customers-${new Date().toISOString().slice(0, 10)}.csv`, [
    "Name",
    "Email",
    "Phone",
    "Total bookings",
    "Upcoming",
    "Completed",
    "Hire value",
    "Last vehicle",
    "Last status",
  ], rows);
  if (rows.length) {
    showFlowToast("Customers export prepared.", "success");
    trackVelaireEvent("Admin Customers Exported", { count: rows.length });
  }
}

function exportAdminPaymentsCsv() {
  const rows = adminState.payments.map((payment) => [
    payment.bookingReference || payment.bookingId || "",
    payment.customerName || "",
    payment.customerEmail || "",
    payment.vehicleName || "",
    payment.amount || 0,
    payment.currency || "GBP",
    humanStatus(payment.status || "payment_pending"),
    payment.provider || "",
    payment.providerReference || payment.stripePaymentIntentId || "",
    payment.createdAt || "",
  ]);
  downloadCsv(`velaire-payments-${new Date().toISOString().slice(0, 10)}.csv`, [
    "Booking",
    "Customer",
    "Email",
    "Vehicle",
    "Amount",
    "Currency",
    "Status",
    "Provider",
    "Provider reference",
    "Created",
  ], rows);
  if (rows.length) {
    showFlowToast("Payments export prepared.", "success");
    trackVelaireEvent("Admin Payments Exported", { count: rows.length });
  }
}

function bookingPaymentRecord(booking = {}) {
  return (
    adminState.payments.find((payment) => payment.bookingId === booking.id) ||
    adminState.payments.find((payment) => payment.id && payment.id === booking.paymentIntentId) ||
    adminState.payments.find((payment) => payment.bookingReference && payment.bookingReference === booking.reference) ||
    null
  );
}

function displayValue(value, fallback = "Not supplied") {
  const clean = String(value || "").trim();
  return clean ? escapeHtml(clean) : fallback;
}

function bookingDateLine(booking = {}) {
  const pickup = [formatDisplayDate(booking.pickup) || booking.pickup, booking.pickupTime].filter(Boolean).join(" at ");
  const returnDate = [formatDisplayDate(booking.return) || booking.return, booking.returnTime].filter(Boolean).join(" at ");
  return `${pickup || "Pickup pending"} to ${returnDate || "Return pending"}`;
}

function bookingAddressLine(booking = {}) {
  return [
    booking.billingAddress1,
    booking.billingAddress2,
    booking.billingTown,
    booking.billingCity,
    booking.billingPostcode,
    booking.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");
}

function bookingReceiptRows(booking = {}, payment = null) {
  const totals = booking.totals || {};
  return [
    ["Reference", booking.reference || booking.id || "Velaire reservation"],
    ["Client", booking.customerName || "Guest client"],
    ["Email", booking.customerEmail || "Not supplied"],
    ["Phone", booking.customerPhone || "Not supplied"],
    ["Vehicle", booking.vehicleName || booking.vehicleSlug || "Selected Velaire vehicle"],
    ["Dates", bookingDateLine(booking)],
    ["Handover", booking.location || "Concierge handover to be confirmed"],
    ["Booking status", humanStatus(booking.status || "pending")],
    ["Payment status", humanStatus(payment?.status || booking.paymentStatus || "payment_pending")],
    ["Reservation fee", payment?.amount ? money(Number(payment.amount)) : money(Number(totals.reservationFee || RESERVATION_FEE))],
    ["Security deposit", totals.deposit ? `${money(Number(totals.deposit))} handled later` : "Handled later"],
    ["Hire estimate", totals.hireEstimate ? `${money(Number(totals.hireEstimate))} handled later` : "To be confirmed"],
    ["Billing", bookingAddressLine(booking) || "Not supplied"],
  ];
}

function printableReceiptHtml(booking = {}, payment = null, { title = "Booking summary", subtitle = "Velaire Cars" } = {}) {
  const rows = bookingReceiptRows(booking, payment)
    .map(
      ([label, value]) => `
        <div class="print-receipt-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `,
    )
    .join("");
  return `
    <section class="print-receipt">
      <div class="print-receipt-brand">
        <span>V</span>
        <div>
          <strong>Velaire Cars</strong>
          <small>Concierge handover, depart with class</small>
        </div>
      </div>
      <div class="print-receipt-heading">
        <p>${escapeHtml(subtitle)}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      <div class="print-receipt-grid">
        ${rows}
      </div>
      <p class="print-receipt-note">
        This summary confirms the reservation details held by Velaire Cars at the time of printing. Final handover,
        driver checks and any remaining balance are confirmed privately by the concierge team.
      </p>
    </section>
  `;
}

function printReceipt(booking = {}, payment = null, options = {}) {
  let root = document.querySelector("[data-print-receipt-root]");
  if (!root) {
    root = document.createElement("div");
    root.className = "print-receipt-root";
    root.dataset.printReceiptRoot = "true";
    document.body.appendChild(root);
  }
  root.innerHTML = printableReceiptHtml(booking, payment, options);
  document.body.classList.add("print-receipt-active");
  window.setTimeout(() => {
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("print-receipt-active");
    }, 400);
  }, 80);
}

function adminDetailRow(label, value) {
  return `
    <div class="admin-detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${displayValue(value)}</strong>
    </div>
  `;
}

function adminTimelineItems(booking = {}) {
  const timeline = Array.isArray(booking.timeline) ? booking.timeline : [];
  if (!timeline.length) {
    return `<li><span></span><p>No timeline events yet.</p></li>`;
  }
  return timeline
    .slice()
    .reverse()
    .map(
      (item) => `
        <li>
          <span></span>
          <p>
            <strong>${escapeHtml(item.label || "Booking update")}</strong>
            <small>${escapeHtml(item.at ? new Date(item.at).toLocaleString("en-GB") : "")}</small>
          </p>
        </li>
      `,
    )
    .join("");
}

function adminChecklistMarkup(booking = {}) {
  const checklist = booking.operationsChecklist || {};
  return adminHandoverChecklist
    .map(
      (item) => `
        <label class="admin-checklist-item">
          <input type="checkbox" name="${escapeHtml(item.key)}" ${checklist[item.key] ? "checked" : ""} />
          <span>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.text)}</small>
          </span>
        </label>
      `,
    )
    .join("");
}

function ensureAdminBookingDrawer() {
  let drawer = document.querySelector("[data-admin-booking-drawer]");
  if (drawer) return drawer;
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="admin-drawer" data-admin-booking-drawer hidden>
        <button class="admin-drawer-backdrop" type="button" data-admin-close-booking aria-label="Close booking detail"></button>
        <aside class="admin-drawer-panel" aria-label="Booking detail" aria-modal="true" role="dialog">
          <div data-admin-booking-detail></div>
        </aside>
      </div>
    `,
  );
  return document.querySelector("[data-admin-booking-drawer]");
}

function renderAdminBookingDetail(bookingId = adminState.selectedBookingId) {
  const drawer = ensureAdminBookingDrawer();
  const target = drawer?.querySelector("[data-admin-booking-detail]");
  if (!drawer || !target) return;
  const booking = adminState.bookings.find((item) => item.id === bookingId);
  if (!booking) {
    drawer.hidden = true;
    document.body.classList.remove("admin-drawer-open");
    adminState.selectedBookingId = "";
    return;
  }
  const payment = bookingPaymentRecord(booking);
  const totals = booking.totals || {};
  const billingAddress = bookingAddressLine(booking);
  adminState.selectedBookingId = booking.id;
  target.innerHTML = `
    <div class="admin-drawer-header">
      <div>
        <p class="eyebrow">Booking detail</p>
        <h2>${escapeHtml(booking.reference || "Velaire reservation")}</h2>
        <span>${escapeHtml(booking.vehicleName || booking.vehicleSlug || "Vehicle pending")}</span>
      </div>
      <button class="admin-drawer-close" type="button" data-admin-close-booking aria-label="Close booking detail">Close</button>
    </div>

    <div class="admin-detail-status-row">
      ${statusPill(booking.status)}
      ${statusPill(booking.paymentStatus)}
      ${statusPill(booking.followUpStatus || "new", "follow-up-pill")}
    </div>

    <div class="admin-detail-grid">
      <section class="admin-detail-card">
        <p class="admin-record-kicker">Client</p>
        ${adminDetailRow("Name", booking.customerName || "Guest client")}
        ${adminDetailRow("Email", booking.customerEmail)}
        ${adminDetailRow("Phone", booking.customerPhone)}
      </section>

      <section class="admin-detail-card">
        <p class="admin-record-kicker">Reservation</p>
        ${adminDetailRow("Vehicle", booking.vehicleName || booking.vehicleSlug)}
        ${adminDetailRow("Dates", bookingDateLine(booking))}
        ${adminDetailRow("Reservation fee", money(Number(totals.reservationFee || RESERVATION_FEE)))}
        ${adminDetailRow("Hire estimate", totals.hireEstimate ? `${money(Number(totals.hireEstimate))} handled later` : "")}
        ${adminDetailRow("Security deposit", totals.deposit ? `${money(Number(totals.deposit))} handled later` : "")}
      </section>

      <section class="admin-detail-card admin-detail-card-wide">
        <p class="admin-record-kicker">Handover</p>
        ${adminDetailRow("Location", booking.location)}
        ${adminDetailRow("Coordinates", booking.lat && booking.lng ? `${booking.lat}, ${booking.lng}` : "")}
        ${adminDetailRow("Notes", booking.handoverNotes)}
      </section>

      <section class="admin-detail-card">
        <p class="admin-record-kicker">Billing</p>
        ${adminDetailRow("Address", billingAddress)}
        ${adminDetailRow("Postcode", booking.billingPostcode)}
        ${adminDetailRow("Country", booking.billingCountry)}
      </section>

      <section class="admin-detail-card">
        <p class="admin-record-kicker">Payment</p>
        ${adminDetailRow("Status", payment?.status || booking.paymentStatus)}
        ${adminDetailRow("Amount", payment?.amount ? money(Number(payment.amount)) : money(Number(totals.reservationFee || RESERVATION_FEE)))}
        ${adminDetailRow("Provider", payment?.provider || "Stripe reservation fee")}
        ${adminDetailRow("Reference", payment?.providerReference || payment?.stripePaymentIntentId || payment?.id || booking.paymentIntentId)}
      </section>
    </div>

    <section class="admin-detail-card admin-detail-card-wide">
      <p class="admin-record-kicker">Operations follow-up</p>
      <form class="admin-detail-form" data-admin-booking-followup-form data-booking-id="${escapeHtml(booking.id)}">
        <label class="field">Follow-up status
          <select name="followUpStatus">
            ${["new", "needs_reply", "customer_contacted", "driver_checks", "handover_confirmed", "ready", "handover_completed"].map(
              (status) => `<option value="${status}" ${String(booking.followUpStatus || "new") === status ? "selected" : ""}>${humanStatus(status)}</option>`,
            ).join("")}
          </select>
        </label>
        <label class="field">Internal notes
          <textarea name="internalNotes" rows="5" placeholder="Add driver checks, customer preferences, handover prep or team notes.">${escapeHtml(booking.internalNotes || "")}</textarea>
        </label>
        <button type="submit">Save follow-up</button>
      </form>
    </section>

    <section class="admin-detail-card admin-detail-card-wide admin-checklist-card">
      <p class="admin-record-kicker">Staff handover checklist</p>
      <form class="admin-detail-form admin-checklist-form" data-admin-booking-checklist-form data-booking-id="${escapeHtml(booking.id)}">
        <div class="admin-checklist-grid">
          ${adminChecklistMarkup(booking)}
        </div>
        <button type="submit">Save checklist</button>
      </form>
    </section>

    <section class="admin-detail-card admin-detail-card-wide">
      <p class="admin-record-kicker">Timeline</p>
      <ol class="admin-detail-timeline">
        ${adminTimelineItems(booking)}
      </ol>
    </section>

    <div class="admin-detail-actions">
      <button type="button" data-admin-print-booking data-booking-id="${escapeHtml(booking.id)}">Print summary</button>
      <button type="button" data-admin-booking-action="approve" data-booking-id="${escapeHtml(booking.id)}">Approve booking</button>
      <button type="button" data-admin-booking-action="reject" data-booking-id="${escapeHtml(booking.id)}">Reject booking</button>
      <button type="button" data-admin-booking-action="cancel" data-booking-id="${escapeHtml(booking.id)}">Cancel booking</button>
      <button type="button" data-admin-booking-action="complete" data-booking-id="${escapeHtml(booking.id)}">Mark complete</button>
      <button type="button" data-admin-booking-action="deposit_paid" data-booking-id="${escapeHtml(booking.id)}">Deposit paid</button>
      <button type="button" data-admin-booking-action="rental_paid" data-booking-id="${escapeHtml(booking.id)}">Rental paid</button>
      <button type="button" data-admin-booking-action="refund_pending" data-booking-id="${escapeHtml(booking.id)}">Refund pending</button>
      <button type="button" data-admin-booking-action="refunded" data-booking-id="${escapeHtml(booking.id)}">Mark refunded</button>
      <button type="button" data-admin-booking-action="customer_contacted" data-booking-id="${escapeHtml(booking.id)}">Customer contacted</button>
      <button type="button" data-admin-booking-action="customer_not_contacted" data-booking-id="${escapeHtml(booking.id)}">Needs reply</button>
    </div>

    <section class="admin-detail-card admin-detail-card-wide admin-email-actions-card">
      <p class="admin-record-kicker">Client communication</p>
      <p>Send polished Velaire emails directly from Operations. Attempts are logged in notification history.</p>
      <div class="admin-email-actions">
        <button type="button" data-admin-email-kind="confirmation" data-booking-id="${escapeHtml(booking.id)}">Resend confirmation</button>
        <button type="button" data-admin-email-kind="deposit_receipt" data-booking-id="${escapeHtml(booking.id)}">Send payment receipt</button>
        <button type="button" data-admin-email-kind="status_update" data-booking-id="${escapeHtml(booking.id)}">Send status update</button>
      </div>
    </section>
  `;
}

function openAdminBookingDetail(bookingId) {
  const drawer = ensureAdminBookingDrawer();
  adminState.selectedBookingId = bookingId;
  renderAdminBookingDetail(bookingId);
  drawer.hidden = false;
  document.body.classList.add("admin-drawer-open");
  trackVelaireEvent("Admin Booking Detail Opened", {
    hasBooking: Boolean(bookingId),
  });
}

function closeAdminBookingDetail() {
  const drawer = document.querySelector("[data-admin-booking-drawer]");
  if (drawer) drawer.hidden = true;
  document.body.classList.remove("admin-drawer-open");
  adminState.selectedBookingId = "";
}

function renderAdminCustomers(customers = []) {
  const target = document.querySelector("[data-admin-customers]");
  if (!target) return;
  target.innerHTML = customers.length
    ? customers
        .map(
          (customer) => {
            const email = String(customer.email || "").trim();
            const phone = String(customer.phone || "").trim();
            const tel = phone.replace(/[^\d+]/g, "");
            return `
            <article class="admin-record-card admin-customer-card">
              <strong>${escapeHtml(customer.fullName || "Guest client")}</strong>
              <span>${escapeHtml(email || "No email")} · ${escapeHtml(phone || "No phone")}</span>
              <span>${Number(customer.totalBookings || 0)} bookings · ${money(Number(customer.hireValue || 0))} hire value</span>
              <div class="admin-contact-actions">
                ${email ? `<a href="mailto:${escapeHtml(email)}">Email</a>` : ""}
                ${tel ? `<a href="tel:${escapeHtml(tel)}">Call</a>` : ""}
              </div>
            </article>
          `;
          },
        )
        .join("")
    : `<article class="admin-empty">No customer records yet.</article>`;
}

function renderAdminPayments(payments = []) {
  const target = document.querySelector("[data-admin-payments]");
  if (!target) return;
  target.innerHTML = payments.length
    ? payments
        .map(
          (payment) => `
            <article class="admin-record-card admin-payment-card">
              <strong>${escapeHtml(payment.bookingReference || payment.bookingId || "Reservation fee record")}</strong>
              <span>${escapeHtml(payment.vehicleName || "")} · ${escapeHtml(payment.customerEmail || "")}</span>
              <span>${money(Number(payment.amount || 0))}</span>
              ${statusPill(payment.status)}
            </article>
          `,
        )
        .join("")
    : `<article class="admin-empty">No payment records yet.</article>`;
}

function renderAdminAuditLog(events = []) {
  const target = document.querySelector("[data-admin-audit-log]");
  if (!target) return;
  target.innerHTML = events.length
    ? events
        .slice(0, 40)
        .map(
          (event) => `
            <article class="admin-record-card admin-audit-card">
              <div>
                <span class="admin-record-kicker">${escapeHtml(event.actor || "Operations")}</span>
                <strong>${escapeHtml(event.label || "Operations update")}</strong>
                <span>${escapeHtml(event.details || event.reference || "No detail supplied")}</span>
              </div>
              <div class="admin-audit-meta">
                <span>${escapeHtml(event.reference || event.entityId || "")}</span>
                <small>${escapeHtml(event.createdAt ? new Date(event.createdAt).toLocaleString("en-GB") : "")}</small>
              </div>
            </article>
          `,
        )
        .join("")
    : `<article class="admin-empty">No audit events yet. Price edits, blocked dates, booking decisions and checklist updates will appear here.</article>`;
}

async function refreshAdmin() {
  const result = await apiRequest("/api/admin/summary", { method: "GET" });
  const summary = result.summary || {};
  adminState = {
    bookings: summary.bookings || [],
    vehicles: summary.vehicles || [],
    customers: summary.customers || [],
    payments: summary.payments || [],
    notifications: summary.notifications || [],
    auditLog: summary.auditLog || [],
    selectedBookingId: adminState.selectedBookingId || "",
  };
  renderAdminCounts(summary.counts || {});
  renderAdminVehicles(adminState.vehicles);
  renderAdminManualVehicleOptions();
  renderAdminReminders(adminState.bookings);
  renderAdminBookings(filteredAdminBookings());
  renderAdminCustomers(adminState.customers);
  renderAdminPayments(adminState.payments);
  renderAdminAuditLog(adminState.auditLog);
  if (adminState.selectedBookingId) renderAdminBookingDetail(adminState.selectedBookingId);
  const status = document.querySelector("[data-admin-status]");
  if (status) status.textContent = summary.meta?.available ? "Connected to Vercel KV operations storage." : "Using memory fallback. Check KV_REST_API_URL and KV_REST_API_TOKEN.";
}

function setupAdmin() {
  const tokenForm = document.querySelector("[data-admin-token-form]");
  const tokenInput = document.querySelector("[data-admin-token-input]");
  if (tokenInput) tokenInput.value = loadAdminToken();

  tokenForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveAdminToken(new FormData(tokenForm).get("adminToken"));
    await refreshAdmin().catch((error) => showFlowToast(error.message || "Operations portal could not be loaded.", "warning"));
  });

  document.addEventListener("submit", async (event) => {
    const vehicleForm = event.target.closest("[data-admin-vehicle-form]");
    const blockForm = event.target.closest("[data-admin-block-form]");
    const followupForm = event.target.closest("[data-admin-booking-followup-form]");
    const checklistForm = event.target.closest("[data-admin-booking-checklist-form]");
    const manualBookingForm = event.target.closest("[data-admin-manual-booking-form]");
    if (!vehicleForm && !blockForm && !followupForm && !checklistForm && !manualBookingForm) return;
    event.preventDefault();
    const data = new FormData(event.target);
    const slug = event.target.dataset.slug;
    if (manualBookingForm) {
      await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          status: "pending",
          reservation: {
            fullName: data.get("name") || "",
            name: data.get("name") || "",
            email: data.get("email") || "",
            phone: data.get("phone") || "",
            vehicle: data.get("vehicle") || "",
            pickup: data.get("pickup") || "",
            return: data.get("return") || "",
            pickupTime: data.get("pickupTime") || "",
            returnTime: data.get("returnTime") || "",
            formattedAddress: data.get("location") || "",
            location: data.get("location") || "",
            handoverNotes: data.get("handoverNotes") || "",
          },
        }),
      });
      trackVelaireEvent("Admin Manual Booking Created", {
        hasBooking: true,
      });
      showFlowToast("Manual booking created for concierge review.");
      manualBookingForm.reset();
      await refreshAdmin();
      return;
    }
    if (followupForm) {
      await apiRequest("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({
          id: followupForm.dataset.bookingId,
          patch: {
            followUpStatus: data.get("followUpStatus") || "new",
            internalNotes: data.get("internalNotes") || "",
          },
        }),
      });
      trackVelaireEvent("Admin Follow Up Updated", {
        followUpStatus: String(data.get("followUpStatus") || "new"),
      });
      showFlowToast("Booking follow-up saved.");
      await refreshAdmin();
      return;
    }
    if (checklistForm) {
      const operationsChecklist = Object.fromEntries(
        adminHandoverChecklist.map((item) => [item.key, data.get(item.key) === "on"]),
      );
      await apiRequest("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({
          id: checklistForm.dataset.bookingId,
          patch: { operationsChecklist },
        }),
      });
      trackVelaireEvent("Admin Handover Checklist Updated", {
        completedItems: Object.values(operationsChecklist).filter(Boolean).length,
      });
      showFlowToast("Staff handover checklist saved.");
      await refreshAdmin();
      return;
    }
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
      trackVelaireEvent("Admin Price Updated", {
        vehicle: slug,
        dailyRate: Number(data.get("rate") || 0),
        deposit: Number(data.get("deposit") || 0),
        availabilityStatus: String(data.get("availabilityStatus") || ""),
      });
      showFlowToast("Vehicle pricing and availability saved.");
    }
    if (blockForm) {
      await apiRequest("/api/admin/vehicles", {
        method: "POST",
        body: JSON.stringify({
          slug,
          block: {
            start: data.get("start"),
            end: data.get("end"),
            reason: data.get("reason") || "Operations block",
          },
        }),
      });
      trackVelaireEvent("Admin Dates Blocked", {
        vehicle: slug,
        hasReason: Boolean(data.get("reason")),
      });
      showFlowToast("Vehicle dates blocked.");
    }
    await refreshAdmin();
  });

  document.addEventListener("click", async (event) => {
    const removeBlock = event.target.closest("[data-admin-remove-block]");
    const bookingAction = event.target.closest("[data-admin-booking-action]");
    const emailAction = event.target.closest("[data-admin-email-kind]");
    const printBooking = event.target.closest("[data-admin-print-booking]");
    const exportBookings = event.target.closest("[data-admin-export-bookings]");
    const exportCustomers = event.target.closest("[data-admin-export-customers]");
    const exportPayments = event.target.closest("[data-admin-export-payments]");
    const filterPreset = event.target.closest("[data-admin-filter-preset]");
    const openBooking = event.target.closest("[data-admin-open-booking], [data-admin-booking-card]");
    const closeBooking = event.target.closest("[data-admin-close-booking]");
    if (closeBooking) {
      closeAdminBookingDetail();
      return;
    }
    if (filterPreset) {
      const preset = filterPreset.dataset.adminFilterPreset;
      if (preset === "clear") {
        adminFilters = { query: "", status: "all", payment: "all", followUp: "all", date: "", view: "all" };
      }
      if (preset === "needs_reply") {
        adminFilters = { ...adminFilters, followUp: "needs_reply", view: "needs_reply" };
      }
      if (preset === "reminders") {
        adminFilters = { ...adminFilters, view: "reminders" };
      }
      syncAdminFilterInputs();
      rerenderAdminBookingViews();
      return;
    }
    if (openBooking && !bookingAction) {
      openAdminBookingDetail(openBooking.dataset.bookingId);
      return;
    }
    if (printBooking) {
      const booking = adminState.bookings.find((item) => item.id === printBooking.dataset.bookingId);
      if (!booking) {
        showFlowToast("Booking summary could not be found.", "warning");
        return;
      }
      printReceipt(booking, bookingPaymentRecord(booking), {
        title: `${booking.reference || "Velaire"} booking summary`,
        subtitle: "Operations receipt",
      });
      trackVelaireEvent("Admin Booking Summary Printed", {
        hasBooking: true,
      });
      return;
    }
    if (exportBookings) {
      exportAdminBookingsCsv();
      return;
    }
    if (exportCustomers) {
      exportAdminCustomersCsv();
      return;
    }
    if (exportPayments) {
      exportAdminPaymentsCsv();
      return;
    }
    if (emailAction) {
      emailAction.disabled = true;
      const label = emailAction.textContent;
      emailAction.textContent = "Sending...";
      try {
        const result = await apiRequest("/api/admin/notifications", {
          method: "POST",
          body: JSON.stringify({
            bookingId: emailAction.dataset.bookingId,
            kind: emailAction.dataset.adminEmailKind,
          }),
        });
        const sent = (result.notifications || []).filter((item) => item.status === "sent").length;
        const failed = (result.notifications || []).filter((item) => item.status === "failed").length;
        trackVelaireEvent("Admin Email Sent", {
          kind: emailAction.dataset.adminEmailKind,
          sent,
          failed,
        });
        showFlowToast(sent ? "Velaire email sent." : "Email attempt logged. Check notification status.", failed ? "warning" : "default");
        await refreshAdmin();
      } catch (error) {
        showFlowToast(error.message || "Email could not be sent.", "warning");
      } finally {
        emailAction.disabled = false;
        emailAction.textContent = label;
      }
      return;
    }
    if (removeBlock) {
      await apiRequest("/api/admin/vehicles", {
        method: "DELETE",
        body: JSON.stringify({
          slug: removeBlock.dataset.slug,
          blockId: removeBlock.dataset.blockId,
        }),
      });
      trackVelaireEvent("Admin Date Block Removed", {
        vehicle: removeBlock.dataset.slug,
      });
      showFlowToast("Vehicle block removed.");
      await refreshAdmin();
    }
    if (bookingAction) {
      await apiRequest("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({
          id: bookingAction.dataset.bookingId,
          action: bookingAction.dataset.adminBookingAction,
        }),
      });
      trackVelaireEvent("Admin Booking Status Updated", {
        action: bookingAction.dataset.adminBookingAction,
      });
      showFlowToast(`Booking marked ${humanStatus(bookingAction.dataset.adminBookingAction)}.`);
      await refreshAdmin();
    }
  });

  document.addEventListener("input", handleAdminFilterInput);
  document.addEventListener("change", handleAdminFilterInput);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && adminState.selectedBookingId) {
      closeAdminBookingDetail();
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && event.target.closest("[data-admin-booking-card]")) {
      event.preventDefault();
      openAdminBookingDetail(event.target.closest("[data-admin-booking-card]").dataset.bookingId);
    }
  });

  if (loadAdminToken()) {
    refreshAdmin().catch(() => {});
  }
}

function setupLogin() {
  const form = document.querySelector("form");
  const reservation = loadReservation();

  setFieldValue(form, "email", reservation.email);
  setFieldValue(form, "phone", reservation.phone);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = data.get("email") || "";
    const phone = data.get("phone") || "";
    const password = data.get("password") || "";
    saveReservation({
      email,
      phone,
    });
    saveAccount({
      email: data.get("email") || "",
      phone: data.get("phone") || "",
    });
    await ensureBackendAccount({ email, phone, password });
    await syncAccountToBackend(loadAccount());
    await syncBookingToBackend("client_details_saved");
    navigateTo(form.getAttribute("action") || "payment.html");
  });
}

function setupPayment() {
  const form = document.querySelector("form");
  hydrateFleetPricing();
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const reservation = loadReservation();
    const vehicle = selectedVehicle(reservation.vehicle);
    trackVelaireEvent("Deposit Button Clicked", {
      vehicle: vehicle.slug,
      dailyRate: vehicle.rate,
      reservationFee: RESERVATION_FEE,
      securityDeposit: vehicle.deposit,
      days: Number.parseInt(reservation.days || "1", 10) || 1,
    });
    try {
      await hydrateFleetPricing();
      await syncBookingToBackend("payment_review", { strict: true });
      const payment = await createPaymentIntent();
      saveReservation({
        status: "Concierge review",
        paymentStatus: payment.status || "payment_pending",
      });
      trackVelaireEvent("Stripe Checkout Opened", {
        vehicle: vehicle.slug,
        reservationFee: RESERVATION_FEE,
        securityDeposit: vehicle.deposit,
        paymentStatus: payment.status || "payment_pending",
        hasCheckoutUrl: Boolean(payment.checkoutUrl),
      });
      window.location.assign(payment.checkoutUrl);
    } catch (error) {
      trackVelaireEvent("Stripe Checkout Failed", {
        vehicle: vehicle.slug,
        status: error.status ? String(error.status) : "error",
      });
      showFlowToast(error.message || "Stripe Checkout could not be started. Please try again.", "warning");
    }
  });
}

function bookingFromReservation(reservation = loadReservation()) {
  const vehicle = selectedVehicle(reservation.vehicle);
  const days = Math.max(Number.parseInt(reservation.days || "2", 10), 1);
  const paymentStatus = reservation.paymentStatus || (new URLSearchParams(window.location.search).get("session_id") ? "reservation_fee_paid" : "payment_pending");
  const paidStatuses = new Set(["reservation_fee_paid", "deposit_paid", "rental_paid", "paid"]);
  return {
    id: reservation.bookingId || "",
    reference: reservation.reference || referenceFor(vehicle.slug),
    customerName: reservation.name || reservation.fullName || "Guest client",
    customerEmail: reservation.email || "",
    customerPhone: reservation.phone || "",
    vehicleSlug: vehicle.slug,
    vehicleName: vehicle.name,
    status: paidStatuses.has(String(paymentStatus).toLowerCase()) ? "confirmed" : "pending",
    paymentStatus,
    pickup: reservation.pickup || "",
    pickupTime: reservation.pickupTime || "",
    return: reservation.return || "",
    returnTime: reservation.returnTime || "",
    location: reservation.formattedAddress || reservation.location || "",
    lat: reservation.lat || "",
    lng: reservation.lng || "",
    handoverNotes: reservation.handoverNotes || "",
    billingAddress1: reservation.billingAddress1 || "",
    billingAddress2: reservation.billingAddress2 || "",
    billingTown: reservation.billingTown || "",
    billingCity: reservation.billingCity || "",
    billingPostcode: reservation.billingPostcode || "",
    billingCountry: reservation.billingCountry || "",
    totals: {
      days,
      reservationFee: RESERVATION_FEE,
      hireEstimate: vehicle.rate * days,
      deposit: vehicle.deposit,
      depositDueLater: vehicle.deposit,
      balanceDueLater: vehicle.rate * days,
      currency: "GBP",
    },
  };
}

function setupSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id") || "";
  const bookingId = params.get("booking") || "";
  if (sessionId || bookingId) {
    saveReservation({
      checkoutSessionId: sessionId || loadReservation().checkoutSessionId || "",
      bookingId: bookingId || loadReservation().bookingId || "",
      paymentStatus: sessionId ? "reservation_fee_paid" : loadReservation().paymentStatus || "payment_pending",
    });
  }
  updateSummary();

  document.querySelector("[data-print-confirmation]")?.addEventListener("click", () => {
    const booking = bookingFromReservation();
    printReceipt(booking, null, {
      title: `${booking.reference || "Velaire"} confirmation`,
      subtitle: "Customer confirmation",
    });
    trackVelaireEvent("Customer Confirmation Printed", {
      vehicle: booking.vehicleSlug,
      paymentStatus: booking.paymentStatus,
    });
  });
}

function customerStatusNextStep(booking = {}, payment = null) {
  const bookingStatus = String(booking.status || "").toLowerCase();
  const paymentStatus = String(payment?.status || booking.paymentStatus || "").toLowerCase();
  if (paymentStatus === "reservation_fee_paid") {
    return "Your £79 reservation fee is confirmed. Velaire will finalise security deposit, rental balance, driver checks and handover details privately.";
  }
  if (paymentStatus === "deposit_paid" && bookingStatus === "confirmed") {
    return "Your security deposit is confirmed. Velaire will finalise driver checks, timing and handover details.";
  }
  if (paymentStatus === "payment_pending") {
    return "Your booking is held for review. Complete the £79 reservation fee step if you have not already paid.";
  }
  if (paymentStatus === "refund_pending") {
    return "A refund review is in progress. Velaire will confirm the final refund status privately.";
  }
  if (paymentStatus === "refunded") {
    return "The reservation payment is marked as refunded. Contact Velaire if you need a receipt or further detail.";
  }
  if (["cancelled", "rejected"].includes(bookingStatus)) {
    return "This booking is not currently proceeding. Contact Velaire if you need a new reservation.";
  }
  if (bookingStatus === "completed") {
    return "This reservation is marked complete. Thank you for choosing Velaire Cars.";
  }
  return "Your reservation is with Velaire operations for final concierge review.";
}

function renderCustomerStatus(result = {}) {
  const target = document.querySelector("[data-status-result]");
  if (!target) return;
  const booking = result.booking || {};
  const payment = result.payment || null;
  const totals = booking.totals || {};
  target.hidden = false;
  target.innerHTML = `
    <article class="status-result-card">
      <div class="status-result-heading">
        <div>
          <p class="eyebrow">Current status</p>
          <h2>${escapeHtml(booking.reference || "Velaire booking")}</h2>
          <span>${escapeHtml(booking.vehicleName || "Selected Velaire vehicle")}</span>
        </div>
        <div class="status-result-pills">
          ${statusPill(booking.status)}
          ${statusPill(payment?.status || booking.paymentStatus)}
        </div>
      </div>
      <div class="status-result-grid">
        <div>
          <span>Client</span>
          <strong>${escapeHtml(booking.customerName || "Guest client")}</strong>
        </div>
        <div>
          <span>Pickup</span>
          <strong>${escapeHtml([formatDisplayDate(booking.pickup) || booking.pickup, booking.pickupTime].filter(Boolean).join(" at ") || "To be confirmed")}</strong>
        </div>
        <div>
          <span>Return</span>
          <strong>${escapeHtml([formatDisplayDate(booking.return) || booking.return, booking.returnTime].filter(Boolean).join(" at ") || "To be confirmed")}</strong>
        </div>
        <div>
          <span>Handover</span>
          <strong>${escapeHtml(booking.location || "Concierge handover to be confirmed")}</strong>
        </div>
        <div>
          <span>Reservation fee</span>
          <strong>${payment?.amount ? money(Number(payment.amount)) : money(Number(totals.reservationFee || RESERVATION_FEE))}</strong>
        </div>
        <div>
          <span>Security deposit</span>
          <strong>${totals.deposit ? `${money(Number(totals.deposit))} handled later` : "Handled later"}</strong>
        </div>
        <div>
          <span>Hire estimate</span>
          <strong>${totals.hireEstimate ? `${money(Number(totals.hireEstimate))} handled later` : "To be confirmed"}</strong>
        </div>
      </div>
      <div class="status-next-step">
        <span>Next step</span>
        <p>${escapeHtml(customerStatusNextStep(booking, payment))}</p>
      </div>
    </article>
  `;
}

function setupStatus() {
  const form = document.querySelector("[data-status-form]");
  const result = document.querySelector("[data-status-result]");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type='submit']");
    const original = submit?.textContent || "Check status";
    if (submit) {
      submit.disabled = true;
      submit.textContent = "Checking...";
    }
    try {
      const data = new FormData(form);
      const response = await apiRequest("/api/booking-status", {
        method: "POST",
        body: JSON.stringify({
          reference: data.get("reference") || "",
          email: data.get("email") || "",
        }),
      });
      renderCustomerStatus(response);
      trackVelaireEvent("Customer Status Lookup", {
        found: true,
      });
    } catch (error) {
      if (result) {
        result.hidden = false;
        result.innerHTML = `
          <article class="status-result-card status-result-error">
            <p class="eyebrow">Status unavailable</p>
            <h2>We could not match that booking.</h2>
            <p>${escapeHtml(error.message || "Check the reference and email address, then try again.")}</p>
          </article>
        `;
      }
      trackVelaireEvent("Customer Status Lookup", {
        found: false,
      });
    } finally {
      if (submit) {
        submit.disabled = false;
        submit.textContent = original;
      }
    }
  });
}

const page = document.body.dataset.page;
hydrateVehicleModels();
if (page === "booking") setupBooking();
if (page === "login") setupLogin();
if (page === "payment") setupPayment();
if (page === "account") setupAccount();
if (page === "admin") setupAdmin();
if (page === "status") setupStatus();
if (["success", "guest"].includes(page)) hydrateFleetPricing();
if (page === "success") {
  setupSuccess();
  const reservation = loadReservation();
  const vehicle = selectedVehicle(reservation.vehicle);
  if (reservation.reference || reservation.bookingId || reservation.checkoutSessionId || reservation.paymentStatus) {
    trackVelaireEventOnce(`booking-confirmed:${reservation.reference || reservation.bookingId || vehicle.slug}`, "Booking Confirmed", {
      vehicle: vehicle.slug,
      paymentStatus: reservation.paymentStatus || "unknown",
      hasReference: Boolean(reservation.reference || reservation.bookingId),
    });
  }
}
updateSummary();
