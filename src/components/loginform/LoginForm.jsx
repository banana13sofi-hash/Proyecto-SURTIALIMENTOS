import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

function LoginForm() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const correctUser = "admin";
    const correctPassword = "1234";

    if (user === correctUser && password === correctPassword) {
      navigate("/loading");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  const handleForgot = () => {
    setError("Por favor contacte al administrador para recuperar su usuario o contraseña.");
  };

  return (
    <div className="login-form">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <button type="button" className="forgot-button" onClick={handleForgot}>
        ¿Olvidé usuario o contraseña?
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginForm;