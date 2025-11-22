import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 5000); 

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Espere por favor...</h1>
      <p>Estamos verificando su información</p>
      <img
        src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnU1M2VrMHVva3Vlcnc0d3lneWo3Y2N0bmFuMTYxOTR2ang0emhuZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif"
        alt="Cargando..."
      />
    </div>
  );
}

export default LoadingPage;