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
const defaultVehicle = "lamborghini-urus";

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
  const location = reservation.location || "Delivery location pending";

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
    days: String(Math.max(days, 1)),
  };
}

function setDeliveryStatus(message) {
  const status = document.getElementById("delivery-map-status");
  if (status) status.textContent = message;
}

function getGoogleMapsApiKey() {
  return (
    document.querySelector('meta[name="google-maps-api-key"]')?.content?.trim() ||
    window.VELAIRE_GOOGLE_MAPS_API_KEY ||
    ""
  );
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

function positionToObject(position) {
  return {
    lat: typeof position.lat === "function" ? position.lat() : position.lat,
    lng: typeof position.lng === "function" ? position.lng() : position.lng,
  };
}

function setupGoogleMapsDeliveryPicker(form) {
  const mapElement = document.getElementById("delivery-map");
  const input = document.getElementById("delivery-location");
  const confirmButton = document.getElementById("confirm-pin");
  if (!form || !mapElement || !input) return;

  const key = getGoogleMapsApiKey();
  if (!key) {
    mapElement.classList.add("is-map-locked");
    confirmButton?.setAttribute("disabled", "true");
    setDeliveryStatus("Add a Google Maps browser API key to activate postcode search and pin selection.");
    return;
  }

  window.initVelaireDeliveryMap = () => initialiseDeliveryMap(form);

  if (window.google?.maps?.places) {
    initialiseDeliveryMap(form);
    return;
  }

  if (!document.querySelector("script[data-velaire-google-maps]")) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key,
    )}&loading=async&libraries=places&callback=initVelaireDeliveryMap`;
    script.async = true;
    script.defer = true;
    script.dataset.velaireGoogleMaps = "true";
    script.onerror = () => {
      setDeliveryStatus("Google Maps could not load. Please check the API key and domain restrictions.");
    };
    document.head.appendChild(script);
  }
}

function initialiseDeliveryMap(form) {
  const mapElement = document.getElementById("delivery-map");
  const input = document.getElementById("delivery-location");
  const confirmButton = document.getElementById("confirm-pin");
  if (!mapElement || !input || mapElement.dataset.ready === "true" || !window.google?.maps?.places) return;

  mapElement.dataset.ready = "true";
  mapElement.classList.add("is-map-ready");
  mapElement.innerHTML = "";
  confirmButton?.removeAttribute("disabled");

  const reservation = loadReservation();
  const savedPosition =
    reservation.lat && reservation.lng
      ? { lat: Number.parseFloat(reservation.lat), lng: Number.parseFloat(reservation.lng) }
      : null;
  const london = { lat: 51.5074, lng: -0.1278 };
  const center = savedPosition || london;
  const ukBounds = new google.maps.LatLngBounds(
    { lat: 49.75, lng: -8.62 },
    { lat: 60.9, lng: 1.77 },
  );

  const map = new google.maps.Map(mapElement, {
    center,
    zoom: savedPosition ? 15 : 11,
    disableDefaultUI: true,
    zoomControl: true,
    fullscreenControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    clickableIcons: false,
  });

  const marker = new google.maps.Marker({
    map,
    position: center,
    draggable: true,
    title: "Velaire delivery pin",
  });
  const geocoder = new google.maps.Geocoder();
  const autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: "gb" },
    fields: ["formatted_address", "geometry", "name", "place_id"],
    strictBounds: false,
    types: ["geocode"],
  });

  autocomplete.setBounds(ukBounds);

  function commitPosition(position, address = "", placeId = "", reverse = false) {
    const point = positionToObject(position);
    marker.setPosition(point);
    map.panTo(point);
    map.setZoom(15);

    if (!reverse) {
      setDeliveryFields(form, {
        address: address || input.value,
        placeId,
        lat: point.lat,
        lng: point.lng,
      });
      setDeliveryStatus("Delivery address selected. You can drag the pin to refine the handover point.");
      return;
    }

    setDeliveryStatus("Finding the nearest UK address for your selected pin...");
    geocoder.geocode({ location: point }, (results, status) => {
      const result =
        status === "OK"
          ? results?.find((item) => item.types.includes("street_address")) || results?.[0]
          : null;
      const resolvedAddress = result?.formatted_address || `Pinned location ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
      setDeliveryFields(form, {
        address: resolvedAddress,
        placeId: result?.place_id || "",
        lat: point.lat,
        lng: point.lng,
      });
      setDeliveryStatus("Delivery pin set. Your concierge can confirm the exact handover notes.");
    });
  }

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry?.location) {
      setDeliveryStatus("Select one of the UK address suggestions to place the delivery pin.");
      return;
    }

    commitPosition(place.geometry.location, place.formatted_address || place.name, place.place_id);
  });

  map.addListener("click", (event) => {
    if (event.latLng) commitPosition(event.latLng, "", "", true);
  });

  marker.addListener("dragend", () => {
    const position = marker.getPosition();
    if (position) commitPosition(position, "", "", true);
  });

  confirmButton?.addEventListener("click", () => {
    const position = marker.getPosition();
    if (position) commitPosition(position, input.value, "", !input.value);
  });

  if (savedPosition) {
    setDeliveryStatus("Saved delivery pin restored. Drag the pin or search a postcode to update it.");
  } else {
    setDeliveryStatus("Search a UK postcode or click the map to set a concierge handover pin.");
  }
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
  setupGoogleMapsDeliveryPicker(form);
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
updateSummary();
