import React from 'react';
import { createRoot } from 'react-dom/client';
import "./styles.css";

function App(){
  return (
    <main>

      {/* NAV */}
      <nav className="nav">
        <div className="logo">VELAIRE <span>CARS</span></div>

        <div className="nav-links">
          <a>Home</a>
          <a>Fleet</a>
          <a>Services</a>
          <a>Locations</a>
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

          <p className="sub">
            Experience the finest luxury and performance vehicles in London.
          </p>

          <div className="hero-buttons">
            <button className="btn primary">Browse Fleet</button>
            <button className="btn outline">WhatsApp Us</button>
          </div>
        </div>

        <img className="hero-img"
          src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"/>
      </section>

      {/* SEARCH BAR */}
      <section className="search-box">
        <input placeholder="Pick-up Location"/>
        <input type="date"/>
        <input type="time"/>
        <input type="date"/>
        <button>Search Cars</button>
      </section>

      {/* FLEET */}
      <section className="fleet">
  <h2>Our Premium Fleet</h2>

  <div className="grid">

    {[
      {
        title:"Range Rover SVR",
        year:"2022",
        price:"£299",
        img:"https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
      },
      {
        title:"Mercedes G63 AMG",
        year:"2021",
        price:"£399",
        img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1600"
      },
      {
        title:"BMW 530e M Sport",
        year:"2021",
        price:"£149",
        img:"https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600"
      },
      {
        title:"BMW X5 M Sport",
        year:"2024",
        price:"£199",
        img:"https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600"
      }
    ].map(car => (

      <div className="card" key={car.title}>

        <img src={car.img} />

        <div className="card-body">
          <h3>{car.title}</h3>
          <p>{car.year}</p>

          <strong>{car.price} <span>/day</span></strong>

          <button>View Details</button>
        </div>

      </div>

    ))}

  </div>
</section>
        <h2>Our Premium Fleet</h2>

        <div className="grid">

          {[
            {title:"Range Rover SVR",price:"£299",img:"https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"},
            {title:"Mercedes G63",price:"£399",img:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1600"},
            {title:"BMW 530e",price:"£149",img:"https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600"},
            {title:"BMW X5",price:"£199",img:"https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600"}
          ].map(car=>(
            <div className="card">
              <img src={car.img}/>
              <h3>{car.title}</h3>
              <strong>{car.price}/day</strong>
              <button>View Details</button>
            </div>
          ))}

        </div>
      </section>

      {/* REVIEWS */}
      <section className="reviews">
        <h2>Customer Reviews</h2>

        <div className="review-box">
          <h3>Google ⭐ 5.0</h3>
          <p>The car was in perfect condition and service was outstanding.</p>
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
