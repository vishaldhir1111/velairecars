import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function selectCar(car){
  localStorage.setItem("selectedCar", JSON.stringify(car));
}

const cars = [
  {
    title: "Tesla Model 3 Performance",
    year: "2020",
    price: "£129",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=1600"
  },
  {
    title: "Range Rover SVR",
    year: "2021",
    price: "£299",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
  },
  {
    title: "BMW 530e M Sport",
    year: "2022",
    price: "£149",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600"
  },
  {
    title: "BMW M140i",
    year: "2019",
    price: "£119",
    image: "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1600"
  }
];

function App(){
  return (
    <main style={{
      background:"#0b0b0b",
      color:"white",
      minHeight:"100vh",
      fontFamily:"Arial"
    }}>

      {/* NAV */}
      <nav style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"20px 60px",
        borderBottom:"1px solid #222"
      }}>
        <h2 style={{letterSpacing:"2px"}}>
          VELAIRE{" "}
          <span style={{
            background:"linear-gradient(135deg, #c89b6d, #e6c79c)",
            WebkitBackgroundClip:"text",
            WebkitTextFillColor:"transparent"
          }}>
            CARS
          </span>
        </h2>

        <a href="#fleet" style={{
          color:"#c89b6d",
          textDecoration:"none",
          fontWeight:"bold"
        }}>
          Reserve Now
        </a>
      </nav>

      {/* HERO */}
      <section style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        padding:"80px 60px",
        gap:"50px"
      }}>
        <div style={{maxWidth:"500px"}}>
          <h1 style={{
            fontSize:"52px",
            lineHeight:"1.1",
            letterSpacing:"-1px"
          }}>
            Drive luxury.<br/>Live extraordinary.
          </h1>

          <p style={{
            color:"#aaa",
            marginTop:"15px",
            fontSize:"16px"
          }}>
            Premium performance vehicles across London. Delivered to your door.
          </p>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
          style={{
            width:"420px",
            borderRadius:"20px"
          }}
        />
      </section>

      {/* FLEET */}
      <section id="fleet" style={{padding:"60px"}}>
        <h2 style={{marginBottom:"30px"}}>Our Premium Fleet</h2>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(300px,1fr))",
          gap:"30px"
        }}>

          {cars.map(car => (
            <div
              key={car.title}
              style={{
                background:"#111",
                borderRadius:"18px",
                overflow:"hidden",
                transition:"0.3s",
                cursor:"pointer",
                boxShadow:"0 0 0 rgba(0,0,0,0)"
              }}
              onMouseEnter={(e)=>{
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(200,155,109,0.25)";
              }}
              onMouseLeave={(e)=>{
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
              }}
            >

              <img
                src={car.image}
                style={{
                  width:"100%",
                  height:"200px",
                  objectFit:"cover"
                }}
              />

              <div style={{padding:"20px"}}>
                <h3 style={{marginBottom:"5px"}}>{car.title}</h3>
                <p style={{color:"#aaa", marginBottom:"12px"}}>{car.year}</p>

                <div style={{
                  display:"flex",
                  justifyContent:"space-between",
                  alignItems:"center"
                }}>
                  <strong>{car.price}/day</strong>

                  <button
                    onClick={()=>{
                      selectCar(car);
                      window.location.href = "booking.html";
                    }}
                    style={{
                      background:"linear-gradient(135deg, #c89b6d, #e6c79c)",
                      border:"none",
                      padding:"10px 16px",
                      borderRadius:"10px",
                      cursor:"pointer",
                      fontWeight:"bold",
                      color:"#000"
                    }}
                  >
                    Reserve
                  </button>
                </div>
              </div>

            </div>
          ))}

        </div>
      </section>

    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
