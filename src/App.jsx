import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { conciergeFleetKnowledge, conciergePromptChips, fleet } from "./data/fleet.js";

const reservationFee = 79;

const serviceCards = [
  {
    title: "Concierge delivery",
    text: "Home, hotel, airport and event handovers with a polished inspection process.",
  },
  {
    title: "Verified fleet",
    text: "Every vehicle is inspected, photographed and prepared to a high showroom standard.",
  },
  {
    title: "Clear reservation terms",
    text: "Transparent daily rates, a £79 reservation fee and later deposit guidance before you commit.",
  },
  {
    title: "Premium support",
    text: "A client-focused team for itinerary changes, extensions and special occasions.",
  },
];

const specialistServices = [
  {
    title: "Music Videos",
    text: "Statement vehicles prepared for set days, night shoots and visual direction.",
    image: "/cars/studio-lamborghini-urus-2021-orange.png",
  },
  {
    title: "Weddings",
    text: "Elegant arrivals, bridal party support and polished handover timing.",
    image: "/cars/studio-bmw-m440i-convertible-2022-sky-blue.png",
  },
  {
    title: "VIP Events",
    text: "High-presence vehicles for launches, private dinners and private guest logistics.",
    image: "/cars/hero-g63-cinematic.png",
  },
  {
    title: "Photoshoots",
    text: "Studio-ready vehicles for editorial, fashion and automotive content teams.",
    image: "/cars/studio-range-rover-sport-svr-2021.png",
  },
  {
    title: "Artist Transport",
    text: "Discreet premium movement for artists, management and selected guests.",
    image: "/cars/studio-tesla-model-3-performance-2020.png",
  },
];

const bookingSteps = [
  {
    title: "Choose the right presence",
    text: "Pick the vehicle that fits the brief: discreet electric performance, SUV confidence, open-top touring or full statement arrival.",
  },
  {
    title: "Set the handover",
    text: "Add the guest details, dates and delivery location so Velaire can review timing, access and release requirements.",
  },
  {
    title: "Secure the reservation fee",
    text: "Pay the £79 Stripe-hosted reservation fee, then Velaire confirms availability, deposit, rental balance and final handover plan.",
  },
];

const seoServiceLinks = [
  { label: "Luxury car hire London", href: "luxury-car-hire-london.html" },
  { label: "Mayfair", href: "luxury-car-hire-mayfair.html" },
  { label: "Knightsbridge", href: "luxury-car-hire-knightsbridge.html" },
  { label: "Chelsea", href: "luxury-car-hire-chelsea.html" },
  { label: "Heathrow", href: "luxury-car-hire-heathrow.html" },
  { label: "Wedding hire", href: "wedding-car-hire-london.html" },
];

const reviews = [
  {
    quote:
      "The Urus was immaculate and the delivery felt like a private showroom experience. Exactly the level we needed for a launch weekend.",
    name: "Ari K.",
    role: "Creative director",
  },
  {
    quote:
      "Simple, sharp and discreet. Velaire handled the Range Rover booking from airport timing through to return without friction.",
    name: "Maya R.",
    role: "Executive assistant",
  },
  {
    quote:
      "The Tesla arrived spotless with the white interior looking brand new. Premium service without the usual rental counter feeling.",
    name: "Daniel H.",
    role: "Private client",
  },
];

const faqs = [
  {
    question: "Do I need an account to reserve?",
    answer:
      "No. Velaire uses a premium guest reservation flow. Choose the vehicle, enter your details, select the handover location and secure the £79 reservation fee through Stripe-hosted checkout.",
  },
  {
    question: "What is paid online?",
    answer:
      "Only the £79 reservation fee is paid online. Velaire does not store raw card details. Security deposit and daily rental balance are handled later by the team in line with the confirmed hire terms.",
  },
  {
    question: "What checks are required before handover?",
    answer:
      "Velaire may request driving licence details, proof of address and identity checks before the vehicle is released. Requirements can vary by vehicle, insurer, driver profile and booking type.",
  },
  {
    question: "Can Velaire deliver to hotels, airports or events?",
    answer:
      "Yes. Concierge handover can be arranged for homes, hotels, airports and event venues where practical. The booking flow captures your delivery location and the team confirms final timing.",
  },
  {
    question: "How quickly is a booking confirmed?",
    answer:
      "After the reservation fee step, the booking enters concierge review. Velaire confirms availability, driver eligibility, security deposit and handover details before final release of the vehicle.",
  },
  {
    question: "Can prices or availability change?",
    answer:
      "Yes. Premium fleet pricing and availability can change based on demand, blocked dates, vehicle status and operational requirements. The booking flow reads the current operations-managed pricing.",
  },
];

