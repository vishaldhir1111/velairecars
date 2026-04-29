import { useState } from "react";

const fleetImageSources = {
  "tesla-model-3-performance": {
    src: "/cars/tesla-model-3-white.jpg",
    alt: "White Tesla Model 3 Performance 2020 with white interior",
    swapWith: "/cars/tesla-model-3-performance-2020-white.jpg",
    sourceType: "Owned or repository fleet photo",
  },
  "lamborghini-urus": {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/2021_Lamborghini_Urus.jpg?width=1400",
    alt: "Orange Lamborghini Urus 2021 full vehicle",
    swapWith: "/cars/lamborghini-urus-2021-orange.jpg",
    sourceType: "Temporary best-match photo until owned fleet photography is uploaded",
  },
  "range-rover-sport-svr": {
    src: "/cars/range-rover-svr-blue-2020.jpg",
    alt: "Land Rover Range Rover Sport SVR performance SUV full vehicle",
    swapWith: "/cars/range-rover-sport-svr-2021.jpg",
    sourceType: "Owned or repository fleet photo",
  },
  "bmw-m440i-convertible": {
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/BMW_G23_M440i_IMG_6571.jpg?width=1400",
    alt: "BMW M440i Convertible 2022 blue full vehicle",
    swapWith: "/cars/bmw-m440i-convertible-2022-sky-blue-wrap.jpg",
    sourceType: "Temporary best-match photo until sky blue wrap photography is uploaded",
  },
  "bmw-m140i-shadow-edition": {
    src: "/cars/bmw-m140i-black-2019.jpg",
    alt: "BMW M140i Shadow Edition 2019 full vehicle",
    swapWith: "/cars/bmw-m140i-shadow-edition-2019.jpg",
    sourceType: "Owned or repository fleet photo",
  },
};

const fleet = [
  {
    slug: "tesla-model-3-performance",
    name: "Tesla Model 3 Performance",
    year: "2020",
    finish: "White exterior, white interior",
    category: "Electric performance",
    rate: 195,
    deposit: 500,
    visualClass: "tesla-model-3-performance",
    image: fleetImageSources["tesla-model-3-performance"],
    paint: "Pearl white",
    interior: "White interior",
    specs: ["Dual Motor AWD", "Performance trim", "White cabin", "5 seats"],
    bestFor: "Quiet executive travel, city movement and clean all-weather performance.",
    summary:
      "A white-on-white electric performance saloon with instant torque, a minimalist cabin and understated executive presence.",
  },
  {
    slug: "lamborghini-urus",
    name: "Lamborghini Urus",
    year: "2021",
    finish: "Orange exterior",
    category: "Super SUV",
    rate: 895,
    deposit: 2500,
    visualClass: "lamborghini-urus",
    image: fleetImageSources["lamborghini-urus"],
    paint: "Orange exterior",
    interior: "Luxury sport cabin",
    specs: ["4.0L twin-turbo V8", "Super SUV stance", "Orange finish", "5 seats"],
    bestFor: "High-impact arrivals, events, launches and weekend presence.",
    summary:
      "An orange super SUV with dramatic road presence, a luxury sport cabin and the theatre clients expect from a flagship arrival.",
  },
  {
    slug: "range-rover-sport-svr",
    name: "Range Rover Sport SVR",
    year: "2021",
    finish: "Performance SUV",
    category: "Luxury SUV",
    rate: 495,
    deposit: 1500,
    visualClass: "range-rover-sport-svr",
    image: fleetImageSources["range-rover-sport-svr"],
    paint: "SVR performance finish",
    interior: "Command seating",
    specs: ["5.0L supercharged V8", "SVR exhaust", "Command seating", "5 seats"],
    bestFor: "Airport delivery, family luxury, rural escapes and confident daily use.",
    summary:
      "A performance Range Rover with supercharged V8 character, elevated comfort and the confidence expected from a premium SUV handover.",
  },
  {
    slug: "bmw-m440i-convertible",
    name: "BMW M440i Convertible",
    year: "2022",
    finish: "Sky blue wrap",
    category: "Convertible GT",
    rate: 295,
    deposit: 900,
    visualClass: "bmw-m440i-convertible",
    image: fleetImageSources["bmw-m440i-convertible"],
    paint: "Sky blue wrap",
    interior: "Convertible cabin",
    specs: ["M Performance", "Open-top roof", "Sky blue wrap", "4 seats"],
    bestFor: "Summer weekends, coastal drives, weddings and expressive arrivals.",
    summary:
      "A sky-blue open-top grand tourer with M Performance pace, polished daily usability and a clean summer-event look.",
  },
  {
    slug: "bmw-m140i-shadow-edition",
    name: "BMW M140i Shadow Edition",
    year: "2019",
    finish: "Shadow Edition",
    category: "Hot hatch",
    rate: 175,
    deposit: 600,
    visualClass: "bmw-m140i-shadow-edition",
    image: fleetImageSources["bmw-m140i-shadow-edition"],
    paint: "Shadow Edition finish",
    interior: "Compact performance cabin",
    specs: ["B58 3.0 turbo", "Shadow Edition trim", "Driver-focused", "5 seats"],
    bestFor: "Driver-focused weekends, city bookings and accessible performance.",
    summary:
      "A compact performance favourite with B58 power, understated Shadow Edition styling and a focused premium cabin.",
  },
];

