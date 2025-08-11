import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'; 
import './../assets/LoginPage.css';
import { Link } from 'react-router-dom';
import SideImage from './../assets/img/caralsan.jpg'
import Logo from './../assets/img/CaralLogo.png'

import { login } from '../api/api';


function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // El API espera { email, password }
      const data = await login(email, password);
      if (data && data.token && data.usuario) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        navigate('/ReservaWeb'); // Redirige a la vista de reservas
      } else {
        setError(data?.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión o credenciales incorrectas');
    }
  };

  const handleRegister = () => {
    navigate('/Register');
  };

  const handleForgotPassword = () => {
    navigate('/UserRecovery');
  };

  return (
    <div className="login-page-container">
      <div className="login-left-section">
        <img src={SideImage} alt="Caral" 
        className="side-image" />
      </div>

      <div className="login-right-section">
        <div className="login-header">
          <h1>¡Bienvenido!</h1>
          <div className="logo-container">
            <img src={Logo} alt="Logo" className="app-logo" />
            <p>Caral Sangucheria</p>
          </div>
        </div>

        <p className="access-data-text">Ingrese sus datos de acceso</p>


        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Correo"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-links">
          <Link to="/Register" onClick={handleRegister} className="link-button">
            Registrarse
          </Link>
          <span>|</span>
          <Link to="/UserRecovery" className="link-button">
            Recuperar contraseña
          </Link>
        </div>
        
        <div className="login-links">
          <Link to="/" className="link-button">
            Volver a la Web
          </Link>
        </div>

        <div className="footer-text">
          <p>©2025 SWSPERU | PERU REST SOFT</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage