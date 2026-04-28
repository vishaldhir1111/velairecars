import React from "react";

const fleetCars = [
  {
    title: "TESLA MODEL 3",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "BMW M140i",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "RANGE ROVER SVR",
    image:
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "MERCEDES G63 AMG",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function App() {
  return (
    <div className="site">
      <header className="topbar">
        <div className="brand">
          <div className="brand-main">VELAIRE</div>
          <div className="brand-sub">CARS</div>
        </div>

        <nav className="nav">
          <a href="#home">HOME</a>
          <a href="#fleet">OUR CARS</a>
          <a href="#book">BOOK NOW</a>
          <a href="#about">ABOUT US</a>
          <a href="#faq">FAQS</a>
          <a href="#contact">CONTACT</a>
        </nav>

        <div className="top-actions">
          <button className="book-btn">BOOK NOW</button>
          <button className="icon-btn">◯</button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-copy">
              <h1>
                PREMIUM CARS.
                <br />
                EXCLUSIVE DRIVING.
              </h1>

              <h2>LUXURY CAR RENTAL IN THE UK</h2>

              <p>Drive prestige. Make an impression.</p>

              <div className="hero-buttons">
                <a className="btn btn-gold" href="#fleet">
                  VIEW OUR CARS
                </a>
                <a className="btn btn-outline" href="#contact">
                  WHATSAPP US
                </a>
              </div>
            </div>

            <div className="hero-image-wrap">
              <img
                className="hero-image"
                src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2000&auto=format&fit=crop"
                alt="Tesla"
              />
            </div>
          </div>
        </section>

        <section className="features-strip">
          <div className="feature">
            <div className="feature-icon">🛡</div>
            <div>
              <strong>FULLY INSURED</strong>
              <span>Your safety is our priority</span>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">🗓</div>
            <div>
              <strong>FLEXIBLE RENTALS</strong>
              <span>Daily, weekly & monthly</span>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">◈</div>
            <div>
              <strong>PREMIUM VEHICLES</strong>
              <span>Handpicked luxury cars</span>
            </div>
          </div>

          <div className="feature">
            <div className="feature-icon">💬</div>
            <div>
              <strong>24/7 SUPPORT</strong>
              <span>We’re here for you</span>
            </div>
          </div>
        </section>

        <section className="fleet-section" id="fleet">
          <div className="section-title-wrap">
            <div className="section-line" />
            <h2>OUR LUXURY FLEET</h2>
            <div className="section-line" />
          </div>

          <div className="fleet-grid">
            {fleetCars.map((car) => (
              <article className="fleet-card" key={car.title}>
                <div className="fleet-image-wrap">
                  <img src={car.image} alt={car.title} />
                </div>

                <div className="fleet-body">
                  <h3>{car.title}</h3>
                  <button className="card-btn">VIEW CAR</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
