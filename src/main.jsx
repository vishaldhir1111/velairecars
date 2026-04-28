
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Car, CalendarDays, ShieldCheck, MessageCircle, Users, Settings, Fuel, Heart,
  Phone, MapPin, Mail, ArrowRight, X, ChevronLeft, ChevronRight, Bot, Send,
  CreditCard, CheckCircle2, Clock, LockKeyhole, Plane, BriefcaseBusiness, Gem,
  Star, Sparkles, BadgeCheck, Search, Crown, KeyRound
} from "lucide-react";
import "./styles.css";

const WHATSAPP_NUMBER = "447845589543";
const BUSINESS_PHONE = "+44 7845 589543";
const BUSINESS_EMAIL = "info@velairecars.co.uk";
const BUSINESS_ADDRESS = "42 Bell Road, Hounslow TW3 3PB, UK";
const STRIPE_RESERVE_LINK = "https://buy.stripe.com/test_replace_this_with_your_99_reserve_link";

const cars = [
  {
    type:"Electric",
    make:"Tesla",
    model:"Model 3 Performance",
    year:"2020",
    price:"£129",
    fuel:"Electric",
    seats:"5 Seats",
    gearbox:"Automatic",
    colour:"White exterior / white interior",
    badge:"White Interior",
    title:"Tesla Model 3 Performance",
    desc:"White Tesla Model 3 Performance with premium white interior. Ideal for electric performance, business travel and premium daily rental.",
    images:[
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=1600&auto=format&fit=crop"
    ],
    specs:["Dual Motor AWD","0–60 mph approx. 3.1 sec","Premium white interior","Panoramic glass roof feel"]
  },
  {
    type:"SUV",
    make:"Range Rover",
    model:"SVR",
    year:"2021",
    price:"£299",
    fuel:"Petrol",
    seats:"5 Seats",
    gearbox:"Automatic",
    colour:"Blue exterior",
    badge:"SVR",
    title:"Range Rover SVR",
    desc:"Blue 2021 Range Rover SVR with luxury SUV presence. Perfect for events, VIP travel, weddings and premium weekends.",
    images:[
      "https://img.pistonheads.com/LargeSize/land-rover/range-rover-sport/5-0-p575-v8-svr-auto-4wd-euro-6-s-s-5dr/land-rover-range-rover-sport-5-0-p575-v8-svr-auto-4wd-euro-6-s-s-5dr-1390024492-1.jpg?resize=1440",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop"
    ],
    specs:["5.0L Supercharged V8","4WD performance SUV","Luxury leather cabin","Huge road presence"]
  },
  {
    type:"Estate",
    make:"BMW",
    model:"530e M Sport Estate",
    year:"2022",
    price:"£149",
    fuel:"Hybrid",
    seats:"5 Seats",
    gearbox:"Automatic",
    colour:"Black exterior",
    badge:"M Sport Estate",
    title:"BMW 530e M Sport Estate",
    desc:"Black 2022 BMW 530e M Sport Estate. Executive hybrid estate for business travel, long-term rental and refined daily use.",
    images:[
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f?q=80&w=1600&auto=format&fit=crop"
    ],
    specs:["Plug-in hybrid","Executive M Sport cabin","Large estate boot","Smooth long-distance comfort"]
  },
  {
    type:"Hatchback",
    make:"BMW",
    model:"M140i Shadow Edition",
    year:"2019",
    price:"£119",
    fuel:"Petrol",
    seats:"5 Seats",
    gearbox:"Automatic",
    colour:"Black exterior / Maxton kit",
    badge:"Shadow Edition",
    title:"BMW M140i Shadow Edition",
    desc:"Black BMW M140i Shadow Edition with Maxton-style body kit. Compact performance hatchback with serious street presence.",
    images:[
      "https://f7432d8eadcf865aa9d9-9c672a3a4ecaaacdf2fee3b3e6fd2716.ssl.cf3.rackcdn.com/C2907/U1717/IMG_39100-large.jpg",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600&auto=format&fit=crop"
    ],
    specs:["3.0L turbo straight-six","Shadow Edition styling","Maxton-style kit","Performance hatchback"]
  }
];

