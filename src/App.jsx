import React from "react";

const cars = [
  {
    name: "Mercedes G63 AMG",
    year: "2021",
    price: "£399/day",
    type: "SUV",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "Tesla Model 3 Performance",
    year: "2020",
    price: "£129/day",
    type: "Electric",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function App() {
  return (
    <div className="site">
      <header className="header">
        <div className="logo">
          <div className="logo-mark">V</div>
          <div className="logo-text">
            <div className="logo-main">VELAIRE</div>
            <div className="logo-sub">CARS</div>
          </div>
        </div>

        <nav className="nav">
          <a href="#fleet">Fleet</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="header-btn" href="#fleet">
          Reserve Now
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">LUXURY CAR RENTAL</p>
            <h1>
              Minimal.
              <br />
              <span>Luxury.</span>
            </h1>
            <p className="hero-text">
              Premium self-drive vehicles in West London. Clean design, elite
              cars, effortless booking.
            </p>

            <div className="hero-actions">
              <a className="btn btn-solid" href="#fleet">
                Browse Fleet
              </a>
              <a className="btn btn-outline" href="#contact">
                Enquire
              </a>
            </div>
          </div>

          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1800&auto=format&fit=crop"
              alt="Tesla Model 3 Performance"
            />
          </div>
        </section>

        <section className="fleet" id="fleet">
          <div className="section-head">
            <p className="eyebrow">OUR FLEET</p>
            <h2>Choose Your Vehicle</h2>
          </div>

          <div className="car-grid">
            {cars.map((car) => (
              <article className="car-card" key={car.name}>
                <div className="car-image-wrap">
                  <img src={car.image} alt={car.name} />
                </div>

                <div className="car-body">
                  <div className="car-topline">
                    <span className="car-type">{car.type}</span>
                    <span className="car-year">{car.year}</span>
                  </div>

                  <h3>{car.name}</h3>
                  <div className="car-price">{car.price}</div>

                  <button className="card-btn">View Details</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about" id="about">
          <div className="about-card">
            <p className="eyebrow">WHY VELAIRE</p>
            <h2>Luxury without clutter.</h2>
            <p>
              A refined rental experience focused on standout vehicles, simple
              booking and premium presentation.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div>
          <div className="footer-brand">VELAIRE CARS</div>
          <p>West London luxury car rental.</p>
        </div>

        <div className="footer-links">
          <a href="tel:+447845589543">+44 7845 589543</a>
          <a href="mailto:info@velairecars.com">info@velairecars.com</a>
        </div>
      </footer>
    </div>
  );
}
