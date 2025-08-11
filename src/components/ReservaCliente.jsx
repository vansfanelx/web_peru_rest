import React from 'react';

function ReservaCliente() {
  return (
    <div>
      <h2>Formulario de Reserva</h2>
      {/* Aquí va el formulario real de reserva */}
      <form>
        <input type="text" placeholder="Nombre" required style={{ display: 'block', marginBottom: 8, width: '100%' }} />
        <input type="date" required style={{ display: 'block', marginBottom: 8, width: '100%' }} />
        <input type="time" required style={{ display: 'block', marginBottom: 8, width: '100%' }} />
        <button type="submit" className="login-button">Reservar</button>
      </form>
    </div>
  );
}

export default ReservaCliente;