function wa(text){ return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`; }

function Button({children, className="", ...props}){
  return <a className={`btn ${className}`} {...props}>{children}</a>;
}

function CarCard({car,onOpen}) {
  return (
    <motion.article className="car-card" whileHover={{ y: -8 }} transition={{ duration: 0.25 }}>
      <button className="img-btn" onClick={()=>onOpen(car)} aria-label={`View ${car.title}`}>
        <img src={car.images[0]} alt={car.title}/>
        <span className="tag">{car.type}</span>
        <span className="heart"><Heart size={17}/></span>
      </button>
      <div className="car-body">
        <div className="car-title">
          <h3>{car.title}</h3>
          <p>{car.year}</p>
        </div>
        <div className="meta">
          <span><Users size={14}/>{car.seats}</span>
          <span><Settings size={14}/>{car.gearbox}</span>
          <span><Fuel size={14}/>{car.fuel}</span>
        </div>
        <div className="price"><strong>{car.price}</strong><span>/day</span></div>
        <div className="actions">
          <button className="outline action-button" onClick={()=>onOpen(car)}>View Details</button>
          <Button className="rose action-button" target="_blank" href={wa(`Hi Velaire Cars, I'm interested in renting the ${car.year} ${car.title}.`)}>WhatsApp</Button>
        </div>
      </div>
    </motion.article>
  );
}

