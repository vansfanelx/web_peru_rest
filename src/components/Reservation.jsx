// Eliminado. El flujo de reservas ahora está en src/components/ClienteReserva.jsx

import './Reservation.css';
import { useState } from 'react';
import axiosClient from '../../api/axiosClient';

const Reservation = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    people: 1,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      // Adaptar estos datos según tu lógica y el usuario autenticado
      const data = {
        id_cliente: 1, // TODO: Reemplazar por el id real del cliente autenticado
        fecha_reserva: form.date,
        hora_inicio: form.time,
        hora_fin: form.time, // TODO: Ajustar lógica para hora fin
        estado: 'confirmada',
        mesas: [1], // TODO: Permitir seleccionar mesas disponibles
        numero_personas: Number(form.people),
        observaciones: `Reserva de ${form.name} (${form.email})`,
      };
      await axiosClient.post('/api/reservas', data);
      setSuccess('¡Reserva realizada con éxito!');
      setForm({ name: '', email: '', date: '', time: '', people: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reservar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reservation" id="reservation">
      <div className="container">
        <div className="reservation-content">
          <div className="reservation-left">
            <div className="reservation-decorations">
              <img 
                src="https://ext.same-assets.com/2028573295/1046775264.png" 
                alt="Burger decoration" 
                className="decoration-burger"
              />
              <img 
                src="https://ext.same-assets.com/2028573295/3907362222.png" 
                alt="Bottle decoration" 
                className="decoration-bottle"
              />
            </div>
          </div>
          <div className="reservation-center">
            <span className="section-subtitle">Reservation</span>
            <h2 className="section-title">Book Your Table</h2>
            <form className="reservation-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="text" name="name" placeholder="Name" className="form-input" value={form.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" className="form-input" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <input type="date" name="date" placeholder="Date" className="form-input" value={form.date} onChange={handleChange} required />
                <input type="time" name="time" placeholder="Time" className="form-input" value={form.time} onChange={handleChange} required />
              </div>
              <div className="form-row full-width">
                <input type="number" name="people" placeholder="People" className="form-input" value={form.people} onChange={handleChange} min={1} max={50} required />
              </div>
              <button type="submit" className="btn reservation-btn" disabled={loading}>{loading ? 'Reservando...' : 'Find a Table'}</button>
              {success && <div className="success-message">{success}</div>}
              {error && <div className="error-message">{error}</div>}
            </form>
          </div>
          <div className="reservation-right">
            <div className="reservation-decorations">
              <img 
                src="https://ext.same-assets.com/2028573295/958875020.png" 
                alt="Burger plate decoration" 
                className="decoration-plate"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservation;