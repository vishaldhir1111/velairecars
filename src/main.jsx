
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Car,
  Phone,
  MessageCircle,
  Search,
  Fuel,
  Settings,
  Users,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import "./styles.css";

const WHATSAPP_NUMBER = "447845589543";
const BUSINESS_PHONE = "+44 7845 589543";
const BUSINESS_NAME = "Velaire Cars";
const BUSINESS_ADDRESS = "42 Bell Road, Hounslow TW3 3PB, UK";

const fleet = [
  {
    id: 1,
    make: "BMW",
    model: "M140i M Sport",
    year: 2019,
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 Seats",
    badge: "High demand this week",
    image: "/cars/bmw-m140i.png",
    message: "Hi Velaire Cars, I'm interested in renting the 2019 BMW M140i M Sport. Is it available?",
  },
  {
    id: 2,
    make: "Range Rover",
    model: "SVR",
    year: 2020,
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 Seats",
    badge: "Weekend availability",
    image: "/cars/range-rover-svr.png",
    message: "Hi Velaire Cars, I'm interested in renting the 2020 Range Rover SVR. Is it available?",
  },
  {
    id: 3,
    make: "Mercedes",
    model: "G63 AMG",
    year: 2021,
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 Seats",
    badge: "Limited dates",
    image: "/cars/g63-grey.png",
    message: "Hi Velaire Cars, I'm interested in renting the 2021 Mercedes G63 AMG. Is it available?",
  },
  {
    id: 4,
    make: "Tesla",
    model: "Model 3 Performance",
    year: 2020,
    fuel: "Electric",
    gearbox: "Auto",
    seats: "5 Seats",
    badge: "High demand this week",
    image: "/cars/tesla-model3.png",
    message: "Hi Velaire Cars, I'm interested in renting the 2020 Tesla Model 3 Performance. Is it available?",
  },
];

function whatsappLink(message = "Hi Velaire Cars, I'm interested in your luxury car rental services.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function callLink() {
  return `tel:${BUSINESS_PHONE.replace(/\s/g, "")}`;
}

function VehicleCard({ car }) {
  return (
    <article className="car-card">
      <div className="car-image-wrap">
        <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} className="car-image" />
        <div className="corner-badge">{car.badge}</div>
      </div>

      <div className="car-content">
        <h3>{car.year} {car.make} {car.model}</h3>

        <div className="car-specs">
          <span><Fuel size={15} /> {car.fuel}</span>
          <span><Settings size={15} /> {car.gearbox}</span>
          <span><Users size={15} /> {car.seats}</span>
        </div>

        <a className="rental-link" href={whatsappLink(car.message)} target="_blank" rel="noreferrer">
          Enquire for rental rates <ArrowRight size={16} />
        </a>
      </div>
    </article>
  );
}

function App() {
  const [search, setSearch] = useState("");

  const filteredFleet = useMemo(() => {
    const q = search.toLowerCase();
    return fleet.filter((car) => `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(q));
  }, [search]);

  return (
    <main>
      <section className="hero">
        <div className="hero-glow" />

        <nav className="nav">
          <a href="#top" className="brand">
            <div className="brand-mark">V</div>
            <div>
              <strong>VELAIRE</strong>
              <span>CARS</span>
            </div>
          </a>

          <div className="nav-links">
            <a href="#fleet">Fleet</a>
            <a href="#enquiry">Enquiry</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="nav-actions">
            <a href={callLink()} className="phone-link">
              <Phone size={24} />
              <span>Call Now<br /><b>{BUSINESS_PHONE}</b></span>
            </a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="outline-button">
              <MessageCircle size={20} /> WhatsApp
            </a>
          </div>
        </nav>

        <div className="hero-inner" id="top">
          <div className="hero-copy">
            <p className="micro">Premium fleet • Hounslow • West London</p>
            <h1>Luxury car rental</h1>
            <h2>in West London</h2>
            <div className="gold-line" />
            <p>
              Premium vehicles for every occasion. Enquire on WhatsApp or call us directly for availability, rental checks and collection details.
            </p>

            <div className="hero-buttons">
              <a href={callLink()} className="gold-button"><Phone size={20} /> Call Now</a>
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="outline-button large">
                <MessageCircle size={20} /> WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-car">
            <img src="/cars/hero-tesla.png" alt="White Tesla Model 3 Performance" />
          </div>
        </div>
      </section>

      <section className="fleet-section" id="fleet">
        <div className="section-heading">
          <span>Our Fleet</span>
          <h2>Luxury vehicles available for rental</h2>
        </div>

        <div className="search-row">
          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search BMW, Range Rover, G63, Tesla..."
            />
          </div>
        </div>

        <div className="fleet-grid">
          {filteredFleet.map((car) => (
            <VehicleCard car={car} key={car.id} />
          ))}
        </div>
      </section>

      <section className="trust-section" id="about">
        <div className="trust-card">
          <ShieldCheck size={28} />
          <h3>Verified rental process</h3>
          <p>ID, licence, deposit and rental checks are required before handover.</p>
        </div>
        <div className="trust-card">
          <Clock size={28} />
          <h3>Fast response</h3>
          <p>Call or WhatsApp directly for availability, pricing and collection times.</p>
        </div>
        <div className="trust-card">
          <MapPin size={28} />
          <h3>West London based</h3>
          <p>{BUSINESS_ADDRESS}</p>
        </div>
      </section>

      <section className="enquiry-section" id="enquiry">
        <div>
          <span>Enquiry</span>
          <h2>Need availability today?</h2>
          <p>Message Velaire Cars now and tell us which vehicle, dates and rental length you need.</p>
        </div>
        <div className="enquiry-actions">
          <a href={callLink()} className="gold-button"><Phone size={20} /> Call Now</a>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="outline-button large">
            <MessageCircle size={20} /> WhatsApp Us
          </a>
        </div>
      </section>

      <footer id="contact">
        <div className="footer-brand">
          <Car size={22} />
          <strong>{BUSINESS_NAME}</strong>
        </div>
        <p>{BUSINESS_ADDRESS}</p>
        <p>{BUSINESS_PHONE}</p>
      </footer>

      <div className="sticky-contact">
        <a href={callLink()}><Phone size={19} /> Call Now: {BUSINESS_PHONE}</a>
        <a href={whatsappLink()} target="_blank" rel="noreferrer"><MessageCircle size={19} /> WhatsApp Us</a>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
