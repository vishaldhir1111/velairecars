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
    <motion.article 
      className="car-card" 
      whileHover={{ y: -8 }}
    >

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

          <button onClick={onClose}><X/></button>

          <h2>{car.title}</h2>
          <p>{car.price}/day</p>

          <a href="/booking.html" className="btn">
            Reserve This Car
          </a>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function App(){
  const [selected,setSelected]=useState(null);

  return (
    <main>

      <h1 style={{padding:"20px"}}>Velaire Cars</h1>

      <div className="grid">
        {cars.map(car=>(
          <CarCard 
            key={car.title}
            car={car}
            onOpen={setSelected}
          />
        ))}
      </div>

      <Detail 
        car={selected}
        onClose={()=>setSelected(null)}
      />

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
