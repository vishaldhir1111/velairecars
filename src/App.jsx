import React from "react"

function selectCar(car){
  localStorage.setItem("selectedCar", car)
  window.location.href = "/car.html"
}

export default function App() {
  return (
    <div style={{padding: "40px"}}>

      <h1>Velaire Cars</h1>

      <div 
        className="car-card"
        onClick={() => selectCar("m440i")}
        style={{
          background: "#111",
          color: "white",
          padding: "20px",
          marginTop: "20px",
          cursor: "pointer"
        }}
      >
        BMW M440i
      </div>

    </div>
  )
}
