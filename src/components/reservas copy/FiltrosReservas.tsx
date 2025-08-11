import React from 'react';
import './FiltrosReservas.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface FiltrosReservasProps {
  filtros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    cliente?: string;
    capacidad?: string | number;
    nro_mesa?: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => void;
  onBuscar: () => void;
}

const estados = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'anulada', label: 'Anulada' },
];

const FiltrosReservas: React.FC<FiltrosReservasProps> = ({ filtros, onChange, onBuscar }) => {
  return (
    <div className="filtros-reservas">
      <h3>Filtros</h3>
      <form onSubmit={e => { e.preventDefault(); onBuscar(); }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: 13 }}>Fecha inicio</label><br />
          <DatePicker
            selected={filtros.fecha_inicio ? new Date(filtros.fecha_inicio) : null}
            onChange={date => onChange({ target: { name: 'fecha_inicio', value: date ? date.toISOString() : '' } })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="Inicio"
            className="filtros-datepicker"
            isClearable
          />
        </div>
        <div>
          <label style={{ fontSize: 13 }}>Fecha fin</label><br />
          <DatePicker
            selected={filtros.fecha_fin ? new Date(filtros.fecha_fin) : null}
            onChange={date => onChange({ target: { name: 'fecha_fin', value: date ? date.toISOString() : '' } })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="Fin"
            className="filtros-datepicker"
            isClearable
          />
        </div>
        <div>
          <label style={{ fontSize: 13 }}>Estado</label><br />
          <select name="estado" value={filtros.estado || ''} onChange={onChange} className="filtros-select">
            {estados.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13 }}>Cliente</label><br />
          <input
            type="text"
            name="cliente"
            placeholder="Cliente"
            value={filtros.cliente || ''}
            onChange={onChange}
            className="filtros-input"
          />
        </div>
        <div>
          <label style={{ fontSize: 13 }}>Capacidad mesa</label><br />
          <input
            type="number"
            name="capacidad"
            placeholder="Capacidad"
            value={filtros.capacidad || ''}
            onChange={onChange}
            className="filtros-input"
            min={1}
          />
        </div>
        <div>
          <label style={{ fontSize: 13 }}>N° Mesa</label><br />
          <input
            type="text"
            name="nro_mesa"
            placeholder="N° Mesa"
            value={filtros.nro_mesa || ''}
            onChange={onChange}
            className="filtros-input"
          />
        </div>
        <button type="submit" className="filtros-btn">Buscar</button>
      </form>
    </div>
  );
};

export default FiltrosReservas;
