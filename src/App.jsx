import React from "react";
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
          <p className="tag">PREMIUM CAR RENTALS</p>
          <h1>
            DRIVE LUXURY.<br/>
            <span>LIVE EXTRAORDINARY.</span>
          </h1>
          <p>Experience the finest luxury vehicles in London.</p>
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
              <p>2022 • Automatic • Petrol</p>
              <strong>£299 /day</strong>
              <button>View Details</button>
            </div>
          </div>

          <div className="card">
            <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600"/>
            <div className="card-body">
              <h3>BMW 530e</h3>
              <p>2021 • Automatic • Hybrid</p>
              <strong>£149 /day</strong>
              <button>View Details</button>
            </div>
          </div>

        </div>

      </section>

    </main>
  );
}

export default App;
