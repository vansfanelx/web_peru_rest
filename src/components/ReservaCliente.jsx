import React, { useState, useEffect } from 'react';
import { logout, getMesasDisponibles, createReserva } from '../api/api';
import { useNavigate } from 'react-router-dom';

function ReservaCliente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    numero_personas: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Verificar autenticación al cargar componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const buscarMesas = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    
    try {
      const resultado = await getMesasDisponibles({
        fecha_reserva: formData.fecha_reserva,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        numero_personas: formData.numero_personas
      });
      
      if (resultado && resultado.mesas_disponibles) {
        setMesasDisponibles(resultado.mesas_disponibles);
        setMensaje(`Se encontraron ${resultado.mesas_disponibles.length} mesas disponibles`);
      } else {
        setMesasDisponibles([]);
        setMensaje('No se encontraron mesas disponibles para esa fecha y hora');
      }
    } catch (error) {
      console.error('Error al buscar mesas:', error);
      setMensaje(`Error: ${error.message || 'No se pudieron buscar mesas disponibles'}`);
      setMesasDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje('');
    
    try {
      // Implementar la lógica de creación de reserva cuando sea necesario
      // Por ahora solo mostramos un mensaje de éxito simulado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMensaje('¡Reserva realizada con éxito!');
      setFormData({ 
        nombre: '', 
        fecha_reserva: '', 
        hora_inicio: '', 
        hora_fin: '',
        numero_personas: 1
      });
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      setMensaje('Error al realizar la reserva. Inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout().then(() => {
      navigate('/login');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Formulario de Reserva</h2>
        <button 
          onClick={handleLogout} 
          style={{ 
            background: '#f44336', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
      
      {mensaje && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: mensaje.includes('Error') ? '#ffecec' : '#e8f5e9',
          border: mensaje.includes('Error') ? '1px solid #f5c6cb' : '1px solid #c8e6c9',
          borderRadius: '4px'
        }}>
          {mensaje}
        </div>
      )}
      
      <form onSubmit={buscarMesas}>
        <h3>Buscar disponibilidad</h3>
        <input 
          type="text" 
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre" 
          required 
          style={{ display: 'block', marginBottom: 8, width: '100%' }} 
        />
        <input 
          type="date" 
          name="fecha_reserva"
          value={formData.fecha_reserva}
          onChange={handleChange}
          required 
          style={{ display: 'block', marginBottom: 8, width: '100%' }} 
        />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input 
            type="time" 
            name="hora_inicio"
            value={formData.hora_inicio}
            onChange={handleChange}
            required 
            style={{ flex: 1 }} 
          />
          <input 
            type="time" 
            name="hora_fin"
            value={formData.hora_fin}
            onChange={handleChange}
            required 
            style={{ flex: 1 }} 
          />
        </div>
        <input 
          type="number" 
          name="numero_personas"
          value={formData.numero_personas}
          onChange={handleChange}
          min="1"
          placeholder="Número de personas" 
          required 
          style={{ display: 'block', marginBottom: 8, width: '100%' }} 
        />
        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
          style={{ marginBottom: '20px' }}
        >
          {loading ? 'Buscando...' : 'Buscar Mesas Disponibles'}
        </button>
      </form>
      
      {mesasDisponibles.length > 0 && (
        <div>
          <h3>Mesas Disponibles</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {mesasDisponibles.map(mesa => (
              <div 
                key={mesa.id_mesa} 
                style={{ 
                  border: '1px solid #ccc',
                  padding: '10px',
                  borderRadius: '4px',
                  width: '150px'
                }}
              >
                <p><strong>Mesa #{mesa.numero_mesa}</strong></p>
                <p>Capacidad: {mesa.capacidad} personas</p>
                <button 
                  onClick={() => alert(`Implementar reserva de mesa ${mesa.id_mesa}`)}
                  style={{ 
                    background: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservaCliente;
