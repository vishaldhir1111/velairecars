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
    visualLabel: "Lamborghini Urus 2021, orange exterior",
    description:
      "An orange super SUV with dramatic road presence, a luxury sport cabin and the theatre clients expect from a flagship arrival.",
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
    visualLabel: "BMW M140i Shadow Edition 2019",
    description:
      "A compact performance favourite with B58 power, understated Shadow Edition styling and a focused premium cabin.",
  },
};

const storageKey = "velaireReservation";
const accountStorageKey = "velaireAccount";
const defaultVehicle = "lamborghini-urus";
const MAPBOX_TOKEN = "PASTE_MAPBOX_TOKEN_HERE";
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

const fleetKnowledgeBase = Object.entries(vehicles).map(([slug, vehicle]) => ({
  slug,
  name: vehicle.name,
  category: vehicle.category,
  finish: vehicle.finish,
  dailyRate: vehicle.rate,
  deposit: vehicle.deposit,
  description: vehicle.description,
  bestFor:
    {
      "tesla-model-3-performance": "quiet executive travel, electric performance and understated city movement",
      "lamborghini-urus": "high-impact arrivals, VIP events, launches and dramatic road presence",
      "range-rover-sport-svr": "airport transfers, luggage, family trips, rural escapes and all-weather luxury",
      "bmw-m440i-convertible": "summer weekends, weddings, coastal drives and open-top occasions",
      "bmw-m140i-shadow-edition": "driver-focused weekends, compact performance and accessible luxury",
    }[slug] || vehicle.category,
}));

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

function bindVehicleVisual(vehicle) {
  document.querySelectorAll("[data-bind-vehicle-art]").forEach((node) => {
    Object.keys(vehicles).forEach((slug) => {
      node.classList.remove(`vehicle-art-${slug}`);
    });
    node.classList.add(`vehicle-art-${vehicle.visualClass}`);
    node.setAttribute("aria-label", vehicle.visualLabel);
  });
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
  const code = slug
    .split("-")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return `VEL-${code}-1087`;
}

function updateSummary() {
  const reservation = loadReservation();
  const slug = reservation.vehicle || selectedSlug();
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
  bindVehicleVisual(vehicle);
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

function conciergeRecommendation(question) {
  const lower = question.toLowerCase();
  const bySlug = Object.fromEntries(fleetKnowledgeBase.map((vehicle) => [vehicle.slug, vehicle]));
  let pick = bySlug["lamborghini-urus"];
  let reason = "It creates the strongest arrival impact while keeping full SUV usability.";

  if (lower.includes("airport") || lower.includes("luggage") || lower.includes("family") || lower.includes("four")) {
    pick = bySlug["range-rover-sport-svr"];
    reason = "It is the most practical premium choice for luggage, passengers and refined airport handover.";
  } else if (lower.includes("electric") || lower.includes("quiet") || lower.includes("tesla") || lower.includes("city")) {
    pick = bySlug["tesla-model-3-performance"];
    reason = "It gives quiet electric performance, low-key executive presence and simple city usability.";
  } else if (lower.includes("wedding") || lower.includes("summer") || lower.includes("convertible") || lower.includes("coastal")) {
    pick = bySlug["bmw-m440i-convertible"];
    reason = "It brings an open-top, polished GT feel without becoming too loud for elegant occasions.";
  } else if (lower.includes("driver") || lower.includes("budget") || lower.includes("compact") || lower.includes("m140")) {
    pick = bySlug["bmw-m140i-shadow-edition"];
    reason = "It is the best driver-focused value in the fleet while still feeling special.";
  }

  if (lower.includes("upsell") || lower.includes("exclusive") || lower.includes("impress") || lower.includes("vip")) {
    pick = bySlug["lamborghini-urus"];
    reason = "For a more exclusive step up, the Urus adds theatre, colour and flagship presence.";
  }

  return `${pick.name} is my recommendation. ${reason} Daily rate is ${money(
    pick.dailyRate,
  )}, with deposit guidance from ${money(
    pick.deposit,
  )}. I would pair it with concierge delivery, pre-handover detailing and a confirmed arrival window for a properly Velaire experience.`;
}

function setupConciergeAssistant() {
  const form = document.getElementById("concierge-form");
  const input = form?.elements?.conciergeQuestion;
  if (!form || !input) return;

  function ask(question) {
    const clean = question.trim();
    if (!clean) return;
    appendConciergeMessage("user", clean);
    appendConciergeMessage("assistant", conciergeRecommendation(clean));
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

    form.addEventListener("submit", (event) => {
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
  });

  updateAccountDisplay(account);
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
  }

  document.querySelectorAll('input[name="vehicle"]').forEach((input) => {
    input.addEventListener("change", () => {
      refreshCards();
      persistDraft();
    });
  });

  form?.addEventListener("input", persistDraft);
  form?.addEventListener("submit", () => {
    saveReservation(readBookingForm(form));
  });

  refreshCards();
  persistDraft();
  setupElegantDatePicker(form);
  setupMapboxDeliveryPicker(form);
}

function setupLogin() {
  const form = document.querySelector("form");
  const reservation = loadReservation();

  setFieldValue(form, "email", reservation.email);
  setFieldValue(form, "phone", reservation.phone);

  form?.addEventListener("submit", () => {
    const data = new FormData(form);
    saveReservation({
      email: data.get("email") || "",
      phone: data.get("phone") || "",
    });
  });
}

function setupPayment() {
  const form = document.querySelector("form");
  form?.addEventListener("submit", () => {
    saveReservation({
      status: "Concierge review",
      confirmedAt: new Date().toISOString(),
    });
  });
}

const page = document.body.dataset.page;
if (page === "booking") setupBooking();
if (page === "login") setupLogin();
if (page === "payment") setupPayment();
if (page === "account") setupAccount();
updateSummary();
