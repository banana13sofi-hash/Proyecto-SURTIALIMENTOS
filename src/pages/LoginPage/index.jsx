import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../Assets/Logo.png";
import "../../index.css";
import "../LoginPage/index.css";

function LoginPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: user,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/loading");
      } else {
        setError(data.message || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Surtialimentos logo" className="login-logo" />
          <div className="title-wrap">
            <h1 className="app-title">SURTIALIMENTOS</h1>
            <p className="slogan">EL MEJOR SOFTWARE PARA ORGANIZAR TUS ALIMENTOS</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Iniciar sesión</h2>

          <div className="form-group">
            <label htmlFor="usuario">Usuario:</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingrese su usuario"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit">Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;