import { useEffect, useState } from "react";
import { conciergeFleetKnowledge, conciergePromptChips, fleet } from "./data/fleet.js";

const favouriteStorageKey = "velaireFavouriteCars";

const trustItems = [
  { value: "5", label: "Curated vehicles" },
  { value: "24/7", label: "Concierge support" },
  { value: "£0", label: "Hidden fees" },
  { value: "4.9", label: "Client rating" },
];

const serviceCards = [
  {
    title: "Concierge handover",
    text: "Home, hotel, airport and event arrivals arranged with calm precision.",
  },
  {
    title: "Prepared to present",
    text: "Every vehicle is detailed, staged and ready to feel occasion-worthy.",
  },
  {
    title: "Effortless movement",
    text: "A refined reserve-to-handover journey without rental-counter friction.",
  },
  {
    title: "Discreet support",
    text: "Considered help for timing changes, special occasions and extended drives.",
  },
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

function mergeOperationalFleet(baseFleet, operationalFleet = []) {
  const operationalBySlug = new Map(operationalFleet.map((car) => [car.slug, car]));
  return baseFleet.map((car) => {
    const operational = operationalBySlug.get(car.slug);
    if (!operational) return car;
    return {
      ...car,
      name: operational.name || car.name,
      year: operational.year || car.year,
      category: operational.category || car.category,
      finish: operational.finish || car.finish,
      paint: operational.paint || car.paint,
      interior: operational.interior || car.interior,
      rate: Number(operational.rate || car.rate),
      deposit: Number(operational.deposit || car.deposit),
      availability: operational.availability || car.availability,
      asset: {
        ...car.asset,
        modelPath: operational.modelPath || car.asset.modelPath,
        fallbackImagePath: operational.fallbackImagePath || car.asset.fallbackImagePath,
        modelAvailable: Boolean(operational.modelAvailable ?? car.asset.modelAvailable),
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

function loadFavouriteCars() {
  try {
    return JSON.parse(window.localStorage.getItem(favouriteStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveFavouriteCars(slugs) {
  window.localStorage.setItem(favouriteStorageKey, JSON.stringify(slugs));
}

async function syncFavouriteCars(slugs) {
  return slugs;
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
  const assetStatus = car.asset.modelAvailable ? "GLB model active" : "Studio 3D preview";

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
      className={`vehicle-photo vehicle-photo-${size} vehicle-model vehicle-model-${car.visualClass} vehicle-model-${car.modelType}`}
      role="img"
      aria-label={`3D studio presentation of ${car.asset.alt}`}
      data-model-path={car.asset.modelPath}
      data-fallback-image={car.asset.fallbackImagePath}
      data-model-status={car.asset.viewerMode}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {car.asset.modelAvailable ? <VehicleGlbViewer car={car} /> : <VehicleModelParts />}
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

function App() {
  const [fleetVehicles, setFleetVehicles] = useState(fleet);
  const [selectedCar, setSelectedCar] = useState(fleet[0]);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [conciergeInput, setConciergeInput] = useState("");
  const [favouriteCars, setFavouriteCars] = useState(loadFavouriteCars);
  const [conciergeMessages, setConciergeMessages] = useState([
    {
      role: "assistant",
      text:
        "Welcome to the Velaire concierge. Tell me the occasion, passenger count, location and the impression you want to create. I can recommend, compare and upsell from the Velaire fleet.",
    },
  ]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/fleet")
      .then((response) => {
        if (!response.ok) throw new Error("Fleet endpoint unavailable");
        return response.json();
      })
      .then((result) => {
        if (cancelled || !Array.isArray(result.fleet)) return;
        const nextFleet = mergeOperationalFleet(fleet, result.fleet);
        setFleetVehicles(nextFleet);
        setSelectedCar((current) => nextFleet.find((car) => car.slug === current.slug) || nextFleet[0]);
      })
      .catch(() => {
        if (!cancelled) setFleetVehicles(fleet);
      });
    return () => {
      cancelled = true;
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

  function toggleFavourite(slug) {
    setFavouriteCars((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      saveFavouriteCars(next);
      syncFavouriteCars(next);
      return next;
    });
  }

  return (
    <div className="site-shell">
      <header className="navbar" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Velaire Cars home">
          <span className="brand-mark">V</span>
          <span className="brand-copy">
            <strong>Velaire Cars</strong>
            <small>Performance, prestige, delivered</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#fleet">Fleet</a>
          <a href="#experience">Experience</a>
          <a href="#booking">Reserve</a>
          <a href="ai.html">AI concierge</a>
          <a href="terms.html">Terms</a>
        </nav>

        <a className="nav-cta" href="booking.html">
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
                Exceptional cars for elegant arrivals, curated handovers and journeys that feel
                composed from the first click.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#fleet">
                  View the fleet
                </a>
                <a className="secondary-button" href="booking.html">
                  Start reservation
                </a>
              </div>
            </div>

            <div className="hero-signature" aria-label="Velaire booking promise">
              <span>Velaire standard</span>
              <strong>Concierge handover, depart with class.</strong>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Velaire Cars trust metrics">
          {trustItems.map((item) => (
            <div className="trust-item" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
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
            {fleetVehicles.map((car) => (
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
                    <button className="text-button" type="button" onClick={() => setSelectedCar(car)}>
                      View details
                    </button>
                    <button
                      className={`text-button favourite-button ${favouriteCars.includes(car.slug) ? "is-saved" : ""}`}
                      type="button"
                      onClick={() => toggleFavourite(car.slug)}
                      aria-pressed={favouriteCars.includes(car.slug)}
                    >
                      {favouriteCars.includes(car.slug) ? "Saved" : "Save"}
                    </button>
                    <a className="card-link" href={reserveLink(car)}>
                      Reserve
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="detail-section" id="experience">
          <div className="detail-media">
            <VehiclePhoto car={selectedCar} size="large" />
          </div>
          <div className="detail-copy">
            <p className="eyebrow">Velaire arrival</p>
            <h2>Depart with class in the {selectedCar.name}.</h2>
            <p>
              {selectedCar.summary} Every booking is shaped around the arrival, the route and the
              handover detail that makes the car feel effortless.
            </p>
            <div className="detail-meta">
              <div>
                <span>Daily rate</span>
                <strong>{formatCurrency(selectedCar.rate)}</strong>
              </div>
              <div>
                <span>Handover style</span>
                <strong>Concierge</strong>
              </div>
              <div>
                <span>Best for</span>
                <strong>{selectedCar.category}</strong>
              </div>
            </div>
            <ul className="detail-specs">
              {selectedCar.specs.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
            <p className="best-for">{selectedCar.bestFor}</p>
            <a className="primary-button" href={reserveLink(selectedCar)}>
              Reserve this vehicle
            </a>
          </div>
        </section>

        <section className="section service-section">
          <div className="section-heading">
            <p className="eyebrow">Why choose Velaire</p>
            <h2>Concierge handover, depart with class.</h2>
            <p>
              A polished luxury rental experience shaped around timing, presentation and a
              memorable departure.
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
            <h2>Choose the car, set the handover, arrive composed.</h2>
            <p>
              Select dates, choose a delivery point and let the journey move through a cleaner,
              more considered reservation flow.
            </p>
          </div>
          <div className="booking-preview">
            <div className="map-preview" aria-label="Delivery location preview">
              <span>Delivery preview</span>
              <strong>London, airports and event venues</strong>
            </div>
            <a className="primary-button full-button" href="booking.html">
              Start booking
            </a>
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
          <a href="#experience">Experience</a>
          <a href="#reviews">Reviews</a>
        </div>

        <div className="footer-column">
          <strong>Reserve</strong>
          <a href="booking.html">Booking</a>
          <a href="payment.html">Payment</a>
          <a href="deposit.html">Deposit policy</a>
        </div>

        <div className="footer-column">
          <strong>Trust</strong>
          <a href="terms.html">Terms</a>
          <a href="privacy.html">Privacy</a>
          <a href="cancellation.html">Cancellation</a>
          <a href="insurance.html">Insurance</a>
          <a href="requirements.html">Rental requirements</a>
          <a href="deposit.html">Deposit policy</a>
        </div>
      </footer>

      <section className={`concierge-widget ${isConciergeOpen ? "is-open" : ""}`} aria-label="Velaire AI concierge">
        <button
          className="concierge-launcher"
          type="button"
          onClick={() => setIsConciergeOpen((open) => !open)}
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
              <button type="button" key={prompt} onClick={() => askConcierge(prompt)}>
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
            <a className="primary-button" href="booking.html">
              Start reservation
            </a>
            <a className="secondary-button" href="ai.html">
              AI concierge
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
