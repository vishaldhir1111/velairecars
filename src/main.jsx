
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  CalendarDays,
  ShieldCheck,
  MessageCircle,
  Search,
  Gauge,
  Fuel,
  Settings,
  CreditCard,
  Star,
  MapPin,
  Mail,
  ArrowRight,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  Users,
  BadgeCheck,
  FileText,
  WalletCards,
  KeyRound,
} from "lucide-react";
import "./styles.css";

const WHATSAPP_NUMBER = "447845589543";
const BUSINESS_NAME = "Velaire Cars";
const BUSINESS_ADDRESS = "42 Bell Road, Hounslow TW3 3PB, UK";
const BUSINESS_PHONE = "+44 7845 589543";
const BUSINESS_EMAIL = "info@velairecars.co.uk";

// Replace this later with your real Stripe Payment Link
const RESERVE_PAYMENT_LINK = "https://buy.stripe.com/test_replace_this_link";

const vehicles = [
  {
    id: 1,
    type: "Rental",
    make: "Tesla",
    model: "Model 3 Performance",
    year: 2020,
    colour: "White exterior / white interior",
    price: "Enquire for rental rates",
    highlight: "Electric performance saloon with premium white cabin.",
    urgency: "High demand this week",
    fuel: "Electric",
    gearbox: "Auto",
    seats: "5 seats",
    drivetrain: "Dual motor AWD",
    power: "Performance EV powertrain",
    acceleration: "Approx. 0–60 mph in 3.1 seconds",
    idealFor: "Daily luxury, business trips, airport runs, content shoots and performance EV experiences.",
    interior: "Minimal white interior, panoramic glass roof, heated seats, premium audio feel and large touchscreen cabin.",
    exterior: "Clean white exterior with a sharp modern road presence.",
    requirements: "Valid driving licence, ID verification, refundable deposit and rental approval required before handover.",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1400&auto=format&fit=crop",
    badge: "White Interior",
  },
  {
    id: 2,
    type: "Rental",
    make: "BMW",
    model: "M140i M Sport",
    year: 2019,
    colour: "Black exterior with kit",
    price: "Enquire for rental rates",
    highlight: "Performance hatch with aggressive styling kit.",
    urgency: "High demand this week",
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 seats",
    drivetrain: "Rear-wheel drive style performance feel",
    power: "3.0L turbocharged straight-six",
    acceleration: "Approx. 0–60 mph in 4.6 seconds",
    idealFor: "Weekend use, content shoots, performance hatch experience and premium short-term rental.",
    interior: "Driver-focused BMW cabin with M Sport details, practical hatchback layout and premium everyday usability.",
    exterior: "Black exterior with aggressive kit styling for a stronger street presence.",
    requirements: "Valid driving licence, ID verification, refundable deposit and rental approval required before handover.",
    image: "/cars/bmw-m140i-black.jpg",
    badge: "M Sport Kit",
  },
  {
    id: 3,
    type: "Rental",
    make: "Range Rover",
    model: "SVR",
    year: 2020,
    colour: "Blue exterior",
    price: "Enquire for rental rates",
    highlight: "Luxury performance SUV with serious road presence.",
    urgency: "Weekend availability",
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 seats",
    drivetrain: "4WD performance SUV",
    power: "5.0L supercharged V8",
    acceleration: "Approx. 0–60 mph in 4.3 seconds",
    idealFor: "Premium events, weddings, weekends, executive use, airport transfers and luxury SUV presence.",
    interior: "High seating position, luxury cabin materials, performance SUV layout and comfortable premium space.",
    exterior: "Blue SVR exterior with strong stance and high-end road presence.",
    requirements: "Valid driving licence, ID verification, refundable deposit and rental approval required before handover.",
    image: "/cars/range-rover-svr-blue.jpg",
    badge: "SVR",
  },
  {
    id: 4,
    type: "Rental",
    make: "Mercedes-Benz",
    model: "G63 AMG",
    year: 2021,
    colour: "Grey exterior",
    price: "Enquire for rental rates",
    highlight: "Iconic AMG luxury SUV for premium occasions.",
    urgency: "Limited dates",
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 seats",
    drivetrain: "AMG 4MATIC",
    power: "4.0L twin-turbo V8",
    acceleration: "Approx. 0–60 mph in 4.5 seconds",
    idealFor: "Luxury events, weddings, VIP travel, premium weekends and high-impact arrivals.",
    interior: "Commanding AMG cabin with luxury seating, premium tech and a strong executive SUV feel.",
    exterior: "Grey G-Wagon exterior with signature boxy AMG road presence.",
    requirements: "Valid driving licence, ID verification, refundable deposit and rental approval required before handover.",
    image: "/cars/g63-grey.jpg",
    badge: "AMG G-Wagon",
  },
];

