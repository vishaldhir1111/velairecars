import React from "react";
import { createRoot } from "react-dom/client";

function App(){
  return (
    <div style={{
      background:"#0b0b0b",
      color:"white",
      minHeight:"100vh",
      padding:"40px",
      fontFamily:"Arial"
    }}>
      <h1>VELAIRE CARS</h1>
      <p>If you see this, your site is working.</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
