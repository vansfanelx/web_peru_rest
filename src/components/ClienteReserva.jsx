import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getMesasDisponibles, createReserva, getReservas } from './../api/api';
import './reservas/styles/ClienteReserva.css';

// Utilidad para obtener el usuario autenticado (ajusta según tu auth real)
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

const ClienteReserva = () => {
  const user = getUser();
  const [fecha, setFecha] = useState(null);
  const [numeroPersonas, setNumeroPersonas] = useState('');
  const [mesasLibres, setMesasLibres] = useState([]);
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar reservas del usuario
  useEffect(() => {
    if (user?.id_cliente) {
      getReservas({ id_cliente: user.id_cliente })
        .then(setReservas)
        .catch(() => setReservas([]));
    }
  }, [user]);

  // Buscar mesas libres
  const buscarMesas = async () => {
    setError('');
    setMesasLibres([]);
    setMesasSeleccionadas([]);
    if (!fecha || !numeroPersonas) {
      setError('Completa fecha y número de personas');
      return;
    }
    try {
      const capacidadNum = parseInt(numeroPersonas, 10);
      const horaInicio = fecha ? `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:00` : '';
      const fechaFin = fecha ? new Date(fecha.getTime() + 60 * 60 * 1000) : null;
      const horaFin = fechaFin ? `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}:00` : '';
      const fechaReserva = fecha ? fecha.toISOString().slice(0, 10) : '';
      const data = await getMesasDisponibles({
        fecha_reserva: fechaReserva,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        numero_personas: capacidadNum
      });
      setMesasLibres(Array.isArray(data.mesas_disponibles) ? data.mesas_disponibles : []);
      if (!data.mesas_disponibles.length) setError('No hay mesas libres para la capacidad y fecha seleccionada.');
    } catch (err) {
      setError('Error al buscar mesas libres');
    }
  };

  // Confirmar reserva
  const confirmarReserva = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (!user?.id_cliente) throw new Error('Usuario no autenticado');
      if (!fecha || !numeroPersonas || !mesasSeleccionadas.length) throw new Error('Completa todos los campos y selecciona al menos una mesa');
      const pad = n => n.toString().padStart(2, '0');
      const fechaInicioISO = `${fecha.getFullYear()}-${pad(fecha.getMonth()+1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:00`;
      const fechaFinObj = new Date(fecha.getTime() + 60 * 60 * 1000);
      const fechaFinISO = `${fechaFinObj.getFullYear()}-${pad(fechaFinObj.getMonth()+1)}-${pad(fechaFinObj.getDate())}T${pad(fechaFinObj.getHours())}:${pad(fechaFinObj.getMinutes())}:00`;
      await createReserva({
        id_cliente: user.id_cliente,
        fecha_inicio: fechaInicioISO,
        fecha_fin: fechaFinISO,
        id_mesas: mesasSeleccionadas,
        numero_personas: Number(numeroPersonas),
        observaciones: observaciones || ''
      });
      setSuccess('¡Reserva realizada con éxito!');
      setFecha(null);
      setNumeroPersonas('');
      setMesasLibres([]);
      setMesasSeleccionadas([]);
      setObservaciones('');
      // Recargar reservas
      getReservas({ id_cliente: user.id_cliente }).then(setReservas);
    } catch (err) {
      setError(err.message || 'Error al reservar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cliente-reserva">
      <h2>Reservar una mesa</h2>
      <div className="form-group">
        <label>Fecha y hora:</label>
        <DatePicker
          selected={fecha}
          onChange={setFecha}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="dd/MM/yyyy HH:mm"
          placeholderText="Selecciona fecha"
          minDate={new Date()}
        />
      </div>
      <div className="form-group">
        <label>Número de personas:</label>
        <input type="number" value={numeroPersonas} onChange={e => setNumeroPersonas(e.target.value)} min={1} max={50} />
      </div>
      <div className="form-group">
        <button type="button" onClick={buscarMesas} disabled={loading}>Buscar mesas libres</button>
      </div>
      {mesasLibres.length > 0 && (
        <div className="form-group">
          <label>Mesas disponibles:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {mesasLibres.map(mesa => (
              <div
                key={mesa.id_mesa}
                style={{ border: mesasSeleccionadas.includes(mesa.id_mesa) ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, padding: 10, cursor: 'pointer', background: mesasSeleccionadas.includes(mesa.id_mesa) ? '#e0f2fe' : '#fff' }}
                onClick={() => setMesasSeleccionadas(sel => sel.includes(mesa.id_mesa) ? sel.filter(id => id !== mesa.id_mesa) : [...sel, mesa.id_mesa])}
              >
                Mesa {mesa.nro_mesa || mesa.nombre} - Capacidad: {mesa.capacidad}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="form-group">
        <label>Observaciones:</label>
        <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Observaciones (opcional)" />
      </div>
      <div className="form-group">
        <button type="button" onClick={confirmarReserva} disabled={loading || !mesasSeleccionadas.length}>{loading ? 'Reservando...' : 'Confirmar reserva'}</button>
      </div>
      {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      <hr style={{ margin: '32px 0' }} />
      <h3>Mis reservas</h3>
      <ul>
        {reservas.length === 0 && <li>No tienes reservas registradas.</li>}
        {reservas.map(r => (
          <li key={r.id_reserva || r.id}>
            {r.fecha_reserva || r.fecha_inicio} - Mesa(s): {Array.isArray(r.mesas) ? r.mesas.map(m => m.nro_mesa || m.nombre).join(', ') : '-'} - Estado: {r.estado}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ClienteReserva;
