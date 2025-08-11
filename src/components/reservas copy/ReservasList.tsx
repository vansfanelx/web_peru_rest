import React, { useState } from 'react';
import './ReservasList.css';

export interface Reserva {
  id_reserva?: number;
  id?: number;
  id_cliente?: number | string;
  cliente?: { razon_social?: string; nombre?: string; documento?: string; id_cliente?: number } | string;
  nombre_cliente?: string;
  fecha_reserva?: string;
  hora_inicio?: string;
  hora_fin?: string;
  estado?: string;
  deleted_at?: string | null;
  numero_personas?: string | number;
  mesa?: string;
  salon?: string;
  nro_mesa?: string | number;
  mesas?: any[];
}

export interface ReservasListProps {
  reservas: Reserva[];
  onEdit: (reserva: Reserva) => void;
  onDelete: (id: number | string) => Promise<void>;
  historico?: boolean;
}

const ReservasList: React.FC<ReservasListProps> = ({ reservas, onEdit, onDelete, historico = false }) => {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [reservaToDelete, setReservaToDelete] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDeleteClick = (reserva: Reserva) => {
    setReservaToDelete(reserva);
    setShowDeleteModal(true);
  };

  const getNombreCliente = (reserva: Reserva) => {
    if (!reserva) return 'Sin nombre';
    if (typeof reserva.cliente === 'object' && reserva.cliente) {
      return reserva.cliente.razon_social || reserva.cliente.nombre || reserva.cliente.documento || reserva.cliente.id_cliente || 'Sin nombre';
    }
    return reserva.cliente || reserva.nombre_cliente || reserva.id_cliente || 'Sin nombre';
  };

  const handleCancelarEliminacion = () => {
    setShowDeleteModal(false);
    setReservaToDelete(null);
  };

  const handleConfirmarEliminacion = async () => {
    if (!reservaToDelete) return;
    setLoading(true);
    try {
      const id = reservaToDelete.id_reserva || reservaToDelete.id || reservaToDelete.id_cliente;
      await onDelete(id!);
      setShowDeleteModal(false);
      setReservaToDelete(null);
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return '-';
    // Si la fecha es tipo 'YYYY-MM-DD', formatear manualmente para evitar desfase de zona horaria
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [y, m, d] = fecha.split('-');
      // Mostrar como '27 jul 2025'
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
    }
    // Si la fecha es tipo ISO o DateTime, intentar extraer la parte de la fecha
    if (/^\d{4}-\d{2}-\d{2}T/.test(fecha)) {
      const soloFecha = fecha.slice(0, 10);
      const [y, m, d] = soloFecha.split('-');
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
    }
    return fecha;
  };

  const getBadgeEstado = (estado?: string, isDeleted?: boolean) => {
    if (isDeleted) {
      return (
  <span className="badge-anulada" title="Reserva anulada/eliminada">
          <span role="img" aria-label="anulada">❌</span> Anulada
        </span>
      );
    }
    const estados: Record<string, { color: string; bg: string }> = {
      'pendiente': { color: '#f59e0b', bg: '#fef3c7' },
      'confirmada': { color: '#10b981', bg: '#d1fae5' },
      'cancelada': { color: '#ef4444', bg: '#fee2e2' },
      'completada': { color: '#6366f1', bg: '#e0e7ff' }
    };
    const config = estados[estado?.toLowerCase() || ''] || { color: '#6b7280', bg: '#f3f4f6' };
    return (
      <span 
        style={{
          background: config.bg,
          color: config.color,
          padding: '2px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          marginRight: '4px'
        }}
      >
        {estado || 'Sin estado'}
      </span>
    );
  };

  return (
  <div className="reservas-list">
  <table className="reservas-list-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Hora inicio</th>
            <th>Hora fin</th>
            <th>Salón</th>
            <th>Nro. Mesa</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva, idx) => {
            const key = reserva.id_reserva || reserva.id || reserva.id_cliente || idx;
            const isDeleted = reserva.deleted_at !== null && reserva.deleted_at !== undefined;
            // Concatenar todos los salones y números de mesa si existen
            let salones = '-';
            let mesas = '-';
            if (Array.isArray(reserva.mesas) && reserva.mesas.length > 0) {
              salones = reserva.mesas.map(m => {
                if (m.salon) {
                  if (typeof m.salon === 'object') return m.salon.descripcion;
                  return m.salon;
                }
                return '-';
              }).filter(Boolean).join(', ');
              mesas = reserva.mesas.map(m => m.nro_mesa || m.nombre || m.id_mesa || '-').filter(Boolean).join(', ');
            } else {
              salones = reserva.salon || '-';
                mesas = String(reserva.nro_mesa ?? reserva.mesa ?? '-');
            }
            return (
              <tr key={key} className={isDeleted ? 'rowDeleted' : ''}>
                <td>{key}</td>
                <td>{getNombreCliente(reserva)}</td>
                <td>{formatearFecha(reserva.fecha_reserva)}</td>
                <td>{reserva.hora_inicio || '-'}</td>
                <td>{reserva.hora_fin || '-'}</td>
                <td>{salones}</td>
                <td>{mesas}</td>
                <td>{getBadgeEstado(reserva.estado, isDeleted)}</td>
                <td>
                  <button type="button" onClick={() => onEdit(reserva)} disabled={isDeleted} className="editBtn reservasList-modernBtn">✏️ Editar</button>
                  <button type="button" onClick={() => handleDeleteClick(reserva)} disabled={isDeleted} className="deleteBtn reservasList-modernBtn">🗑️ Eliminar</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && reservaToDelete && (
        <div className="modal-overlay">
          <div className="modal-form">
            <div className="modal-header">
              <h3 className="modal-title">¿Eliminar Reserva?</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                ¿Estás seguro de que deseas eliminar la reserva de <strong>{getNombreCliente(reservaToDelete)}</strong>?
              </p>
              <div className="reserva-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span className="detail-label">Fecha:</span>
                  <span className="detail-value">{formatearFecha(reservaToDelete.fecha_reserva)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🔖</span>
                  <span className="detail-label">Estado:</span>
                  <span className="detail-value">{reservaToDelete.estado}</span>
                </div>
              </div>
              <div className="warning-message">
                <span className="warning-icon">⚠️</span>
                Esta acción no se puede deshacer.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleCancelarEliminacion} disabled={loading} className="btn-modal-cancel">Cancelar</button>
              <button type="button" onClick={handleConfirmarEliminacion} disabled={loading} className="btn-modal-delete">
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasList;
