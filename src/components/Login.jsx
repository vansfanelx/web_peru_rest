import React, { useState, useEffect } from 'react';
import { login } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Asumiendo que tienes un CSS para Login

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Comprobar si el usuario ya está autenticado y redirigir
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Usuario ya autenticado, redirigir a la página de reservas
      navigate('/reservas');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        
        if (response.user) {
          localStorage.setItem('usuario', JSON.stringify(response.user));
        }
        
        navigate('/reservas');
      } else {
        setError(response.message || 'Error de inicio de sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error al conectar con el servidor. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="register-link">
          <p>¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
