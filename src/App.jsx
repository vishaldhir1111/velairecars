import React from "react";

const fleetCars = [
  {
    ribbon: "HIGH DEMAND\nTHIS WEEK",
    title: "2019 BMW M140i M Sport",
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 Seats",
    cta: "ENQUIRE FOR RENTAL RATES",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1400&auto=format&fit=crop",
  },
  {
    ribbon: "WEEKEND\nAVAILABILITY",
    title: "2020 Range Rover SVR",
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 Seats",
    cta: "ENQUIRE FOR RENTAL RATES",
    image:
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1400&auto=format&fit=crop",
  },
  {
    ribbon: "LIMITED\nDATES",
    title: "2021 Mercedes G63 AMG",
    fuel: "Petrol",
    gearbox: "Auto",
    seats: "5 Seats",
    cta: "ENQUIRE FOR RENTAL RATES",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1400&auto=format&fit=crop",
  },
  {
    ribbon: "HIGH DEMAND\nTHIS WEEK",
    title: "2020 Tesla Model 3 Performance",
    fuel: "Electric",
    gearbox: "Auto",
    seats: "5 Seats",
    cta: "ENQUIRE FOR RENTAL RATES",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1400&auto=format&fit=crop",
  },
];

function App() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div className="brand-copy">
            <div className="brand-name">VELAIRE</div>
            <div className="brand-sub">CARS</div>
          </div>
        </div>

        <nav className="main-nav">
          <a href="#fleet">FLEET</a>
          <a href="#enquiry">ENQUIRY</a>
          <a href="#about">ABOUT US</a>
          <a href="#contact">CONTACT</a>
        </nav>

        <div className="header-actions">
          <a className="call-chip" href="tel:+447845589543">
            <span className="chip-icon">📞</span>
            <span>
              <small>Call Now</small>
              <strong>+44 7845 589543</strong>
            </span>
          </a>
          <a
            className="whatsapp-chip"
            href="https://wa.me/447845589543"
            target="_blank"
            rel="noreferrer"
          >
            <span className="chip-icon">◔</span>
            <span>WhatsApp</span>
          </a>
        </div>
      </header>

      <main>
        <section className="hero-panel">
          <div className="hero-left">
            <h1>
              LUXURY CAR
              <br />
              RENTAL
            </h1>

            <div className="hero-location">IN WEST LONDON</div>

            <div className="hero-divider" />

            <p className="hero-text">
              Premium vehicles for every occasion. Enquire on WhatsApp or call
              us directly for availability.
            </p>

            <div className="hero-ctas">
              <a className="btn btn-gold" href="tel:+447845589543">
                <span className="btn-icon">📞</span>
                CALL NOW
              </a>
              <a
                className="btn btn-outline"
                href="https://wa.me/447845589543"
                target="_blank"
                rel="noreferrer"
              >
                <span className="btn-icon">◔</span>
                WHATSAPP
              </a>
            </div>
          </div>

          <div className="hero-right">
            <img
              src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1800&auto=format&fit=crop"
              alt="White Tesla Model 3 Performance"
            />
          </div>
        </section>

        <section className="fleet-heading" id="fleet">
          <div className="section-kicker">OUR FLEET</div>
          <h2>LUXURY VEHICLES AVAILABLE FOR RENTAL</h2>
        </section>

        <section className="fleet-grid">
          {fleetCars.map((car) => (
            <article className="fleet-card" key={car.title}>
              <div className="fleet-ribbon">
                {car.ribbon.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>

              <div className="fleet-image-wrap">
                <img src={car.image} alt={car.title} />
              </div>

              <div className="fleet-card-body">
                <h3>{car.title}</h3>

                <div className="fleet-specs">
                  <span>⛽ {car.fuel}</span>
                  <span>⚙ {car.gearbox}</span>
                  <span>👤 {car.seats}</span>
                </div>

                <button className="fleet-link" type="button">
                  {car.cta} <span>›</span>
                </button>
              </div>
            </article>
          ))}
        </section>

        <section className="bottom-cta-strip" id="enquiry">
          <a href="tel:+447845589543">📞 Call Now: +44 7845 589543</a>
          <span className="strip-divider" />
          <a
            href="https://wa.me/447845589543"
            target="_blank"
            rel="noreferrer"
          >
            ◔ WhatsApp Us
          </a>
        </section>
      </main>
    </div>
  );
}

export default App;