const loaderParticles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 84)}%`,
  top: `${10 + ((index * 23) % 76)}%`,
  delay: 0.16 + index * 0.055,
  distance: 10 + (index % 5) * 5,
  size: 2 + (index % 3),
}));

const introSessionVersion = "showroom-v6-no-text-20260506";
const introSessionKey = `velaireIntroPlayed:${introSessionVersion}`;

function shouldReplayIntroFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("intro") === "1" || params.get("replayIntro") === "1";
  } catch {
    return false;
  }
}

function hasPlayedCurrentIntroSession() {
  try {
    if (shouldReplayIntroFromUrl()) {
      window.sessionStorage.removeItem(introSessionKey);
      return false;
    }
    return window.sessionStorage.getItem(introSessionKey) === "true";
  } catch {
    return false;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function reserveLink(car) {
  return `booking.html?vehicle=${car.slug}`;
}

function specialistQuoteHref(serviceTitle) {
  const subject = encodeURIComponent(`Velaire Cars ${serviceTitle} quote`);
  const body = encodeURIComponent(
    `Hello Velaire Cars,\n\nI would like a tailored quote for ${serviceTitle}.\n\nProject date:\nLocation:\nVehicle preference:\nRequirements:\n`,
  );
  return `mailto:reservations@velairecars.com?subject=${subject}&body=${body}`;
}

function specialistWhatsAppHref(serviceTitle) {
  const message = encodeURIComponent(`Hello Velaire Cars, I would like a tailored quote for ${serviceTitle}.`);
  return `https://wa.me/447741756888?text=${message}`;
}

function trackVelaireEvent(name, data = {}) {
  try {
    if (typeof window === "undefined" || typeof window.va !== "function") return;
    const safeData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        if (/email|phone|name|address|postcode|lat|lng|token|password|secret/i.test(key)) return false;
        return ["string", "number", "boolean"].includes(typeof value);
      }),
    );
    window.va("event", {
      name,
      data: {
        page: "home",
        ...safeData,
      },
    });
  } catch {
    // Analytics should never affect the customer experience.
  }
}

function mergeOperationsFleet(baseFleet, operationsFleet = []) {
  const operationsBySlug = new Map(operationsFleet.map((vehicle) => [vehicle.slug, vehicle]));
  return baseFleet.map((car) => {
    const live = operationsBySlug.get(car.slug);
    if (!live) return car;
    return {
      ...car,
      name: live.name || car.name,
      year: live.year || car.year,
      category: live.category || car.category,
      finish: live.finish || car.finish,
      paint: live.paint || car.paint,
      interior: live.interior || car.interior,
      specs: live.specs || car.specs,
      bestFor: live.bestFor || car.bestFor,
      summary: live.summary || car.summary,
      rate: Number.isFinite(Number(live.rate)) ? Number(live.rate) : car.rate,
      deposit: Number.isFinite(Number(live.deposit)) ? Number(live.deposit) : car.deposit,
      availability: live.availability || car.availability || {},
      asset: {
        ...car.asset,
        modelPath: car.asset.modelPath,
        fallbackImagePath: car.asset.fallbackImagePath,
        modelAvailable: Boolean(car.asset.modelAvailable),
        viewerMode: car.asset.viewerMode,
      },
    };
  });
}

function conciergeVehicleLabel(vehicle) {
  return `${vehicle.name} ${vehicle.year}`;
}

function conciergeMoney(value) {
  return formatCurrency(value);
}

function matchConciergeVehicles(question) {
  const lower = question.toLowerCase();
  return conciergeFleetKnowledge.filter((vehicle) => {
    const aliases = [
      vehicle.name,
      vehicle.slug,
      vehicle.bodyType,
      vehicle.colour,
      ...vehicle.bestUseCases,
      vehicle.name.replace("Land Rover ", ""),
      vehicle.name.replace("BMW ", ""),
    ];

    if (vehicle.slug === "lamborghini-urus") aliases.push("urus", "lamborghini", "super suv");
    if (vehicle.slug === "range-rover-sport-svr") aliases.push("svr", "range rover", "range rover svr");
    if (vehicle.slug === "tesla-model-3-performance") aliases.push("tesla", "model 3", "electric");
    if (vehicle.slug === "bmw-m440i-convertible") aliases.push("m440i", "convertible", "open top");
    if (vehicle.slug === "bmw-m140i-shadow-edition") aliases.push("m140i", "m140", "shadow edition", "hot hatch");

    return aliases.some((alias) => lower.includes(alias.toLowerCase()));
  });
}

