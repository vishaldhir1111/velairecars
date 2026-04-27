import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import {
  Car,
  CalendarDays,
  ShieldCheck,
  Phone,
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
} from "lucide-react";
import "./styles.css";

const WHATSAPP_NUMBER = "447845589543";
const BUSINESS_NAME = "Velaire Cars";
const BUSINESS_ADDRESS = "42 Bell Road, Hounslow TW3 3PB, UK";
const BUSINESS_PHONE = "+44 7845 589543";
const BUSINESS_EMAIL = "info@velairecars.co.uk";

const vehicles = [
  {
    id: 1,
    type: "Rental",
    make: "Tesla",
    model: "Model 3 Performance",
    year: 2020,
    colour: "White exterior / white interior",
    price: "Enquire for rental rates",
    salePrice: null,
    highlight: "Electric performance saloon with premium white cabin.",
    fuel: "Electric",
    gearbox: "Auto",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1400&auto=format&fit=crop",
    badge: "White Interior",
  },
  {
    id: 2,
    type: "Sale",
    make: "BMW",
    model: "M140i M Sport",
    year: 2019,
    colour: "Black exterior with kit",
    price: null,
    salePrice: "Enquire to buy",
    highlight: "Performance hatch with aggressive styling kit.",
    fuel: "Petrol",
    gearbox: "Auto",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1400&auto=format&fit=crop",
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
    salePrice: null,
    highlight: "Luxury performance SUV with serious road presence.",
    fuel: "Petrol",
    gearbox: "Auto",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1400&auto=format&fit=crop",
    badge: "SVR",
  },
  {
    id: 4,
    type: "Rental",
    make: "Mercedes-Benz",
    model: "G63 AMG",
    year: 2019,
    colour: "Grey exterior",
    price: "Enquire for rental rates",
    salePrice: null,
    highlight: "Iconic AMG luxury SUV for premium occasions.",
    fuel: "Petrol",
    gearbox: "Auto",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=1400&auto=format&fit=crop",
    badge: "AMG G-Wagon",
  },
];

function whatsappLink(vehicle) {
  const message = vehicle
    ? `Hi Velaire Cars, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}. Is it available?`
    : "Hi Velaire Cars, I'm interested in your luxury car rental/dealership services.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function Button({ children, className = "", ...props }) {
  return <button className={`btn ${className}`} {...props}>{children}</button>;
}

