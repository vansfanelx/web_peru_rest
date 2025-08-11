import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/LoginPage.css';
import SideImage from '../assets/img/caralsan.jpg';
import Logo from '../assets/img/CaralLogo.png';

function UserRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Simulación de recuperación real. Cambia la URL y payload según tu backend.
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, telefono: phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Si los datos son correctos, recibirás instrucciones en tu correo o celular.');
      } else {
        setError(data.message || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-left-section">
        <img src={SideImage} alt="Caral" className="side-image" />
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
        <form onSubmit={handleRecovery} className="login-form">
          <input
            type="email"
            placeholder="Correo"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            className="login-input"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Recuperar'}
          </button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
        </form>
        <div className="login-links">
          <Link to="/Login" className="link-button">
            Login
          </Link>
          <span>|</span>
          <Link to="/Register" className="link-button">
            Registrarse
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
  );
}

export default UserRecoveryPage;