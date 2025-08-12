import React, { useState } from 'react';

function ReservaCliente() {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    hora: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMensaje('');
    
    try {
      // Aquí puedes agregar la lógica para enviar los datos a tu API
      // Por ejemplo:
      // const response = await fetch('/api/reservas', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // Simulamos una operación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMensaje('¡Reserva realizada con éxito!');
      setFormData({ nombre: '', fecha: '', hora: '' });
    } catch (error) {
      console.error('Error al realizar la reserva:', error);
      setMensaje('Error al realizar la reserva. Inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Formulario de Reserva</h2>
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
      <form onSubmit={handleSubmit}>
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
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required 
          style={{ display: 'block', marginBottom: 8, width: '100%' }} 
        />
        <input 
          type="time" 
          name="hora"
          value={formData.hora}
          onChange={handleChange}
          required 
          style={{ display: 'block', marginBottom: 8, width: '100%' }} 
        />
        <button 
          type="submit" 
          className="login-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Reservar'}
        </button>
      </form>
    </div>
  );
}

export default ReservaCliente;
