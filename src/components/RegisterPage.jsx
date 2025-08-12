import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../assets/LoginPage.css';
import SideImage from '../assets/img/caralsan.jpg';
import Logo from '../assets/img/CaralLogo.png';
import { register } from '../api/api';

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await register({ name, email, telefono: phone, password });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario || data.user || {}));
        setSuccess('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => navigate('/reserva-cliente'), 1200);
      } else {
        setError(data?.message || 'No se pudo registrar.');
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
          <h1>Registro</h1>
          <div className="logo-container">
            <img src={Logo} alt="Logo" className="app-logo" />
            <p>Caral Sangucheria</p>
          </div>
        </div>
        <p className="access-data-text">Ingrese sus datos de acceso</p>
        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            placeholder="Nombre completo"
            className="login-input"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
        </form>
        <div className="login-links">
          <Link to="/Login" className="link-button">
            Login
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
  );
}

export default RegisterPage;