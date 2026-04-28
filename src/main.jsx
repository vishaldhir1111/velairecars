import React from "react";
import { createRoot } from "react-dom/client";

function App(){
  return (
    <div style={{
      background:"#0b0b0b",
      color:"white",
      minHeight:"100vh",
      fontFamily:"Arial"
    }}>

      {/* NAV */}
      <nav style={{
        display:"flex",
        justifyContent:"space-between",
        padding:"20px 40px"
      }}>
        <h2>VELAIRE <span style={{color:"#c89b6d"}}>CARS</span></h2>
        <a href="#fleet" style={{color:"#c89b6d"}}>Reserve</a>
      </nav>

      {/* HERO */}
      <section style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"60px 40px"
      }}>
        <div>
          <h1 style={{fontSize:"42px"}}>
            Drive Luxury.<br/>Live Extraordinary.
          </h1>
          <p style={{color:"#aaa"}}>
            Premium vehicles delivered across London.
          </p>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600"
          style={{width:"400px", borderRadius:"16px"}}
        />
      </section>

    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
