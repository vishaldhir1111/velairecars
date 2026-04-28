import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function selectCar(car){
  localStorage.setItem("selectedCar", JSON.stringify(car));
}

const cars = [
  {
    title:"Tesla Model 3 Performance",
    year:"2020",
    price:"£129",
    image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600"
  },
  {
    title:"Range Rover SVR",
    year:"2021",
    price:"£299",
    image:"https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
  },
  {
    title:"BMW 530e M Sport",
    year:"2022",
    price:"£149",
    image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600"
  },
  {
    title:"BMW M140i Shadow Edition",
    year:"2019",
    price:"£119",
    image:"https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600"
  }
];

function App(){
  const [selected, setSelected] = useState(null);

  return (
    <main className="app">

      {/* NAV */}
      <nav className="nav">
        <div className="logo">VELAIRE <span>CARS</span></div>

        <div className="nav-links">
          <a>Home</a>
          <a href="#fleet">Fleet</a>
          <a>Contact</a>
        </div>

        <button className="nav-btn">Reserve Now</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="tag">PREMIUM CAR RENTALS</p>

          <h1>
            DRIVE LUXURY.<br/>
            <span>LIVE EXTRAORDINARY.</span>
          </h1>

          <p>Premium performance vehicles delivered across London.</p>

          <div className="hero-buttons">
            <button className="btn-primary">Browse Fleet</button>
            <button className="btn-outline">WhatsApp Us</button>
          </div>
        </div>

        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
        />
      </section>

      {/* FLEET */}
      <section id="fleet" className="fleet">
        <h2>Our Premium Fleet</h2>

        <div className="grid">
          {cars.map(car => (
            <div className="card" key={car.title}>

              <img src={car.image} />

              <div className="card-body">
                <h3>{car.title}</h3>
                <p>{car.year}</p>

                <strong>{car.price} <span>/day</span></strong>

                <button onClick={()=>{
                  selectCar(car);
                  window.location.href = "booking.html";
                }}>
                  View Details
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