function Detail({car,onClose}) {
  const [img,setImg]=useState(0);
  if(!car) return null;

  return (
    <AnimatePresence>
      <motion.div className="overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
        <motion.div className="modal" initial={{y:30,opacity:0,scale:.98}} animate={{y:0,opacity:1,scale:1}} exit={{y:30,opacity:0,scale:.98}}>
          <button className="close" onClick={onClose}><X/></button>

          <div className="gallery">
            <div className="main-img">
              <img src={car.images[img]} alt={car.title}/>
              <button className="gal left" onClick={()=>setImg((img+car.images.length-1)%car.images.length)}><ChevronLeft/></button>
              <button className="gal right" onClick={()=>setImg((img+1)%car.images.length)}><ChevronRight/></button>
            </div>
            <div className="thumbs">
              {car.images.map((x,i)=>(
                <button className={i===img?"active":""} onClick={()=>setImg(i)} key={x}>
                  <img src={x} alt={`${car.title} ${i + 1}`}/>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-content">
            <section>
              <p className="eyebrow">{car.badge}</p>
              <h2>{car.year} {car.title}</h2>
              <p className="desc">{car.desc}</p>

              <div className="specs">
                {[car.colour,car.fuel,car.gearbox,car.seats,...car.specs].map(s=><div key={s}>{s}</div>)}
              </div>

              <div className="info-blocks">
                <div>
                  <Sparkles size={22}/>
                  <h4>Best for</h4>
                  <p>Premium hire, content shoots, business travel, weekends, weddings and events.</p>
                </div>
                <div>
                  <BadgeCheck size={22}/>
                  <h4>Rental checks</h4>
                  <p>Valid licence, ID verification, refundable deposit and approval required before handover.</p>
                </div>
              </div>
            </section>

            <aside>
              <div className="reserve">
                <p className="eyebrow">Reservation</p>
                <h3>Reserve this car</h3>
                <p>Confirm availability first. Then reserve securely after approval.</p>
                <div className="big-price"><span>From</span><strong>{car.price}<small>/day</small></strong></div>
                <Button className="rose full" target="_blank" href={wa(`Hi Velaire Cars, I want to reserve the ${car.year} ${car.title}. Please confirm availability before I pay the £99 reserve fee.`)}><MessageCircle size={18}/> Request Availability</Button>
                <Button className="outline full" target="_blank" href={STRIPE_RESERVE_LINK}><CreditCard size={18}/> Pay £99 Reserve</Button>
                <Button className="outline full" target="_blank" href={wa(`Hi Velaire Cars, please call me about the ${car.year} ${car.title}.`)}><MessageCircle size={18}/> WhatsApp Call Request</Button>
              </div>

              <div className="process-box">
                <h4><KeyRound size={18}/> Booking flow</h4>
                <p>1. Choose vehicle</p>
                <p>2. Confirm dates</p>
                <p>3. Pay reserve</p>
                <p>4. Complete handover checks</p>
              </div>
            </aside>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChatBot(){
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState("");
  const [messages,setMessages]=useState([
    {from:"bot",text:"Hi, I’m the Velaire assistant. Ask about pricing, deposits, availability or the fleet."}
  ]);

  const reply=(t)=>{
    const q=t.toLowerCase();
    if(q.includes("deposit")) return "Deposit depends on the vehicle, rental length and approval checks. Message us with your chosen car and dates for confirmation.";
    if(q.includes("price")||q.includes("cost")) return "Prices vary by vehicle, dates and duration. Use WhatsApp for the fastest accurate quote.";
    if(q.includes("reserve")||q.includes("pay")) return "Request availability first, then use the £99 reserve flow once approved.";
    if(q.includes("tesla")) return "The Tesla Model 3 Performance is white with white interior and ideal for premium electric hire.";
    if(q.includes("range")) return "The blue Range Rover SVR is a premium SUV for events, VIP travel and weekends.";
    return "Send your chosen car and dates on WhatsApp and Velaire Cars will confirm availability, deposit and requirements.";
  };

  const send=()=>{
    if(!input.trim()) return;
    setMessages([...messages,{from:"user",text:input},{from:"bot",text:reply(input)}]);
    setInput("");
  };

  return (
    <>
      <button className="chat-launcher" onClick={()=>setOpen(true)}><Bot size={20}/> AI Assistant</button>
      {open && (
        <div className="chat">
          <div className="chat-head"><strong>Velaire AI Assistant</strong><button onClick={()=>setOpen(false)}><X size={18}/></button></div>
          <div className="chat-body">{messages.map((m,i)=><div key={i} className={`msg ${m.from}`}>{m.text}</div>)}</div>
          <div className="quick">{["Deposit?","Prices?","Reserve?"].map(x=><button onClick={()=>setMessages([...messages,{from:"user",text:x},{from:"bot",text:reply(x)}])} key={x}>{x}</button>)}</div>
          <div className="chat-input"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything..."/><button onClick={send}><Send size={16}/></button></div>
          <Button className="chat-wa" target="_blank" href={wa("Hi Velaire Cars, I need help with a booking.")}>Continue on WhatsApp <ChevronRight size={15}/></Button>
        </div>
      )}
    </>
  );
}

function App(){
  const [selected,setSelected]=useState(null);

  return (
    <main>
      <nav className="nav">
        <a href="#home" className="brand"><span>V</span><div>VELAIRE<small>CARS</small></div></a>
        <div className="links">
          <a href="#home">Home</a>
          <a href="#fleet">Fleet</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
          <a href={wa("Hi Velaire Cars, please call me.")} target="_blank" rel="noreferrer"><Phone size={15}/>{BUSINESS_PHONE}</a>
          <a className="reserve-btn" href="#fleet">Reserve Now <CalendarDays size={15}/></a>
        </div>
      </nav>

      <section id="home" className="hero">
        <motion.div className="hero-text" initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.7}}>
          <p className="eyebrow">Premium Car Rentals</p>
          <h1>Drive luxury.<br/><em>Live extraordinary.</em></h1>
          <p>London’s premier luxury and performance car rental experience. Unmatched service. Unforgettable journeys.</p>
          <div className="hero-actions">
            <a href="#fleet" className="btn rose">Browse Fleet <ArrowRight size={17}/></a>
            <Button className="outline" href={wa("Hi Velaire Cars, I'm interested in your luxury car rental services.")} target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp Us</Button>
          </div>
          <div className="rating"><span>5.0</span><Star/><Star/><Star/><Star/><Star/><small>From 250+ reviews</small></div>
        </motion.div>
        <motion.div className="hero-img" initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} transition={{duration:.8,delay:.1}}>
          <img src={cars[0].images[0]} alt="White Tesla Model 3 Performance" />
        </motion.div>
      </section>

      <section className="trust">
        {[[Car,"Premium Fleet","2020+ luxury vehicles"],[ShieldCheck,"Fully Insured","Peace of mind"],[Clock,"Flexible Rentals","Daily, weekly, monthly"],[MapPin,"Delivery Available","We bring it to you"]].map(([Icon,a,b])=>(
          <div key={a}><Icon/><strong>{a}</strong><p>{b}</p></div>
        ))}
      </section>

      <section className="search-panel">
        <h2>Find your perfect car</h2>
        <div className="search-grid">
          <label><small>Pick-up location</small><b>Hounslow, London</b></label>
          <label><small>Pick-up date</small><b>Select date</b></label>
          <label><small>Pick-up time</small><b>10:00 AM</b></label>
          <label><small>Return date</small><b>Select date</b></label>
          <a className="btn rose" href="#fleet"><Search size={16}/> Search Cars</a>
        </div>
        <p><LockKeyhole size={15}/> No hidden fees <ShieldCheck size={15}/> Full insurance included <Clock size={15}/> 24/7 support</p>
      </section>

      <section id="fleet" className="fleet">
        <div className="section-title"><h2>Our Premium Fleet</h2><a href="#fleet">View all vehicles <ArrowRight size={15}/></a></div>
        <div className="grid">{cars.map(car=><CarCard key={car.title} car={car} onOpen={setSelected}/>)}</div>
      </section>

      <section id="services" className="services">
        {[[Plane,"Airport Transfers","Meet & greet service"],[Users,"Chauffeur Service","Professional drivers"],[BriefcaseBusiness,"Business Travel","Executive car hire"],[Gem,"Weddings & Events","Make it unforgettable"],[Car,"Long Term Rentals","Flexible monthly plans"]].map(([Icon,a,b])=>(
          <div key={a}><Icon/><strong>{a}</strong><span>{b}</span></div>
        ))}
      </section>

      <section className="panels">
        <div><h3>Why choose Velaire Cars?</h3>{["Premium fleet","Best price guarantee","Flexible rentals","Fully insured","Delivery available"].map(x=><p key={x}><CheckCircle2 size={15}/>{x}</p>)}</div>
        <div><h3>How it works</h3>{["Choose your car","Book online","Confirmation","Drive & enjoy"].map((x,i)=><p key={x}><b>{i+1}</b>{x}</p>)}</div>
        <div><h3>Customer reviews</h3><strong>Google 5.0 ★★★★★</strong><p>The car was perfect and the service was outstanding. 100% recommend Velaire Cars.</p></div>
      </section>

      <footer id="contact">
        <div><a className="brand"><span>V</span><div>VELAIRE<small>CARS</small></div></a><p>London’s premier luxury car rental service.</p></div>
        <div><h4>Contact</h4><p><Phone size={15}/>{BUSINESS_PHONE}</p><p><Mail size={15}/>{BUSINESS_EMAIL}</p><p><MapPin size={15}/>{BUSINESS_ADDRESS}</p></div>
      </footer>

      <div className="floating">
        <Button className="outline" href={wa("Hi Velaire Cars, please call me.")} target="_blank" rel="noreferrer">WhatsApp Call</Button>
        <Button className="rose" href={wa("Hi Velaire Cars, I'm interested in renting a car.")} target="_blank" rel="noreferrer">WhatsApp</Button>
      </div>

      <Detail car={selected} onClose={()=>setSelected(null)}/>
      <ChatBot/>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
