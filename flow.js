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
const defaultVehicle = Object.keys(vehicles)[0] || "";
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

function humanStatus(value = "") {
  return String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  return result?.booking || null;
}

async function createPaymentIntent() {
  const reservation = loadReservation();
  const booking = loadBackendBooking() || (await syncBookingToBackend("payment_review"));
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
    "/api/availability",
    {
      method: "POST",
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
  return resolveSelectedVehicleSlug({ preferUrl: true, preferChecked: true, preferStored: true });
}

function selectedVehicle(slug = selectedSlug()) {
  const cleanSlug = normaliseVehicleSlug(slug) || resolveSelectedVehicleSlug({ preferUrl: true, preferChecked: true, preferStored: true });
  return vehicles[cleanSlug] || vehicles[firstBookableVehicleSlug()] || vehicles[defaultVehicle];
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
  const slug = resolveSelectedVehicleSlug({ preferUrl: true, preferChecked: true, preferStored: true });
  if (slug && reservation.vehicle !== slug) saveReservation({ vehicle: slug });
  const vehicle = selectedVehicle(slug);
  const days = Math.max(Number.parseInt(reservation.days || "2", 10), 1);
  const location = reservation.formattedAddress || reservation.location || "Delivery location pending";

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
  bindText("reference", referenceFor(slug));
  bindVehicleMedia(vehicle);
  updateSelectedLocationPanel(reservation);
}

function mergeFleetVehicle(vehicle = {}) {
  const current = vehicles[vehicle.slug];
  if (!current) return;
  current.name = vehicle.name || current.name;
  current.shortName = vehicle.shortName || current.shortName || vehicle.name || current.name;
  current.category = vehicle.category || current.category;
  current.finish = vehicle.finish || current.finish;
  current.paint = vehicle.paint || current.paint;
  current.interior = vehicle.interior || current.interior;
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
    input.disabled = isOffline;
    card.classList.toggle("is-disabled", isOffline);
    card.setAttribute("aria-disabled", String(isOffline));
  });
}

async function hydrateFleetPricing() {
  const result = await optionalApiRequest("/api/fleet", { method: "GET" }, null);
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
    resolveSelectedVehicleSlug({ preferUrl: true, preferChecked: true, preferStored: true });
  const pickup = data.get("pickup") || "";
  const returnDate = data.get("return") || "";
  const days = calculateDays(pickup, returnDate) || Number.parseInt(loadReservation().days || "2", 10) || 2;
  const formattedAddress = data.get("formatted-address") || "";
  const typedLocation = data.get("location") || "";

  return {
    vehicle: vehicleSlug,
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
    await syncBookingToBackend("draft");
    navigateTo(form.getAttribute("action") || "login.html");
  });

  hydrateFleetPricing().finally(() => {
    refreshCards();
    persistDraft();
  });
  setupElegantDatePicker(form);
  setupMapboxDeliveryPicker(form);
}

let adminState = { bookings: [], vehicles: [], customers: [], payments: [] };

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
                  <small>Updates the live reservation rate and deposit.</small>
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

function renderAdminBookings(bookings = []) {
  const target = document.querySelector("[data-admin-bookings]");
  if (!target) return;
  if (!bookings.length) {
    target.innerHTML = `<article class="admin-empty">No bookings yet. Guest reservations will appear here after customers reserve.</article>`;
    return;
  }
  target.innerHTML = bookings
    .map(
      (booking) => `
        <article class="admin-record-card">
          <div>
            <strong>${escapeHtml(booking.customerName || "Guest client")}</strong>
            <span>${escapeHtml(booking.customerEmail || "No email")} · ${escapeHtml(booking.customerPhone || "No phone")}</span>
          </div>
          <div>
            <strong>${escapeHtml(booking.vehicleName || booking.vehicleSlug)}</strong>
            <span>${escapeHtml(booking.pickup || "Pickup pending")} to ${escapeHtml(booking.return || "Return pending")}</span>
          </div>
          <span class="status-pill">${humanStatus(booking.status)}</span>
          <span class="status-pill">${humanStatus(booking.paymentStatus)}</span>
          <div class="admin-action-row">
            <button type="button" data-admin-booking-action="confirm" data-booking-id="${escapeHtml(booking.id)}">Confirm</button>
            <button type="button" data-admin-booking-action="cancel" data-booking-id="${escapeHtml(booking.id)}">Cancel</button>
            <button type="button" data-admin-booking-action="complete" data-booking-id="${escapeHtml(booking.id)}">Complete</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAdminCustomers(customers = []) {
  const target = document.querySelector("[data-admin-customers]");
  if (!target) return;
  target.innerHTML = customers.length
    ? customers
        .map(
          (customer) => `
            <article class="admin-record-card">
              <strong>${escapeHtml(customer.fullName || "Guest client")}</strong>
              <span>${escapeHtml(customer.email || "")} · ${escapeHtml(customer.phone || "")}</span>
              <span>${Number(customer.totalBookings || 0)} bookings · ${money(Number(customer.hireValue || 0))} hire value</span>
            </article>
          `,
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
            <article class="admin-record-card">
              <strong>${escapeHtml(payment.bookingReference || payment.bookingId || "Deposit record")}</strong>
              <span>${escapeHtml(payment.vehicleName || "")} · ${escapeHtml(payment.customerEmail || "")}</span>
              <span>${money(Number(payment.amount || 0))} · ${humanStatus(payment.status)}</span>
            </article>
          `,
        )
        .join("")
    : `<article class="admin-empty">No payment records yet.</article>`;
}

async function refreshAdmin() {
  const result = await apiRequest("/api/admin/summary", { method: "GET" });
  const summary = result.summary || {};
  adminState = {
    bookings: summary.bookings || [],
    vehicles: summary.vehicles || [],
    customers: summary.customers || [],
    payments: summary.payments || [],
  };
  renderAdminCounts(summary.counts || {});
  renderAdminVehicles(adminState.vehicles);
  renderAdminBookings(adminState.bookings);
  renderAdminCustomers(adminState.customers);
  renderAdminPayments(adminState.payments);
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
    if (!vehicleForm && !blockForm) return;
    event.preventDefault();
    const data = new FormData(event.target);
    const slug = event.target.dataset.slug;
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
      showFlowToast("Vehicle dates blocked.");
    }
    await refreshAdmin();
  });

  document.addEventListener("click", async (event) => {
    const removeBlock = event.target.closest("[data-admin-remove-block]");
    const bookingAction = event.target.closest("[data-admin-booking-action]");
    if (removeBlock) {
      await apiRequest("/api/admin/vehicles", {
        method: "DELETE",
        body: JSON.stringify({
          slug: removeBlock.dataset.slug,
          blockId: removeBlock.dataset.blockId,
        }),
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
      showFlowToast(`Booking marked ${humanStatus(bookingAction.dataset.adminBookingAction)}.`);
      await refreshAdmin();
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
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await syncBookingToBackend("payment_review");
    await createPaymentIntent();
    saveReservation({
      status: "Concierge review",
      confirmedAt: new Date().toISOString(),
    });
    navigateTo(form.getAttribute("action") || "success.html");
  });
}

const page = document.body.dataset.page;
hydrateVehicleModels();
if (page === "booking") setupBooking();
if (page === "login") setupLogin();
if (page === "payment") setupPayment();
if (page === "account") setupAccount();
if (page === "admin") setupAdmin();
updateSummary();