function scoreConciergeVehicle(vehicle, question) {
  const lower = question.toLowerCase();
  const words = [
    vehicle.name,
    vehicle.bodyType,
    vehicle.colour,
    vehicle.personality,
    vehicle.idealCustomer,
    ...vehicle.bestUseCases,
    ...vehicle.keySellingPoints,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  lower
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .forEach((token) => {
      if (words.includes(token)) score += 1;
    });

  if (vehicle.slug === "lamborghini-urus" && /(impact|presence|flex|vip|content|event|launch|attention|impress|biggest)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "tesla-model-3-performance" && /(electric|quiet|refined|business|executive|clean|city|modern)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "range-rover-sport-svr" && /(performance suv|family|luggage|airport|practical|all-weather|comfort|svr)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "bmw-m440i-convertible" && /(wedding|summer|convertible|open|coastal|date|grand touring|weekend)/.test(lower)) {
    score += 8;
  }
  if (vehicle.slug === "bmw-m140i-shadow-edition" && /(compact|subtle|driver|fun|sporty|budget|value|hatch)/.test(lower)) {
    score += 8;
  }

  return score;
}

function buildConciergeComparison(matches) {
  const vehiclesToCompare = matches.slice(0, 3);
  const comparison = vehiclesToCompare
    .map(
      (vehicle) =>
        `${conciergeVehicleLabel(vehicle)}: ${vehicle.personality} Best for ${vehicle.bestUseCases
          .slice(0, 3)
          .join(", ")}. From ${conciergeMoney(vehicle.priceReference)}/day.`,
    )
    .join(" ");

  const preferred = vehiclesToCompare.sort((a, b) => b.priceReference - a.priceReference)[0];
  return `${comparison} My concierge pick is ${conciergeVehicleLabel(
    preferred,
  )} if you want the most premium impression. Reserve it if image and arrival impact matter most.`;
}

function buildConciergeResponse(question) {
  const lower = question.toLowerCase();
  const matches = matchConciergeVehicles(question);

  if (lower.includes("compare") && matches.length >= 2) {
    return buildConciergeComparison(matches);
  }

  if (/(fleet|what cars|available|options|list)/.test(lower)) {
    return `The Velaire fleet is ${conciergeFleetKnowledge
      .map((vehicle) => conciergeVehicleLabel(vehicle))
      .join(", ")}. Tell me the occasion, passenger count and desired impression and I will guide you to the strongest fit.`;
  }

  if (matches.length === 1 && /(tell|detail|spec|what|about|price|cost|how much)/.test(lower)) {
    const vehicle = matches[0];
    return `${conciergeVehicleLabel(vehicle)} is a ${vehicle.bodyType} in ${vehicle.colour} with ${vehicle.interior}. It suits ${vehicle.bestUseCases
      .slice(0, 4)
      .join(", ")}. Key selling points: ${vehicle.keySellingPoints.join(", ")}. Pricing reference is ${conciergeMoney(
      vehicle.priceReference,
    )}/day. ${vehicle.upsellAngle}`;
  }

  const ranked = [...conciergeFleetKnowledge].sort(
    (a, b) => scoreConciergeVehicle(b, question) - scoreConciergeVehicle(a, question),
  );
  const pick = ranked[0];
  const second = ranked[1];

  return `I would recommend ${conciergeVehicleLabel(pick)}. ${pick.personality} It is strongest for ${pick.bestUseCases
    .slice(0, 4)
    .join(", ")} and fits ${pick.idealCustomer.toLowerCase()} Pricing reference is ${conciergeMoney(
    pick.priceReference,
  )}/day. If you want an alternative, ${conciergeVehicleLabel(second)} gives you ${second.personality.toLowerCase()} ${pick.upsellAngle} Start a reservation and the concierge can confirm availability, handover and deposit terms.`;
}

function VehicleModelParts() {
  return (
    <div className="vehicle-model-scene" aria-hidden="true">
      <div className="vehicle-model-turntable">
        <span className="model-ground" />
        <span className="model-reflection" />
        <div className="model-car">
          <span className="model-body" />
          <span className="model-body-top" />
          <span className="model-cabin" />
          <span className="model-glass model-glass-front" />
          <span className="model-glass model-glass-rear" />
          <span className="model-grille" />
          <span className="model-light model-light-front" />
          <span className="model-light model-light-rear" />
          <span className="model-wheel model-wheel-rear">
            <span />
          </span>
          <span className="model-wheel model-wheel-front">
            <span />
          </span>
          <span className="model-door-line" />
          <span className="model-highlight" />
        </div>
      </div>
    </div>
  );
}

function VehicleGlbViewer({ car }) {
  return (
    <model-viewer
      className="vehicle-glb-viewer"
      src={car.asset.modelPath}
      poster={car.asset.fallbackImagePath || ""}
      alt={car.asset.alt}
      camera-controls
      interaction-prompt="none"
      shadow-intensity="0.82"
      exposure="0.92"
      environment-image="neutral"
      loading="lazy"
      reveal="auto"
    >
      <VehicleModelParts />
    </model-viewer>
  );
}

function VehiclePhoto({ car, size = "card" }) {
  const assetStatus = car.asset.modelAvailable ? "GLB model active" : "3D studio visual";

  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--model-rotate-z", `${-5 + x * 7}deg`);
    event.currentTarget.style.setProperty("--model-lift", `${3 - y * 10}px`);
  }

  function handlePointerLeave(event) {
    event.currentTarget.style.removeProperty("--model-rotate-z");
    event.currentTarget.style.removeProperty("--model-lift");
  }

  return (
    <figure
      className={`vehicle-photo vehicle-photo-${size} vehicle-model vehicle-model-${car.visualClass} vehicle-model-${car.modelType} ${
        car.asset.fallbackImagePath ? "has-photo" : ""
      }`}
      role="img"
      aria-label={`Premium 3D studio visual of ${car.asset.alt}`}
      data-model-path={car.asset.modelPath}
      data-fallback-image={car.asset.fallbackImagePath}
      data-model-status={car.asset.viewerMode}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {car.asset.modelAvailable ? (
        <VehicleGlbViewer car={car} />
      ) : car.asset.fallbackImagePath ? (
        <img className="vehicle-media-image" src={car.asset.fallbackImagePath} alt={car.asset.alt} loading="lazy" decoding="async" />
      ) : (
        <VehicleModelParts />
      )}
      <div className="vehicle-model-badges" aria-hidden="true">
        <span>{assetStatus}</span>
        <span>{car.category}</span>
      </div>
      <figcaption className="vehicle-photo-meta">
        <span>{car.paint}</span>
        <strong>{car.year}</strong>
      </figcaption>
    </figure>
  );
}

