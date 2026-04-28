import { useState } from "react";

const fleet = [
  {
    slug: "tesla-model-3-performance",
    name: "Tesla Model 3 Performance",
    year: "2020",
    finish: "White exterior, white interior",
    category: "Electric performance",
    rate: 195,
    deposit: 500,
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1400&q=84",
    alt: "White electric performance saloon placeholder for Tesla Model 3 Performance",
    specs: ["0-60 in 3.1s", "Dual motor AWD", "White interior", "5 seats"],
    bestFor: "Quiet executive travel, city movement and clean performance.",
    summary:
      "A sharp electric performance saloon with instant torque, a minimalist white cabin and discreet arrival energy.",
  },
  {
    slug: "lamborghini-urus",
    name: "Lamborghini Urus",
    year: "2021",
    finish: "Orange exterior",
    category: "Super SUV",
    rate: 895,
    deposit: 2500,
    image:
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1400&q=84",
    alt: "Orange performance SUV placeholder for Lamborghini Urus",
    specs: ["641 bhp", "V8 twin turbo", "Orange finish", "5 seats"],
    bestFor: "High-impact arrivals, events, launches and weekend presence.",
    summary:
      "A statement SUV with supercar drama, luxury cabin comfort and the road presence clients remember.",
  },
  {
    slug: "range-rover-sport-svr",
    name: "Range Rover Sport SVR",
    year: "2021",
    finish: "Performance SUV",
    category: "Luxury SUV",
    rate: 495,
    deposit: 1500,
    image:
      "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&w=1400&q=84",
    alt: "Luxury SUV placeholder for Range Rover Sport SVR",
    specs: ["Supercharged V8", "AWD", "Command seating", "5 seats"],
    bestFor: "Airport delivery, family luxury, rural escapes and confident daily use.",
    summary:
      "A refined performance SUV with luggage space, presence and the comfort expected from a premium handover.",
  },
  {
    slug: "bmw-m440i-convertible",
    name: "BMW M440i Convertible",
    year: "2022",
    finish: "Sky blue wrap",
    category: "Convertible GT",
    rate: 295,
    deposit: 900,
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=84",
    alt: "Blue convertible grand tourer placeholder for BMW M440i Convertible",
    specs: ["M Performance", "Convertible", "Sky blue wrap", "4 seats"],
    bestFor: "Summer weekends, coastal drives, weddings and expressive arrivals.",
    summary:
      "A polished open-top grand tourer with a distinctive sky blue look and easy everyday drivability.",
  },
  {
    slug: "bmw-m140i-shadow-edition",
    name: "BMW M140i Shadow Edition",
    year: "2019",
    finish: "Shadow Edition",
    category: "Hot hatch",
    rate: 175,
    deposit: 600,
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=84",
    alt: "Premium compact performance car placeholder for BMW M140i Shadow Edition",
    specs: ["B58 engine", "Rear-wheel drive", "Shadow trim", "5 seats"],
    bestFor: "Driver-focused weekends, city bookings and accessible performance.",
    summary:
      "A compact performance favourite with a premium cabin, strong pace and understated Shadow Edition styling.",
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
          <a href="#reviews">Reviews</a>
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
                  <img src={car.image} alt={car.alt} loading="lazy" />
                  <span>{car.year}</span>
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
            <img src={selectedCar.image} alt={selectedCar.alt} />
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