function VehicleCard({ vehicle }) {
  return (
    <article className="vehicle-card">
      <div className="vehicle-image-wrap">
        <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="vehicle-image" />
        <div className="image-fade" />
        <div className="pill pill-light top-left">{vehicle.type}</div>
        <div className="pill pill-dark bottom-right">{vehicle.badge}</div>
      </div>
      <div className="vehicle-body">
        <div className="vehicle-head">
          <div>
            <p className="eyebrow small">{vehicle.year}</p>
            <h3>{vehicle.make} {vehicle.model}</h3>
            <p className="muted">{vehicle.highlight}</p>
          </div>
          <p className="vehicle-price">{vehicle.type === "Rental" ? vehicle.price : vehicle.salePrice}</p>
        </div>
        <div className="spec-grid">
          <div><Gauge size={16} />{vehicle.colour}</div>
          <div><Fuel size={16} />{vehicle.fuel}</div>
          <div><Settings size={16} />{vehicle.gearbox}</div>
        </div>
        <div className="card-actions">
          <a className="btn btn-soft" href="#finance">View Details</a>
          <a className="btn btn-dark" href={whatsappLink(vehicle)} target="_blank" rel="noreferrer"><MessageCircle size={17} />Enquire</a>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filteredVehicles = useMemo(() => vehicles.filter((vehicle) => {
    const matchesFilter = filter === "All" || vehicle.type === filter;
    const query = `${vehicle.make} ${vehicle.model} ${vehicle.year} ${vehicle.colour}`.toLowerCase();
    return matchesFilter && query.includes(search.toLowerCase());
  }), [filter, search]);

  return (
    <main>
      <a href={whatsappLink()} target="_blank" rel="noreferrer" className="floating-whatsapp"><MessageCircle size={20} /> WhatsApp</a>
      <section className="hero">
        <div className="hero-bg"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1800&auto=format&fit=crop" alt="Luxury car background" /></div>
        <div className="container hero-inner">
          <nav className="nav">
            <div className="brand"><div className="brand-icon"><Car size={24} /></div><div><p>{BUSINESS_NAME}</p><span>Luxury Car Rental • Sales • Finance</span></div></div>
            <div className="nav-links"><a href="#stock">Stock</a><a href="#rentals">Rentals</a><a href="#finance">Finance</a><a href="#contact">Contact</a></div>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn btn-white"><MessageCircle size={17} /> WhatsApp</a>
          </nav>
          <div className="hero-grid">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="hero-pill">Luxury rental and dealership experience</div>
              <h1>Luxury car rental and sales in West London.</h1>
              <p className="hero-copy">Explore selected rental vehicles and dealership stock from Velaire Cars in Hounslow. Message us on WhatsApp for bookings, viewings, finance enquiries and part exchange.</p>
              <div className="hero-actions"><a href="#stock" className="btn btn-white">Explore Stock <ArrowRight size={17} /></a><a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn btn-glass"><MessageCircle size={17} /> Book via WhatsApp</a></div>
              <div className="stats"><div><strong>4</strong><span>Featured Cars</span></div><div><strong>£99</strong><span>Reserve Option</span></div><div><strong>Fast</strong><span>WhatsApp Replies</span></div></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="featured-card">
              <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1400&auto=format&fit=crop" alt="Featured car" />
              <div><span>Featured rental</span><h2>Range Rover SVR</h2><strong>Enquire<br />for rates</strong></div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container feature-row">
        {[[CalendarDays,"Flexible Rentals","Daily, weekly and monthly rental enquiries."],[CreditCard,"Reserve Option","Reserve a vehicle after checks and confirmation."],[ShieldCheck,"Verified Process","ID, licence and deposit checks before handover."],[Star,"Curated Stock","Luxury, performance and prestige vehicles."]].map(([Icon,title,text]) => <div className="feature" key={title}><Icon size={28}/><h3>{title}</h3><p>{text}</p></div>)}
      </section>

      <section id="stock" className="container stock-section">
        <div className="stock-head"><div><p className="eyebrow">Velaire Collection</p><h2>Luxury Rentals & Cars For Sale</h2><p className="muted big">Browse the current featured collection. Enquire directly via WhatsApp for availability, viewings, rental requirements and reservations.</p></div><div className="filters"><div className="tabs">{["All","Rental","Sale"].map(item => <button key={item} onClick={() => setFilter(item)} className={filter === item ? "active" : ""}>{item}</button>)}</div><label className="search"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cars..." /></label></div></div>
        <div className="vehicle-grid">{filteredVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
      </section>

      <section id="finance" className="finance-section">
        <div className="container finance-grid"><div><p className="eyebrow muted-light">Finance & Part Exchange</p><h2>Make an enquiry today.</h2><p>Looking to rent, buy, reserve, finance or part exchange? Send a quick enquiry and Velaire Cars will respond directly on WhatsApp.</p><div className="check-list">{["Rental and sales enquiries handled directly","Manual approval before payment or handover","Simple WhatsApp process to keep costs low"].map(text => <div key={text}><CheckCircle2 size={20}/>{text}</div>)}</div></div><form className="enquiry-card" onSubmit={(e) => e.preventDefault()}><input placeholder="Full name"/><input placeholder="Phone number"/><input placeholder="Email address"/><select><option>I'm interested in...</option><option>Renting a car</option><option>Buying a car</option><option>Finance</option><option>Part exchange</option></select><textarea placeholder="Message"/><a href={whatsappLink()} target="_blank" rel="noreferrer" className="btn btn-dark full"><MessageCircle size={17}/> Send Enquiry on WhatsApp</a><small>Lowest-cost setup: enquiries go through WhatsApp first, forms can be connected later.</small></form></div>
      </section>

      <section className="container trust-panel">{[[Clock,"Fast response","Message us directly for availability and viewings."],[ShieldCheck,"Pre-handover checks","Licence, ID and deposit checks before rentals."],[Phone,"Direct contact","No complicated booking system needed at launch."]].map(([Icon,title,text]) => <div key={title}><Icon size={28}/><h3>{title}</h3><p>{text}</p></div>)}</section>

      <footer id="contact"><div className="container footer-grid"><div><div className="footer-brand"><div className="brand-icon dark"><Car size={20}/></div><strong>{BUSINESS_NAME}</strong></div><p>Premium car rental and dealership services based in Hounslow, West London. Luxury vehicles with a direct WhatsApp booking experience.</p></div><div className="contact-list"><p><MapPin size={16}/>{BUSINESS_ADDRESS}</p><p><Phone size={16}/>{BUSINESS_PHONE}</p><p><Mail size={16}/>{BUSINESS_EMAIL}</p></div><div className="footer-cta"><a className="btn btn-dark" href={whatsappLink()} target="_blank" rel="noreferrer"><MessageCircle size={17}/> Message Now</a></div></div><div className="container copyright">© 2026 {BUSINESS_NAME}. All rights reserved. Terms • Privacy • Rental Policy</div></footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
