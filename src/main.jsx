import React from "react";
import { createRoot } from "react-dom/client";

function selectCar(car){
  localStorage.setItem("selectedCar", JSON.stringify(car));
}

const cars = [
  { title:"Tesla Model 3 Performance", year:"2020", price:"£129", image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600" },
  { title:"Range Rover SVR", year:"2021", price:"£299", image:"https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600" },
  { title:"BMW 530e M Sport", year:"2022", price:"£149", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600" }
];

function App(){
  return (
    <div style={{background:"#0b0b0b", color:"white", minHeight:"100vh", fontFamily:"Arial"}}>

      <nav style={{display:"flex", justifyContent:"space-between", padding:"20px 40px"}}>
        <h2>VELAIRE <span style={{color:"#c89b6d"}}>CARS</span></h2>
        <a href="#fleet" style={{color:"#c89b6d"}}>Reserve</a>
      </nav>

      <section style={{display:"flex", justifyContent:"space-between", padding:"60px 40px"}}>
        <div>
          <h1 style={{fontSize:"42px"}}>
            Drive Luxury.<br/>Live Different.
          </h1>
          <p style={{color:"#aaa"}}>Premium vehicles delivered across London.</p>
        </div>

        <img src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
             style={{width:"400px", borderRadius:"16px"}}/>
      </section>

      <section id="fleet" style={{padding:"40px"}}>
        <h2>Our Premium Fleet</h2>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))",
          gap:"20px",
          marginTop:"20px"
        }}>
          {cars.map(car=>(
            <div key={car.title} style={{
              background:"#111",
              padding:"20px",
              borderRadius:"12px"
            }}>
              <img src={car.image} style={{width:"100%", borderRadius:"10px"}}/>
              <h3>{car.title}</h3>
              <p>{car.year}</p>
              <strong>{car.price}/day</strong>

              <button onClick={()=>{
                selectCar(car);
                window.location.href = "booking.html";
              }} style={{
                width:"100%",
                marginTop:"10px",
                padding:"10px",
                background:"#c89b6d",
                border:"none",
                borderRadius:"8px"
              }}>
                Reserve
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