function whatsappMessage(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function whatsappLink(vehicle) {
  return whatsappMessage(
    vehicle
      ? `Hi Velaire Cars, I'm interested in renting the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it available?`
      : "Hi Velaire Cars, I'm interested in your luxury car rental services."
  );
}

function whatsappCallRequest(vehicle) {
  return whatsappMessage(
    vehicle
      ? `Hi Velaire Cars, please call me about the ${vehicle.year} ${vehicle.make} ${vehicle.model}.`
      : "Hi Velaire Cars, please call me about luxury car rental."
  );
}

function reserveLink(vehicle) {
  const msg = `Hi Velaire Cars, I want to reserve the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Please confirm availability before I pay the £99 reserve fee.`;
  return whatsappMessage(msg);
}

function ButtonLink({ children, className = "", ...props }) {
  return (
    <a className={`btn ${className}`} {...props}>
      {children}
    </a>
  );
}

function VehicleCard({ vehicle, onSelect }) {
  return (
    <article className="vehicle-card">
      <button className="vehicle-image-wrap clean-button" onClick={() => onSelect(vehicle)} aria-label={`View ${vehicle.make} ${vehicle.model}`}>
        <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="vehicle-image" />
        <div className="image-fade" />
        <div className="pill pill-light top-left">{vehicle.type}</div>
        <div className="pill pill-dark bottom-right">{vehicle.badge}</div>
        {vehicle.urgency && <div className="pill pill-light bottom-left">{vehicle.urgency}</div>}
      </button>

      <div className="vehicle-body">
        <div className="vehicle-head">
          <div>
            <p className="eyebrow small">{vehicle.year}</p>
            <button className="title-button" onClick={() => onSelect(vehicle)}>
              {vehicle.make} {vehicle.model}
            </button>
            <p className="muted">{vehicle.highlight}</p>
          </div>
          <p className="vehicle-price">{vehicle.price}</p>
        </div>

        <div className="spec-grid">
          <div><Gauge size={16} />{vehicle.colour}</div>
          <div><Fuel size={16} />{vehicle.fuel}</div>
          <div><Settings size={16} />{vehicle.gearbox}</div>
        </div>

        <div className="card-actions three">
          <button className="btn btn-soft" onClick={() => onSelect(vehicle)}>Details</button>
          <ButtonLink className="btn-soft" href={whatsappCallRequest(vehicle)} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> WhatsApp Call
          </ButtonLink>
          <ButtonLink className="btn-dark" href={whatsappLink(vehicle)} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> WhatsApp
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

function DetailModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  const specs = [
    ["Year", vehicle.year],
    ["Colour", vehicle.colour],
    ["Fuel", vehicle.fuel],
    ["Gearbox", vehicle.gearbox],
    ["Seats", vehicle.seats],
    ["Drivetrain", vehicle.drivetrain],
    ["Powertrain", vehicle.power],
    ["Performance", vehicle.acceleration],
  ];

  return (
    <AnimatePresence>
      <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.section className="detail-modal" initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={22} />
          </button>

          <div className="detail-hero">
            <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} />
            <div className="detail-overlay">
              <div>
                <p className="eyebrow">{vehicle.badge}</p>
                <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                <p>{vehicle.highlight}</p>
              </div>
            </div>
          </div>

          <div className="detail-content">
            <div className="detail-main">
              <div className="section-kicker">Vehicle Overview</div>
              <h3>Ultra-detailed rental profile</h3>
              <p className="detail-copy">
                The {vehicle.year} {vehicle.make} {vehicle.model} is available through Velaire Cars for premium rental enquiries in West London. This vehicle is positioned for customers who want strong road presence, a high-end experience and a simple direct booking process through WhatsApp.
              </p>

              <div className="detail-grid">
                {specs.map(([label, value]) => (
                  <div key={label} className="detail-spec">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className="info-blocks">
                <div>
                  <Sparkles size={22} />
                  <h4>Best for</h4>
                  <p>{vehicle.idealFor}</p>
                </div>
                <div>
                  <Users size={22} />
                  <h4>Interior</h4>
                  <p>{vehicle.interior}</p>
                </div>
                <div>
                  <Car size={22} />
                  <h4>Exterior</h4>
                  <p>{vehicle.exterior}</p>
                </div>
                <div>
                  <BadgeCheck size={22} />
                  <h4>Rental checks</h4>
                  <p>{vehicle.requirements}</p>
                </div>
              </div>
            </div>

            <aside className="detail-sidebar">
              <div className="reserve-card">
                <p className="eyebrow small">Reservation</p>
                <h3>Reserve this vehicle</h3>
                <p className="muted">
                  Pay only after availability is confirmed. Message first so Velaire Cars can confirm dates, deposit and rental requirements.
                </p>

                <div className="reserve-price">
                  <span>Reservation fee</span>
                  <strong>£99</strong>
                </div>

                <ButtonLink href={reserveLink(vehicle)} target="_blank" rel="noreferrer" className="btn-dark full">
                  <WalletCards size={18} /> Request £99 Reserve
                </ButtonLink>

                <ButtonLink href={whatsappLink(vehicle)} target="_blank" rel="noreferrer" className="btn-soft full">
                  <MessageCircle size={18} /> WhatsApp Enquiry
                </ButtonLink>

                <ButtonLink href={whatsappCallRequest(vehicle)} target="_blank" rel="noreferrer" className="btn-soft full">
                  <MessageCircle size={18} /> WhatsApp Call Request
                </ButtonLink>

                <a href={RESERVE_PAYMENT_LINK} target="_blank" rel="noreferrer" className="stripe-note">
                  Stripe payment link placeholder
                </a>
              </div>

              <div className="process-card">
                <h4><KeyRound size={18} /> Rental process</h4>
                <ul>
                  <li><FileText size={16} /> Send enquiry</li>
                  <li><BadgeCheck size={16} /> Confirm dates and checks</li>
                  <li><CreditCard size={16} /> Pay reserve/deposit</li>
                  <li><Car size={16} /> Collect vehicle</li>
                </ul>
              </div>
            </aside>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesFilter = filter === "All" || vehicle.type === filter;
      const query = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.colour}`.toLowerCase();
      return matchesFilter && query.includes(search.toLowerCase());
    });
  }, [filter, search]);

  return (
    <main>
      <div className="floating-contact">
        <ButtonLink href={whatsappCallRequest()} target="_blank" rel="noreferrer" className="btn-soft">
          <MessageCircle size={18} /> WhatsApp Call
        </ButtonLink>
        <ButtonLink href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-dark">
          <MessageCircle size={18} /> WhatsApp
        </ButtonLink>
      </div>

      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1800&auto=format&fit=crop" alt="Luxury car background" />
        </div>

        <div className="container hero-inner">
          <nav className="nav">
            <div className="brand">
              <div className="brand-icon"><Car size={24} /></div>
              <div>
                <p>{BUSINESS_NAME}</p>
                <span>Luxury Car Rental • West London</span>
              </div>
            </div>

            <div className="nav-links">
              <a href="#stock">Fleet</a>
              <a href="#enquiry">Enquiry</a>
              <a href="#contact">Contact</a>
            </div>

            <div className="nav-actions">
              <ButtonLink href={whatsappCallRequest()} target="_blank" rel="noreferrer" className="btn-glass">
                <MessageCircle size={17} /> WhatsApp Call
              </ButtonLink>
              <ButtonLink href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-white">
                <MessageCircle size={17} /> WhatsApp
              </ButtonLink>
            </div>
          </nav>

          <div className="hero-grid">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="hero-pill">Luxury rental experience</div>
              <h1>Luxury car rental in West London.</h1>
              <p className="hero-copy">
                Explore selected rental vehicles from Velaire Cars in Hounslow. Click any vehicle for full specifications, rental requirements and reservation options.
              </p>

              <div className="hero-actions">
                <a href="#stock" className="btn btn-white">Explore Fleet <ArrowRight size={17} /></a>
                <ButtonLink href={whatsappCallRequest()} target="_blank" rel="noreferrer" className="btn-glass">
                  <MessageCircle size={17} /> WhatsApp Call
                </ButtonLink>
                <ButtonLink href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-glass">
                  <MessageCircle size={17} /> WhatsApp
                </ButtonLink>
              </div>

              <div className="stats">
                <div><strong>4</strong><span>Featured Cars</span></div>
                <div><strong>£99</strong><span>Reserve Option</span></div>
                <div><strong>West</strong><span>London Based</span></div>
              </div>
            </motion.div>

            <motion.div className="featured-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <img src="/cars/range-rover-svr-blue.jpg" alt="Featured Range Rover SVR" />
              <div>
                <span>Featured rental</span>
                <h2>Range Rover SVR</h2>
                <strong>Enquire<br />for rates</strong>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container feature-row">
        {[
          [CalendarDays, "Flexible Rentals", "Daily, weekly and monthly rental enquiries."],
          [CreditCard, "£99 Reserve Option", "Reservation request after availability confirmation."],
          [ShieldCheck, "Verified Process", "ID, licence and deposit checks before handover."],
          [Star, "Curated Fleet", "Luxury, performance and prestige rental vehicles."],
        ].map(([Icon, title, text]) => (
          <div className="feature-card" key={title}>
            <Icon size={26} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section id="stock" className="container stock-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Our Fleet</p>
            <h2>Luxury vehicles available for rental</h2>
            <p>Click any vehicle image or title to open full specifications and reservation options.</p>
          </div>

          <div className="filters">
            {["All", "Rental"].map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={filter === item ? "active" : ""}>
                {item}
              </button>
            ))}
            <div className="search-box">
              <Search size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fleet..." />
            </div>
          </div>
        </div>

        <div className="vehicle-grid">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={setSelectedVehicle} />
          ))}
        </div>
      </section>

      <section id="enquiry" className="enquiry">
        <div className="container enquiry-grid">
          <div>
            <p className="eyebrow">Enquiry</p>
            <h2>Request availability today.</h2>
            <p>
              Message Velaire Cars directly to confirm dates, requirements, deposits and reservation options before payment.
            </p>
            <div className="check-list">
              {["Direct WhatsApp enquiries", "Reservation request before payment", "ID and licence verification", "West London collection"].map((text) => (
                <div key={text}><CheckCircle2 size={18} />{text}</div>
              ))}
            </div>
          </div>

          <div className="enquiry-card">
            <h3>Fast rental enquiry</h3>
            <p>Choose WhatsApp message or request a callback through WhatsApp.</p>
            <ButtonLink href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-dark full">
              <MessageCircle size={18} /> WhatsApp Message
            </ButtonLink>
            <ButtonLink href={whatsappCallRequest()} target="_blank" rel="noreferrer" className="btn-soft full">
              <MessageCircle size={18} /> WhatsApp Call Request
            </ButtonLink>
            <ButtonLink href={RESERVE_PAYMENT_LINK} target="_blank" rel="noreferrer" className="btn-gold full">
              <CreditCard size={18} /> Pay £99 Reserve Placeholder
            </ButtonLink>
            <span className="tiny">Replace this later with your real Stripe Payment Link.</span>
          </div>
        </div>
      </section>

      <section className="container trust-strip">
        {[
          [Clock, "Fast response", "Message us directly for availability."],
          [ShieldCheck, "Verified handover", "Licence, ID and deposit checks."],
          [MessageCircle, "WhatsApp first", "Simple direct enquiry process."],
        ].map(([Icon, title, text]) => (
          <div key={title}>
            <Icon size={25} />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <footer id="contact">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand">
              <div className="brand-icon"><Car size={22} /></div>
              <div>
                <p>{BUSINESS_NAME}</p>
                <span>Luxury Car Rental</span>
              </div>
            </div>
            <p className="footer-copy">Premium car rental services based in Hounslow, West London.</p>
          </div>

          <div className="contact-lines">
            <p><MapPin size={16} />{BUSINESS_ADDRESS}</p>
            <p><MessageCircle size={16} />{BUSINESS_PHONE}</p>
            <p><Mail size={16} />{BUSINESS_EMAIL}</p>
          </div>

          <div className="footer-actions">
            <ButtonLink href={whatsappCallRequest()} target="_blank" rel="noreferrer" className="btn-soft">
              WhatsApp Call
            </ButtonLink>
            <ButtonLink href={whatsappLink()} target="_blank" rel="noreferrer" className="btn-dark">
              WhatsApp
            </ButtonLink>
          </div>
        </div>

        <div className="container copyright">
          © 2026 {BUSINESS_NAME}. All rights reserved. Terms • Privacy • Rental Policy
        </div>
      </footer>

      <DetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
