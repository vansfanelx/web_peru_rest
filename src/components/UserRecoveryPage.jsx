import React from 'react'
import { useNavigate } from 'react-router-dom'; 
import './LoginPage.css';
import { Link } from 'react-router-dom';
import SideImage from '../assets/components/img/caralsan.jpg'
import Logo from '../assets/components/img/CaralLogo.png'

function UserRecoveryPage() {
const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para enviar los datos de inicio de sesión
    // Por ahora, solo simularemos un inicio de sesión exitoso y navegaremos a otra página.
    console.log('Intentando iniciar sesión...');
    // Por ejemplo, navegar a un dashboard después del login
    // navigate('/dashboard');
    alert('¡Inicio de sesión!'); // Solo para demostración
  };

  const handleRegister = () => {
    // Lógica para navegar a la página de registro
    navigate('/registro'); // Asume que tienes una ruta /registro
  };

  const handleForgotPassword = () => {
    // Lógica para navegar a la página de recuperación de contraseña
    navigate('/recuperar-contrasena'); // Asume que tienes una ruta /recuperar-contrasena
  };

  return (
    <div className="login-page-container">
      <div className="login-left-section">
        <img src={SideImage} alt="Caral" 
        className="side-image" />
      </div>

      <div className="login-right-section">
        <div className="login-header">
          <h1>Recuperar Contraseña</h1>
          <div className="logo-container">
            <img src={Logo} alt="Logo" className="app-logo" />
            <p>Caral Sangucheria</p>
          </div>
        </div>

        <p className="access-data-text">Ingrese su correo y/o celular</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Correo"
            className="login-input"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            className="login-input"
            required
          />
          <button type="submit" className="login-button">
            Recuperar
          </button>
        </form>

        <div className="login-links">
          <Link to="/Login" onClick={handleRegister} className="link-button">
            Login
          </Link>
          <span>|</span>
          <button onClick={handleForgotPassword} className="link-button">
            Registrarse
          </button>
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

export default UserRecoveryPage