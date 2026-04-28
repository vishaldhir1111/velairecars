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
        padding:"60px 40px",
        gap:"40px"
      }}>
        <div>
          <h1 style={{
            fontSize:"52px",
            lineHeight:"1.1",
            letterSpacing:"-1px"
          }}>
            Drive Luxury.<br/>Live Different.
          </h1>

          <p style={{color:"#aaa", marginTop:"10px"}}>
            Premium vehicles delivered across London.
          </p>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=1600"
          style={{width:"400px", borderRadius:"16px"}}
        />
      </section>

      {/* FLEET */}
      <section id="fleet" style={{padding:"40px"}}>
        <h2>Our Premium Fleet</h2>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))",
          gap:"20px",
          marginTop:"20px"
        }}>

          {cars.map(car => (
            <div 
              key={car.title}
              style={{
                background:"#111",
                borderRadius:"16px",
                overflow:"hidden",
                transition:"0.3s",
                cursor:"pointer"
              }}
              onMouseEnter={(e)=> e.currentTarget.style.transform = "translateY(-8px)"}
              onMouseLeave={(e)=> e.currentTarget.style.transform = "translateY(0)"}
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
                <p style={{color:"#aaa", marginBottom:"10px"}}>{car.year}</p>

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
                      background:"#c89b6d",
                      border:"none",
                      padding:"10px 16px",
                      borderRadius:"10px",
                      cursor:"pointer",
                      fontWeight:"bold"
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
