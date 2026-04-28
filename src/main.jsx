import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App(){
  return (
    <main>

      <nav className="nav">
        <div className="logo">VELAIRE <span>CARS</span></div>
        <div className="nav-links">
          <a>Home</a>
          <a>Fleet</a>
          <a>Contact</a>
        </div>
        <button className="nav-btn">Reserve Now</button>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <h1>
            DRIVE LUXURY.<br/>
            <span>LIVE EXTRAORDINARY.</span>
          </h1>
        </div>

        <img 
          className="hero-img"
          src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
        />
      </section>

      <section className="fleet">
        <h2>Our Premium Fleet</h2>

        <div className="grid">

          <div className="card">
            <img src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"/>
            <div className="card-body">
              <h3>Range Rover SVR</h3>
              <p>2022</p>
              <strong>£299 <span>/day</span></strong>
              <button>View Details</button>
            </div>
          </div>

          <div className="card">
            <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600"/>
            <div className="card-body">
              <h3>BMW 530e</h3>
              <p>2021</p>
              <strong>£149 <span>/day</span></strong>
              <button>View Details</button>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