const trustItems = [
  { value: "5", label: "Curated vehicles" },
  { value: "24/7", label: "Concierge support" },
  { value: "£0", label: "Hidden fees" },
  { value: "4.9", label: "Client rating" },
];

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
    text: "Transparent daily rates, deposit guidance and availability messaging before you commit.",
  },
  {
    title: "Premium support",
    text: "A client-focused team for itinerary changes, extensions and special occasions.",
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

function VehiclePhoto({ car, size = "card" }) {
  return (
    <figure className={`vehicle-photo vehicle-photo-${size} vehicle-photo-${car.visualClass}`}>
      <img src={car.image.src} alt={car.image.alt} loading={size === "large" ? "eager" : "lazy"} />
      <figcaption className="vehicle-photo-meta">
        <span>{car.paint}</span>
        <strong>{car.year}</strong>
      </figcaption>
    </figure>
  );
}

function App() {
  const [selectedCar, setSelectedCar] = useState(fleet[0]);

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
          <a href="account.html">Account</a>
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
                Reserve exceptional vehicles with a seamless premium experience. Performance SUVs,
                electric saloons, convertibles and driver-focused icons delivered with concierge
                precision.
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

            <form className="hero-reserve" action="booking.html" aria-label="Quick reservation">
              <p className="eyebrow">Quick reserve</p>
              <label>
                Vehicle
                <select name="vehicle" defaultValue={fleet[1].slug}>
                  {fleet.map((car) => (
                    <option value={car.slug} key={car.slug}>
                      {car.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-pair">
                <label>
                  Pickup
                  <input type="date" name="pickup" />
                </label>
                <label>
                  Time
                  <input type="time" name="time" defaultValue="10:00" />
                </label>
              </div>
              <label>
                Delivery location
                <input type="text" name="location" placeholder="Mayfair, Heathrow, hotel or venue" />
              </label>
              <button className="primary-button full-button" type="submit">
                Check availability
              </button>
              <p className="form-note">Deposit guidance and concierge delivery shown before payment.</p>
            </form>
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
            {fleet.map((car) => (
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
            <p className="eyebrow">Selected experience</p>
            <h2>{selectedCar.name}</h2>
            <p>{selectedCar.summary}</p>
            <div className="detail-meta">
              <div>
                <span>Daily rate</span>
                <strong>{formatCurrency(selectedCar.rate)}</strong>
              </div>
              <div>
                <span>Reserve deposit</span>
                <strong>{formatCurrency(selectedCar.deposit)}</strong>
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
          <a href="login.html">Client login</a>
          <a href="payment.html">Payment</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
