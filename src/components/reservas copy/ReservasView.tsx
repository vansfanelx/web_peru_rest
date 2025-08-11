import React, { useEffect, useState } from 'react';
import './ReservasView.css';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltrosReservas from './FiltrosReservas';
import ReservasList, { Reserva } from './ReservasList';
import ReservaForm from './ReservaForm';
import { getReservas, createReserva, updateReserva, deleteReserva, cambiarEstadoReserva } from '../../api/api';


// Tipos de filtro
interface Filtros {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  cliente?: string;
  capacidad?: string | number;
  nro_mesa?: string;
}

// Definir el tipo FormReserva localmente
type FormReserva = {
  id_reserva?: number;
  id_cliente: string | number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  numero_personas: string | number;
  observaciones: string;
  mesas: any[];
  cliente: string;
  mesa: string;
  salon: string;
};

const ReservasView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mostrarHistorico, setMostrarHistorico] = useState<boolean>(false);
  // Obtener fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const fechaActual = `${yyyy}-${mm}-${dd}`;
  // Día actual a las 00:00 y 23:59
  const fechaInicioDefault = `${fechaActual}T00:00:00`;
  const fechaFinDefault = `${fechaActual}T23:59:59`;

  const [filtros, setFiltros] = useState<Filtros>({
    fecha_inicio: fechaInicioDefault,
    fecha_fin: fechaFinDefault,
    estado: '',
    cliente: '',
    capacidad: '',
    nro_mesa: ''
  });
  const [formReserva, setFormReserva] = useState<FormReserva>({
    id_cliente: '',
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'pendiente',
    numero_personas: '',
    observaciones: '',
    mesas: [],
    cliente: '',
    mesa: '',
    salon: ''
  });
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener reservas con filtros
  const fetchReservas = async (params: { [key: string]: any } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const filtrosUsar = Object.keys(params).length > 0 ? params : filtros;
      const filtrosActivos: { [key: string]: any } = {};

      // Siempre filtrar por el día actual si no se especifica fecha
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const fechaActual = `${yyyy}-${mm}-${dd}`;

      // Formatear fecha y hora
      const formatFecha = (fecha: string) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().slice(0, 10);
      };
      const formatHora = (fecha: string) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        if (isNaN(d.getTime())) return '';
        return d.toTimeString().slice(0, 8);
      };

      // Mapear filtros de fechas correctamente para rango
      if (filtrosUsar.fecha_inicio && filtrosUsar.fecha_fin) {
        filtrosActivos.fecha_inicio = formatFecha(filtrosUsar.fecha_inicio);
        filtrosActivos.fecha_fin = formatFecha(filtrosUsar.fecha_fin);
        // Si quieres filtrar también por hora, puedes agregar:
        // filtrosActivos.hora_inicio = formatHora(filtrosUsar.fecha_inicio);
        // filtrosActivos.hora_fin = formatHora(filtrosUsar.fecha_fin);
      } else if (filtrosUsar.fecha_inicio) {
        filtrosActivos.fecha_reserva = formatFecha(filtrosUsar.fecha_inicio);
        // filtrosActivos.hora_inicio = formatHora(filtrosUsar.fecha_inicio);
      } else {
        filtrosActivos.fecha_reserva = fechaActual;
      }

      if (filtrosUsar.cliente && filtrosUsar.cliente.trim() !== '') filtrosActivos.id_cliente = filtrosUsar.cliente.trim();
      if (filtrosUsar.capacidad && filtrosUsar.capacidad !== '') filtrosActivos.capacidad = filtrosUsar.capacidad;
      if (filtrosUsar.nro_mesa && filtrosUsar.nro_mesa.trim() !== '') filtrosActivos.nro_mesa = filtrosUsar.nro_mesa.trim();

      // Estado y modo histórico
      if (mostrarHistorico) {
        filtrosActivos.historico = true;
        // En modo histórico, solo enviar estado si el usuario lo selecciona explícitamente
        if (filtrosUsar.estado && filtrosUsar.estado !== '' && filtrosUsar.estado !== 'Todos') {
          filtrosActivos.estado = filtrosUsar.estado;
        } else {
          delete filtrosActivos.estado;
        }
      } else {
        // Si el usuario selecciona un estado específico, usarlo; si no, mostrar pendientes
        if (filtrosUsar.estado && filtrosUsar.estado !== '' && filtrosUsar.estado !== 'Todos') {
          filtrosActivos.estado = filtrosUsar.estado;
        } else {
          filtrosActivos.estado = 'pendiente';
        }
      }

      // Limpiar filtros
      Object.keys(filtrosActivos).forEach(key => {
        if (
          filtrosActivos[key] === undefined ||
          filtrosActivos[key] === null ||
          (typeof filtrosActivos[key] === 'string' && filtrosActivos[key].trim() === '')
        ) {
          delete filtrosActivos[key];
        }
      });

      // Obtener reservas
      const data = await getReservas(filtrosActivos);
      if (data && Array.isArray(data.data)) {
        setReservas(data.data);
      } else if (Array.isArray(data)) {
        setReservas(data);
      } else {
        setReservas([]);
      }
    } catch (e: any) {
      setError(e.message);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line
  }, [mostrarHistorico]);

  // Editar reserva
  function handleEditReserva(reserva: Reserva) {
    setFormReserva({
      id_reserva: reserva.id_reserva,
      estado: reserva.estado ?? 'pendiente',
      observaciones: (reserva as any).observaciones ?? '',
      id_cliente: '',
      fecha_reserva: '',
      hora_inicio: '',
      hora_fin: '',
      numero_personas: '',
      mesas: [],
      cliente: '',
      mesa: '',
      salon: ''
    });
    setIsEdit(true);
    setEditId(reserva.id_reserva ?? null);
    setModalOpen(true);
  }

  // Eliminar reserva
  async function handleDeleteReserva(id: number | string) {
    await deleteReserva(id);
    fetchReservas(filtros);
  }

  return (
    <div className="reservasContainer">
      <FiltrosReservas
        filtros={filtros}
        onChange={e => {
          let name, value;
          if (e && e.target) {
            name = e.target.name;
            value = e.target.value;
          } else if (e && (e as any).name) {
            name = (e as any).name;
            value = (e as any).value;
          }
          // Si el filtro es estado, actualizar y buscar automáticamente
          setFiltros({ ...filtros, [name]: value });
          if (name === 'estado') {
            fetchReservas({ ...filtros, [name]: value });
          }
        }}
        onBuscar={() => fetchReservas(filtros)}
      />
      <div className="reservasViewBtns">
        <button
          className="nuevaReservaBtn"
          onClick={() => {
            setIsEdit(false);
            setFormReserva({
              id_cliente: '',
              fecha_reserva: '',
              hora_inicio: '',
              hora_fin: '',
              estado: 'pendiente',
              mesas: [],
              numero_personas: '',
              observaciones: '',
              cliente: '',
              mesa: '',
              salon: ''
            });
            setModalOpen(true);
          }}
        >
          Nueva reserva
        </button>
        <button
          className="historicoBtn"
          onClick={() => setMostrarHistorico(h => !h)}
        >
          {mostrarHistorico ? 'Ver solo activas' : 'Ver histórico'}
        </button>
      </div>
      {modalOpen && (
        <div className="reserva-modal-overlay">
          <div className="reserva-modal-content">
            <button type="button" className="reserva-modal-close" onClick={() => setModalOpen(false)} title="Cerrar" style={{ position: 'absolute', top: 12, right: 16, fontSize: 28, background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', zIndex: 2 }}>×</button>
            <div style={{ padding: 32, paddingTop: 36 }}>
              <ReservaForm
                reserva={formReserva}
                onChange={data => setFormReserva({ ...formReserva, ...data })}
                onSubmit={async data => {
                  try {
                    if (isEdit && editId) {
                      await cambiarEstadoReserva(editId, data.estado, data.observaciones);
                    } else {
                      // Nuevo formato: fecha_inicio, fecha_fin, id_mesas
                      if (data.fecha_inicio && data.fecha_fin && Array.isArray(data.id_mesas)) {
                        if (!data.id_cliente || !data.fecha_inicio || !data.fecha_fin || !data.id_mesas.length || !data.numero_personas) {
                          setError('Completa todos los campos obligatorios.');
                          return;
                        }
                        const payload = {
                          id_cliente: data.id_cliente,
                          fecha_inicio: data.fecha_inicio,
                          fecha_fin: data.fecha_fin,
                          id_mesas: data.id_mesas,
                          numero_personas: data.numero_personas,
                          observaciones: data.observaciones || ''
                        };
                        await createReserva(payload);
                      } else {
                        // Compatibilidad con formato antiguo (por si acaso)
                        const mesasSeleccionadas = Array.isArray(data.mesas)
                          ? data.mesas.filter(m => m && !isNaN(Number(m)))
                          : [];
                        if (!data.id_cliente || !data.fecha_reserva || !data.hora_inicio || !data.hora_fin || !data.numero_personas) {
                          setError('Completa todos los campos obligatorios.');
                          return;
                        }
                        if (mesasSeleccionadas.length === 0) {
                          setError('Debes seleccionar al menos una mesa disponible.');
                          return;
                        }
                        const payload = {
                          id_cliente: data.id_cliente,
                          fecha_reserva: data.fecha_reserva,
                          hora_inicio: data.hora_inicio,
                          hora_fin: data.hora_fin,
                          estado: data.estado || 'pendiente',
                          mesas: mesasSeleccionadas.map(Number),
                          numero_personas: data.numero_personas,
                          observaciones: data.observaciones
                        };
                        await createReserva(payload);
                      }
                    }
                    setModalOpen(false);
                    fetchReservas(filtros);
                    setError(null);
                  } catch (error: any) {
                    if (error.message && error.message.includes('disponibles de 8:00 AM a 8:00 PM')) {
                      setError('Fuera de horario de atención: las reservas solo están disponibles de 8:00 AM a 8:00 PM.');
                    } else {
                      setError(error.message || 'Error al procesar la reserva');
                    }
                  }
                }}
                isEdit={isEdit}
                error={error}
                setError={setError}
              />
            </div>
          </div>
        </div>
      )}
      <ReservasList
        reservas={reservas}
        onEdit={handleEditReserva}
        onDelete={handleDeleteReserva}
        historico={mostrarHistorico}
      />
      {loading && <div style={{ marginTop: 16, fontWeight: 500, color: '#6c63ff' }}>Cargando reservas...</div>}
    </div>
  );
};

export default ReservasView;