function VehicleDetailModal({ car, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="vehicle-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close vehicle details">
          Close
        </button>
        <div className="vehicle-modal-media">
          <VehiclePhoto car={car} size="large" />
        </div>
        <div className="vehicle-modal-copy">
          <p className="eyebrow">Vehicle details</p>
          <h2 id="vehicle-modal-title">{car.name}</h2>
          <p>{car.summary}</p>
          <div className="detail-meta">
            <div>
              <span>Daily rate</span>
              <strong>{formatCurrency(car.rate)}</strong>
            </div>
            <div>
              <span>Reservation fee</span>
              <strong>{formatCurrency(reservationFee)}</strong>
            </div>
            <div>
              <span>Body style</span>
              <strong>{car.category}</strong>
            </div>
          </div>
          <ul className="detail-specs">
            {car.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
          <p className="best-for">{car.bestFor}</p>
          <div className="vehicle-modal-actions">
            <a
              className="primary-button"
              href={reserveLink(car)}
              onClick={() =>
                trackVelaireEvent("Car Selected", {
                  source: "vehicle_detail_modal",
                  vehicle: car.slug,
                  dailyRate: car.rate,
                  deposit: car.deposit,
                })
              }
            >
              Reserve this vehicle
            </a>
            <button className="secondary-button" type="button" onClick={onClose}>
              Continue browsing
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function VelaireIntroLoader({ onComplete }) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, prefersReducedMotion ? 900 : 4800);
    return () => window.clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  return (
    <motion.section
      className="cinematic-loader"
      aria-label="Velaire Cars cinematic intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.085 }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="loader-ambient"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: prefersReducedMotion ? 0.42 : [0.26, 0.54, 0.38], scale: prefersReducedMotion ? 1 : [0.96, 1.04, 1] }}
        transition={{ duration: 4.4, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="loader-distant-source"
        initial={{ opacity: 0, scale: 0.52, x: "-42%" }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.32, scale: 0.9, x: "-18%" }
            : { opacity: [0, 0.22, 0.62, 0.26], scale: [0.52, 0.92, 1.18, 0.98], x: ["-42%", "-22%", "0%", "18%"] }
        }
        transition={{ duration: prefersReducedMotion ? 0.7 : 3.2, delay: prefersReducedMotion ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />

      <div className="loader-particles" aria-hidden="true">
        {loaderParticles.map((particle) => (
          <motion.span
            key={particle.id}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            initial={{ opacity: 0, y: 0, scale: 0.72 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.26, y: 0, scale: 1 }
                : {
                    opacity: [0, 0.32, 0.08],
                    y: [0, -particle.distance, 0],
                    scale: [0.72, 1, 0.78],
                  }
            }
            transition={{
              duration: 3.8,
              delay: particle.delay,
              repeat: prefersReducedMotion ? 0 : Infinity,
              repeatType: "mirror",
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>

      <motion.div
        className="loader-showroom-floor"
        initial={{ opacity: 0, y: 28, scaleX: 0.84 }}
        animate={{ opacity: prefersReducedMotion ? 0.34 : [0, 0.46, 0.36], y: 0, scaleX: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.4 : 2.15, delay: prefersReducedMotion ? 0 : 0.82, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="loader-speed-streak"
        initial={{ x: "-120vw", scaleX: 0.12, scaleY: 0.5, opacity: 0 }}
        animate={
          prefersReducedMotion
            ? { x: 0, scaleX: 1, scaleY: 1, opacity: 0.42 }
            : { x: ["-120vw", "-18vw", "112vw"], scaleX: [0.12, 2.2, 0.2], scaleY: [0.5, 1, 0.6], opacity: [0, 1, 0] }
        }
        transition={{ duration: prefersReducedMotion ? 0.5 : 0.94, delay: prefersReducedMotion ? 0 : 0.96, ease: [0.1, 0.82, 0.18, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="loader-car-silhouette"
        initial={{ opacity: 0, y: 14, scaleX: 0.88 }}
        animate={{ opacity: prefersReducedMotion ? 0.24 : [0, 0.08, 0.3, 0.16], y: 0, scaleX: 1 }}
        transition={{ duration: 3.05, delay: prefersReducedMotion ? 0 : 1.18, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 960 220" role="presentation" focusable="false">
          <path d="M84 146 C144 116 204 104 278 96 C326 56 392 36 486 34 C594 32 656 56 718 99 C788 106 848 122 890 148" />
          <path d="M206 146 L784 146" />
          <path d="M330 96 C378 70 430 58 494 58 C566 58 616 72 664 101" />
          <path d="M144 139 C226 125 330 124 460 126 C602 128 720 125 846 141" />
          <circle cx="262" cy="150" r="34" />
          <circle cx="724" cy="150" r="34" />
        </svg>
        <motion.span
          className="loader-body-contour"
          initial={{ opacity: 0, scaleX: 0.25 }}
          animate={{ opacity: prefersReducedMotion ? 0.2 : [0, 0.62, 0.22], scaleX: [0.25, 1, 0.9] }}
          transition={{ duration: prefersReducedMotion ? 0.3 : 1.25, delay: prefersReducedMotion ? 0 : 1.56, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          className="loader-headlight loader-headlight-left"
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: prefersReducedMotion ? 0.26 : [0, 0.78, 0.32], scaleX: [0.5, 1, 0.8] }}
          transition={{ duration: prefersReducedMotion ? 0.35 : 1.15, delay: prefersReducedMotion ? 0 : 2.28, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          className="loader-headlight loader-headlight-right"
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: prefersReducedMotion ? 0.26 : [0, 0.7, 0.3], scaleX: [0.5, 1, 0.8] }}
          transition={{ duration: prefersReducedMotion ? 0.35 : 1.15, delay: prefersReducedMotion ? 0 : 2.34, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      <motion.div
        className="loader-reflection-ripple"
        initial={{ opacity: 0, scaleX: 0.34, y: 26 }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.22, scaleX: 1, y: 0 }
            : { opacity: [0, 0.42, 0.12, 0], scaleX: [0.34, 1, 1.18, 1.34], y: [26, 0, -4, -8] }
        }
        transition={{ duration: prefersReducedMotion ? 0.4 : 1.45, delay: prefersReducedMotion ? 0 : 3.03, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="loader-logo-wrap"
        animate={
          prefersReducedMotion
            ? { y: 0, scale: 1 }
            : { y: [0, 0, -4, -13], scale: [0.985, 1, 1.012, 1.055] }
        }
        transition={{ duration: prefersReducedMotion ? 0.2 : 4.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="loader-light-streak"
          initial={{ x: "-125%", scaleX: 0.1, opacity: 0 }}
          animate={
            prefersReducedMotion
              ? { x: "0%", scaleX: 1, opacity: 0.55 }
              : {
                  x: ["-125%", "0%", "125%"],
                  scaleX: [0.12, 1, 0.2],
                  opacity: [0, 1, 0],
                }
          }
          transition={{ duration: prefersReducedMotion ? 0.65 : 1.65, delay: prefersReducedMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden="true"
        />

      </motion.div>

      <motion.div
        className="loader-engine-pulse"
        initial={{ opacity: 0, scale: 0.72 }}
        animate={
          prefersReducedMotion
            ? { opacity: 0.18, scale: 1 }
            : {
                opacity: [0, 0.36, 0.12, 0.28, 0],
                scale: [0.72, 1, 1.04, 1.02, 1.14],
              }
        }
        transition={{ duration: prefersReducedMotion ? 0.4 : 1.26, delay: prefersReducedMotion ? 0 : 3.12, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />
    </motion.section>
  );
}

function App() {
  const [liveFleet, setLiveFleet] = useState(fleet);
  const [detailCarSlug, setDetailCarSlug] = useState("");
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    return !hasPlayedCurrentIntroSession();
  });
  const [introComplete, setIntroComplete] = useState(() => {
    return hasPlayedCurrentIntroSession();
  });
  const [conciergeInput, setConciergeInput] = useState("");
  const [conciergeMessages, setConciergeMessages] = useState([
    {
      role: "assistant",
      text:
        "Welcome to the Velaire concierge. Tell me the occasion, passenger count, location and the impression you want to create. I can recommend, compare and upsell from the Velaire fleet.",
    },
  ]);
  const detailCar = liveFleet.find((car) => car.slug === detailCarSlug) || null;

  const completeIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(introSessionKey, "true");
    } catch {
      // The intro still completes normally if private browsing blocks storage.
    }
    setShowIntro(false);
    setIntroComplete(true);
    trackVelaireEvent("Cinematic Intro Completed", { source: "homepage_loader" });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function hydrateOperationsFleet() {
      try {
        const response = await fetch(`/api/fleet?ts=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) return;
        const result = await response.json();
        if (!isMounted || !Array.isArray(result.fleet)) return;
        const nextFleet = mergeOperationsFleet(fleet, result.fleet);
        setLiveFleet(nextFleet);
      } catch {
        // Keep the static fleet visible if the operations API is unavailable.
      }
    }
    hydrateOperationsFleet();
    return () => {
      isMounted = false;
    };
  }, []);

  async function askConcierge(question) {
    const clean = question.trim();
    if (!clean) return;
    const fallbackResponse = buildConciergeResponse(clean);
    setIsConciergeOpen(true);
    setConciergeMessages((messages) => [
      ...messages,
      { role: "user", text: clean },
      { role: "assistant", text: "Preparing a Velaire fleet recommendation..." },
    ]);
    setConciergeInput("");

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: clean }),
      });
      if (!response.ok) throw new Error("Concierge endpoint unavailable");
      const result = await response.json();
      setConciergeMessages((messages) => [
        ...messages.slice(0, -1),
        { role: "assistant", text: result.response || fallbackResponse },
      ]);
    } catch {
      setConciergeMessages((messages) => [...messages.slice(0, -1), { role: "assistant", text: fallbackResponse }]);
    }
  }

  return (
    <div className={`site-shell ${introComplete ? "intro-complete" : "intro-active"}`}>
      <AnimatePresence>{showIntro ? <VelaireIntroLoader onComplete={completeIntro} /> : null}</AnimatePresence>
      <header className="navbar" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Velaire Cars home">
          <span className="brand-copy">
            <strong>Velaire Cars</strong>
            <small>Performance, prestige, delivered</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#fleet">Fleet</a>
          <a href="booking.html" onClick={() => trackVelaireEvent("Booking Started", { source: "header_nav" })}>
            Reserve
          </a>
          <a href="areas-served.html">Areas</a>
        </nav>

        <a className="nav-cta" href="booking.html" onClick={() => trackVelaireEvent("Booking Started", { source: "header_cta" })}>
          Reserve now
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-backdrop" aria-hidden="true" />
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">Luxury car rental, elevated</p>
              <h1>Velaire Cars</h1>
              <p className="hero-lede">
                Reserve exceptional vehicles with a seamless premium experience. Performance SUVs,
                electric saloons, convertibles and driver-focused icons delivered with concierge
                precision.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#fleet">
                  View the fleet
                </a>
                <a className="secondary-button" href="booking.html" onClick={() => trackVelaireEvent("Booking Started", { source: "hero_cta" })}>
                  Start reservation
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-light" id="fleet">
          <div className="section-heading">
            <p className="eyebrow">Signature fleet</p>
            <h2>Five cars. Every one chosen for a different kind of arrival.</h2>
            <p>
              The Velaire fleet is concise by design: electric performance, super SUV presence,
              Range Rover confidence, open-top grand touring and compact driver appeal.
            </p>
          </div>

          <div className="fleet-grid">
            {liveFleet.map((car) => (
              <article className="fleet-card" key={car.slug}>
                <div className="fleet-media">
                  <VehiclePhoto car={car} />
                </div>
                <div className="fleet-card-body">
                  <div className="fleet-title-row">
                    <div>
                      <p>{car.category}</p>
                      <h3>{car.name}</h3>
                    </div>
                    <strong>{formatCurrency(car.rate)}/day</strong>
                  </div>
                  <p className="fleet-finish">{car.finish}</p>
                  <ul className="spec-list">
                    {car.specs.slice(0, 3).map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                  <div className="card-actions">
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => {
                        setDetailCarSlug(car.slug);
                        trackVelaireEvent("Vehicle Details Opened", {
                          vehicle: car.slug,
                          dailyRate: car.rate,
                          deposit: car.deposit,
                        });
                      }}
                    >
                      View details
                    </button>
                    <a
                      className="card-link"
                      href={reserveLink(car)}
                      onClick={() =>
                        trackVelaireEvent("Car Selected", {
                          source: "homepage_fleet",
                          vehicle: car.slug,
                          dailyRate: car.rate,
                          deposit: car.deposit,
                        })
                      }
                    >
                      Reserve
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {detailCar ? <VehicleDetailModal car={detailCar} onClose={() => setDetailCarSlug("")} /> : null}

        <section className="section specialist-section" id="concierge-services">
          <div className="section-heading">
            <p className="eyebrow">Concierge Services</p>
            <h2>Specialist vehicle support for moments that need more than a booking.</h2>
            <p>Tailored quotes based on project requirements.</p>
          </div>

          <div className="specialist-grid">
            {specialistServices.map((service) => (
              <article
                className="specialist-card"
                key={service.title}
                style={{ "--service-image": `url(${service.image})` }}
              >
                <div className="specialist-card-content">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <div className="specialist-actions">
                    <a
                      className="specialist-button specialist-button-primary"
                      href={specialistQuoteHref(service.title)}
                      onClick={() => trackVelaireEvent("Specialist Service Quote", { service: service.title })}
                    >
                      Request Quote
                    </a>
                    <a
                      className="specialist-button"
                      href={specialistWhatsAppHref(service.title)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackVelaireEvent("Specialist Service WhatsApp", { service: service.title })}
                    >
                      WhatsApp Us
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section service-section">
          <div className="section-heading">
            <p className="eyebrow">Why choose Velaire</p>
            <h2>A rental experience built like a private-client service.</h2>
            <p>
              From first enquiry to final return, the flow is designed around confidence, clarity
              and presentation.
            </p>
          </div>
          <div className="service-grid">
            {serviceCards.map((card, index) => (
              <article className="service-card" key={card.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="booking-band" id="booking">
          <div>
            <p className="eyebrow">Reserve with confidence</p>
            <h2>Browse, select, reserve and arrive. No counter. No confusion.</h2>
            <p>
              Choose dates, delivery location and vehicle preference. The booking flow keeps the
              experience premium from first click to confirmation.
            </p>
          </div>
          <div className="booking-preview">
            <div className="map-preview" aria-label="Delivery location preview">
              <span>Delivery preview</span>
              <strong>London, airports and event venues</strong>
            </div>
            <a className="primary-button full-button" href="booking.html" onClick={() => trackVelaireEvent("Booking Started", { source: "booking_band" })}>
              Start booking
            </a>
          </div>
        </section>

        <section className="section process-section">
          <div className="section-heading">
            <p className="eyebrow">How Velaire works</p>
            <h2>A cleaner route from vehicle choice to concierge handover.</h2>
            <p>
              The booking journey is built for speed and confidence: no account requirement, clear
              handover details and a secure £79 reservation fee step before final operations review.
            </p>
          </div>

          <div className="process-grid">
            {bookingSteps.map((step, index) => (
              <article className="process-card" key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>

          <div className="seo-link-strip" aria-label="Popular Velaire Cars hire pages">
            {seoServiceLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="section section-light reviews-section" id="reviews">
          <div className="section-heading">
            <p className="eyebrow">Client proof</p>
            <h2>Premium service is remembered in the small details.</h2>
          </div>

          <div className="reviews-grid">
            {reviews.map((review) => (
              <article className="review-card" key={review.name}>
                <p>{review.quote}</p>
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="section-heading">
            <p className="eyebrow">Before you reserve</p>
            <h2>Clear answers for a smoother handover.</h2>
            <p>
              The Velaire flow is built to feel polished from enquiry to keys: simple guest
              booking, a secure reservation fee and concierge support where detail matters.
            </p>
          </div>

          <div className="faq-layout">
            <div className="faq-feature">
              <span>Concierge clarity</span>
              <strong>Reservation fee, deposits, delivery and driver checks explained before you commit.</strong>
              <a className="secondary-button" href="areas-served.html">
                View areas served
              </a>
            </div>
            <div className="faq-list">
              {faqs.map((item, index) => (
                <details className="faq-item" key={item.question} open={index === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark">V</span>
            <span className="brand-copy">
              <strong>Velaire Cars</strong>
              <small>Luxury car rental concierge</small>
            </span>
          </a>
          <p>
            Performance, prestige and concierge delivery for customers who expect the journey to
            feel as considered as the car.
          </p>
        </div>

        <div className="footer-column">
          <strong>Explore</strong>
          <a href="#fleet">Fleet</a>
          <a href="#reviews">Reviews</a>
          <a href="#faq">FAQ</a>
          <a href="areas-served.html">Areas served</a>
        </div>

        <div className="footer-column">
          <strong>Reserve</strong>
          <a href="booking.html">Booking</a>
          <a href="payment.html">Payment</a>
        </div>

        <div className="footer-column">
          <strong>Popular hire</strong>
          <a href="luxury-car-hire-london.html">Luxury car hire London</a>
          <a href="lamborghini-urus-hire-london.html">Lamborghini Urus hire</a>
          <a href="range-rover-svr-hire-london.html">Range Rover SVR hire</a>
          <a href="tesla-model-3-hire-london.html">Tesla Model 3 hire</a>
          <a href="bmw-m440i-hire-london.html">BMW M440i hire</a>
          <a href="bmw-m140i-hire-london.html">BMW M140i hire</a>
        </div>

        <div className="footer-column">
          <strong>Areas</strong>
          <a href="luxury-car-hire-mayfair.html">Mayfair</a>
          <a href="luxury-car-hire-knightsbridge.html">Knightsbridge</a>
          <a href="luxury-car-hire-chelsea.html">Chelsea</a>
          <a href="luxury-car-hire-heathrow.html">Heathrow</a>
          <a href="wedding-car-hire-london.html">Wedding hire</a>
        </div>

        <div className="footer-column">
          <strong>Trust</strong>
          <a href="terms.html">Terms</a>
          <a href="privacy.html">Privacy</a>
          <a href="cancellation.html">Cancellation</a>
          <a href="rental-requirements.html">Rental requirements</a>
          <a href="deposit-policy.html">Deposit policy</a>
        </div>
      </footer>

      <section className={`concierge-widget ${isConciergeOpen ? "is-open" : ""}`} aria-label="Velaire AI concierge">
        <button
          className="concierge-launcher"
          type="button"
          onClick={() => {
            setIsConciergeOpen((open) => !open);
            trackVelaireEvent("Concierge Opened", { source: "launcher" });
          }}
          aria-expanded={isConciergeOpen}
        >
          <span>AI Concierge</span>
          <strong>Ask Velaire</strong>
        </button>

        <div className="concierge-panel" hidden={!isConciergeOpen}>
          <div className="concierge-panel-header">
            <div>
              <p className="eyebrow">Luxury reservations assistant</p>
              <h2>Velaire Concierge</h2>
            </div>
            <button type="button" onClick={() => setIsConciergeOpen(false)} aria-label="Close concierge">
              Close
            </button>
          </div>

          <div className="concierge-chip-row" aria-label="Suggested concierge prompts">
            {conciergePromptChips.map((prompt) => (
              <button
                type="button"
                key={prompt}
                onClick={() => {
                  trackVelaireEvent("Concierge Prompt Submitted", { source: "prompt_chip" });
                  askConcierge(prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="concierge-messages" aria-live="polite">
            {conciergeMessages.map((message, index) => (
              <div className={`concierge-bubble ${message.role}`} key={`${message.role}-${index}`}>
                <strong>{message.role === "assistant" ? "Velaire Concierge" : "You"}</strong>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <form
            className="concierge-form"
            onSubmit={(event) => {
              event.preventDefault();
              trackVelaireEvent("Concierge Prompt Submitted", { source: "manual_prompt" });
              askConcierge(conciergeInput);
            }}
          >
            <label>
              Ask for a recommendation
              <input
                value={conciergeInput}
                onChange={(event) => setConciergeInput(event.target.value)}
                placeholder="Example: I want the biggest impact for a Mayfair dinner"
              />
            </label>
            <button className="primary-button" type="submit">
              Ask
            </button>
          </form>

          <div className="concierge-reserve-row">
            <a className="primary-button" href="booking.html" onClick={() => trackVelaireEvent("Booking Started", { source: "concierge_cta" })}>
              Start guest reservation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
