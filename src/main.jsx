import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import "./styles.css";

//////////////////////////////
// 🔥 SAVE SELECTED CAR
//////////////////////////////
function selectCar(car){
  localStorage.setItem("selectedCar", JSON.stringify(car))
}

const cars = [
  {
    title:"Tesla Model 3 Performance",
    year:"2020",
    price:"£129",
    images:[
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600&auto=format&fit=crop"
    ]
  },
  {
    title:"Range Rover SVR",
    year:"2021",
    price:"£299",
    images:[
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600&auto=format&fit=crop"
    ]
  }
];

function CarCard({car,onOpen}) {
  return (
    <motion.article className="car-card" whileHover={{ y: -8 }}>

      {/* CLICK IMAGE */}
      <button 
        className="img-btn"
        onClick={()=>{
          selectCar(car)
          onOpen(car)
        }}
      >
        <img src={car.images[0]} alt={car.title}/>
        <span className="heart"><Heart size={16}/></span>
      </button>

      <div className="car-body">
        <h3>{car.title}</h3>
        <p>{car.year}</p>
        <strong>{car.price}/day</strong>

        {/* CLICK BUTTON */}
        <button 
          className="outline action-button"
          onClick={()=>{
            selectCar(car)
            onOpen(car)
          }}
        >
          View Details
        </button>
      </div>

    </motion.article>
  );
}

function Detail({car,onClose}) {
  if(!car) return null;

  return (
    <AnimatePresence>
      <motion.div className="overlay">
        <motion.div className="modal">

          <button className="close" onClick={onClose}><X/></button>

          <img 
            src={car.images[0]} 
            style={{width:"100%", borderRadius:"12px"}} 
          />

          <h2>{car.title}</h2>
          <p className="price">{car.price}/day</p>

          <div className="modal-actions">
            <a href="/booking.html" className="btn primary">
              Reserve This Car
            </a>

            <a 
              href={`https://wa.me/447845589543?text=Hi I want ${car.title}`}
              className="btn outline"
              target="_blank"
            >
              WhatsApp
            </a>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function App(){
  const [selected,setSelected]=useState(null);

  return (
    <main className="app">

      {/* NAV */}
      <nav className="nav">
        <div className="logo">VELAIRE <span>CARS</span></div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#fleet">Fleet</a>
          <a href="#">Contact</a>
        </div>

        <a className="nav-btn" href="#fleet">Reserve Now</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Drive Luxury.<br/>Live Different.</h1>
          <p>Premium performance vehicles delivered across London.</p>

          <div className="hero-buttons">
            <a href="#fleet" className="btn primary">Browse Fleet</a>
            <a href="#" className="btn outline">Contact Us</a>
          </div>
        </div>

        <div className="hero-img">
          <img src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600&auto=format&fit=crop"/>
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" className="fleet">
        <h2>Our Premium Fleet</h2>

        <div className="grid">
          {cars.map(car=>(
            <CarCard 
              key={car.title}
              car={car}
              onOpen={setSelected}
            />
          ))}
        </div>
      </section>

      {/* MODAL */}
      <Detail 
        car={selected}
        onClose={()=>setSelected(null)}
      />

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
