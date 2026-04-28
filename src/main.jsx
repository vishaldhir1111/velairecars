import React from "react";
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
    title:"BMW M140i",
    year:"2019",
    price:"£119",
    image:"https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600"
  }
];

function App(){
  return (
    <main>

      {/* NAV */}
      <nav className="nav">
        <h2>VELAIRE <span>CARS</span></h2>
        <a href="#fleet">Reserve Now</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            DRIVE LUXURY.<br/>
            <span>LIVE EXTRAORDINARY.</span>
          </h1>

          <p>
            London’s premier luxury and performance car rental experience.
          </p>

          <div className="hero-buttons">
            <a href="#fleet" className="btn primary">Browse Fleet</a>
            <a href="#" className="btn outline">WhatsApp Us</a>
          </div>
        </div>

        <img src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"/>
      </section>

      {/* SEARCH BAR */}
      <section className="search">
        <input placeholder="Pick-up Location"/>
        <input type="date"/>
        <input type="time"/>
        <button>Search Cars</button>
      </section>

      {/* FLEET */}
      <section id="fleet" className="fleet">
        <h2>Our Premium Fleet</h2>

        <div className="grid">
          {cars.map(car=>(
            <div className="card" key={car.title}>
              <img src={car.image}/>
              <div className="card-body">
                <h3>{car.title}</h3>
                <p>{car.year}</p>
                <strong>{car.price}/day</strong>

                <button onClick={()=>{
                  selectCar(car);
                  window.location.href="booking.html";
                }}>
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews">
        <h2>Customer Reviews</h2>

        <div className="reviews-grid">
          <div className="review">
            ⭐⭐⭐⭐⭐
            <p>Best rental experience ever.</p>
            <span>- James</span>
          </div>

          <div className="review">
            ⭐⭐⭐⭐⭐
            <p>Car arrived spotless and on time.</p>
            <span>- Sarah</span>
          </div>

          <div className="review">
            ⭐⭐⭐⭐⭐
            <p>Luxury service from start to finish.</p>
            <span>- Daniel</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © Velaire Cars — Luxury Car Hire London
      </footer>

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
