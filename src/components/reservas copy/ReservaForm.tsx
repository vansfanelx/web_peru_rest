import React, { useState, useEffect } from 'react';
import './ReservaForm.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getUsuariosClientes, getMesasDisponibles, getSalones } from '../../api/api';

export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  documento?: string;
  direccion?: string;
  estado?: string;
  id_cliente?: number;
  id_usu?: number;
}

export interface ReservaFormProps {
  reserva: any;
  onChange: (data: any) => void;
  onSubmit: (data: any) => void;
  isEdit: boolean;
  error?: string | null;
  setError?: (msg: string | null) => void;
}

const ReservaForm: React.FC<ReservaFormProps> = ({ reserva, onChange, onSubmit, isEdit, error, setError }) => {
  if (isEdit) {
    const [estado, setEstado] = useState<string>(reserva.estado || 'pendiente');
    const [observaciones, setObservaciones] = useState(reserva.observaciones || "");
    return (
      <div className="reservaFormContainer">
        <h2 className="formTitle">Editar estado de reserva</h2>
  <form className="reservaForm" onSubmit={e => { e.preventDefault(); onSubmit({ estado, observaciones: typeof observaciones === 'string' ? observaciones : '' }); }}>
          <div className="formGroup">
            <label>Estado:</label>
            <select value={estado} onChange={e => setEstado(e.target.value)} className="inputEstado">
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          <div className="formGroup">
            <label>Observaciones:</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Observaciones (opcional)"
              className="inputObservaciones"
              maxLength={500}
              style={{ width: '100%', minHeight: 48, resize: 'vertical', marginTop: 4 }}
            />
          </div>
          <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="submit" className="buscarMesasBtn" style={{ minWidth: 120, fontWeight: 600 }}>Guardar</button>
          </div>
        </form>
      </div>
    );
  }

  const [fecha, setFecha] = useState<Date | null>(reserva.fecha_reserva ? new Date(reserva.fecha_reserva) : null);
  const [numeroPersonas, setNumeroPersonas] = useState<string>(reserva.numero_personas || '');
  const [clienteInput, setClienteInput] = useState<string>('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showClientes, setShowClientes] = useState<boolean>(false);
  const [cargandoClientes, setCargandoClientes] = useState<boolean>(false);
  const [mesasLibres, setMesasLibres] = useState<any[]>([]);
  const [observaciones, setObservaciones] = useState(reserva.observaciones || "");

  // Automatizar consulta de mesas libres
  useEffect(() => {
    // Solo buscar si todos los campos obligatorios están completos
    if (!fecha || !numeroPersonas || !clienteSeleccionado) {
      setMesasLibres([]);
      return;
    }
    let cancelado = false;
    async function buscarMesas() {
      setError && setError('');
      setMesasLibres([]);
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
        if (!cancelado) {
          const libres = Array.isArray(data.mesas_disponibles) ? data.mesas_disponibles : [];
          setMesasLibres(libres);
          if (libres.length === 0) setError && setError('No hay mesas libres para la capacidad y fecha seleccionada.');
        }
      } catch (err) {
        if (!cancelado) {
          setError && setError('Error al buscar mesas libres');
          setMesasLibres([]);
        }
      }
    }
    buscarMesas();
    return () => { cancelado = true; };
  }, [fecha, numeroPersonas, clienteSeleccionado]);

  // Limpiar selección de mesas si cambia fecha/capacidad/cliente
  useEffect(() => {
    setMesasLibres([]);
  }, [fecha, numeroPersonas, clienteSeleccionado]);

  useEffect(() => {
    setCargandoClientes(true);
    getUsuariosClientes()
      .then((data) => {
        const clientesActivos = data.map((cliente: any) => ({
          id: cliente.id_usu,
          nombre: cliente.name || cliente.nombre_comercial || cliente.razon_social || cliente.nombre || `Cliente ${cliente.id_usu}`,
          telefono: cliente.telefono || cliente.phone,
          email: cliente.email,
          documento: cliente.documento,
          direccion: cliente.direccion,
          estado: cliente.estado,
          id_cliente: cliente.id_usu,
          id_usu: cliente.id_usu
        }));
        setClientes(clientesActivos);
      })
      .finally(() => setCargandoClientes(false));
  }, []);

  // ...aquí va el formulario original para crear reservas...
  // Evitar doble scroll: el scroll debe estar solo en .reserva-modal-content, no en .reservaFormContainer ni en el form
  // Evitar fechas pasadas: minDate en DatePicker
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  return (
    <div className="reservaFormContainer" style={{ overflow: 'visible', maxHeight: 'none' }}>
      <h2 className="formTitle">{isEdit ? 'Editar Reserva' : 'Nueva Reserva'}</h2>
      <form className="reservaForm" style={{ overflow: 'visible', maxHeight: 'none' }} onSubmit={e => { e.preventDefault(); }}>
        <div className="formGroup" style={{ position: 'relative', width: '100%' }}>
          <label>Cliente:</label>
          <div className="inputClienteRow">
            <input
              type="text"
              value={clienteInput}
              onChange={e => {
                setClienteInput(e.target.value);
                setShowClientes(true);
              }}
              placeholder="Buscar cliente..."
              className="inputCliente"
              autoFocus
            />
            {clienteInput && clientes.length > 0 && (
              <span className="clientesDisponiblesInfo">
                ✓ {clientes.filter(c => c.nombre.toLowerCase().includes(clienteInput.toLowerCase())).length} clientes disponibles
              </span>
            )}
            {showClientes && clienteInput && (
              <div className={`clientesDropdown${showClientes ? ' clientesDropdownVisible' : ''}`}>
                {cargandoClientes ? (
                  <div className="clienteCardLoading">Cargando clientes...</div>
                ) : (
                  clientes
                    .filter(c => c.nombre.toLowerCase().includes(clienteInput.toLowerCase()))
                    .map(c => (
                      <div
                        key={c.id}
                        className={`clienteCard${clienteSeleccionado?.id === c.id ? ' clienteCardSeleccionada' : ''}`}
                        onClick={() => {
                          setClienteSeleccionado(c);
                          setClienteInput(c.nombre);
                          setShowClientes(false);
                        }}
                      >
                        <div className="clienteCardNombre">{c.nombre}</div>
                        <div className="clienteCardDatos">
                          {c.telefono && (
                            <span className="clienteCardIcono clienteCardTelefono">
                              <svg width="16" height="16" fill="#e11d48" viewBox="0 0 24 24" className="clienteCardIconoSvg"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C7.61 22 2 16.39 2 9.5a1 1 0 011-1H6.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.21 1.11l-2.2 2.2z"></path></svg>
                              {c.telefono}
                            </span>
                          )}
                          {c.email && (
                            <span className="clienteCardIcono clienteCardEmail">
                              <svg width="16" height="16" fill="#6366f1" viewBox="0 0 24 24" className="clienteCardIconoSvg"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11zm1.5 0v.217l8.25 5.5a.75.75 0 00.75 0l8.25-5.5V6.5a1 1 0 00-1-1h-15a1 1 0 00-1 1zm17 1.933l-7.72 5.146a2.75 2.75 0 01-2.56 0L3.5 8.433V17.5a1 1 0 001 1h15a1 1 0 001-1V8.433z"></path></svg>
                              {c.email}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="formGroup formGroupRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 0, width: '100%' }}>
          <div className="formFieldCapacidad" style={{ flex: 1, minWidth: 180, maxWidth: 320 }}>
            <label>Capacidad:</label>
            <input
              type="number"
              value={numeroPersonas}
              onChange={e => setNumeroPersonas(e.target.value)}
              placeholder="Capacidad"
              className="inputCapacidad"
              min={1}
              style={{ width: '100%' }}
            />
          </div>
          <div className="formFieldFecha" style={{ flex: 1, minWidth: 220, maxWidth: 380, marginLeft: 24 }}>
            <label>Fecha:</label>
            <div>
              <DatePicker
                selected={fecha}
                onChange={date => setFecha(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="Selecciona fecha"
                className="reserva-form-input reserva-datepicker-ancho"
                popperClassName="reserva-datepicker-popper"
                calendarClassName="reserva-datepicker-calendar"
                wrapperClassName="reserva-datepicker-wrapper"
                popperPlacement="right"
                minTime={new Date(0, 0, 0, 12, 0)}
                maxTime={new Date(0, 0, 0, 20, 0)}
                minDate={hoy}
              />
            </div>
          </div>
        </div>
        <div className="formGroup" style={{ marginTop: 10, marginBottom: 0 }}>
          <label htmlFor="observaciones" style={{ fontWeight: 500, color: '#374151', marginBottom: 4 }}>Observaciones:</label>
          <textarea
            id="observaciones"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales (opcional)"
            className="inputObservaciones"
            style={{ width: '100%', minHeight: 44, borderRadius: 8, border: '1px solid #cbd5e1', padding: '8px 12px', fontSize: 15, marginBottom: 8, resize: 'vertical' }}
            maxLength={300}
          />
        </div>
        <div className="formGroup" style={{ marginTop: 0, marginBottom: 0 }}>
          <button
            type="button"
            className="buscarMesasBtn"
            style={{ width: '100%', fontWeight: 600, fontSize: 16, margin: 0, display: 'block', boxSizing: 'border-box' }}
            onClick={async () => {
              setError && setError('');
              if (!fecha || !numeroPersonas || !clienteSeleccionado) {
                setError && setError('Completa todos los campos para buscar mesas libres');
                return;
              }
              try {
                setError && setError('');
                setMesasLibres([]);
                const capacidadNum = parseInt(numeroPersonas, 10);
                // Calcular hora_inicio y hora_fin a partir de la fecha seleccionada (1 hora de duración por defecto)
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
                const libres = Array.isArray(data.mesas_disponibles) ? data.mesas_disponibles : [];
                setMesasLibres(libres);
                if (libres.length === 0) setError && setError('No hay mesas libres para la capacidad y fecha seleccionada.');
              } catch (err) {
                setError && setError('Error al buscar mesas libres');
                setMesasLibres([]);
              }
            }}
          >
            Buscar mesas libres
          </button>
        </div>
        {error && (
          <div className="reservaFormError" style={{ color: '#b91c1c', marginTop: 8, marginBottom: 8, fontWeight: 500, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', textAlign: 'center' }}>
            {error}
          </div>
        )}
  {mesasLibres.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              Mesas disponibles: <span style={{ color: '#6366f1' }}>{mesasLibres.length} mesas encontradas</span>
            </div>
            <div className="mesasLibresGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {mesasLibres.map((mesa: any) => (
                  <div
                    key={mesa.id_mesa}
                    className={`mesaCard${mesa.seleccionada ? ' mesaCardSeleccionada' : ''}`}
                    style={{
                      background: mesa.seleccionada ? '#e0f2fe' : '#fff',
                      border: mesa.seleccionada ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: 10,
                      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                      padding: '14px 12px',
                      cursor: mesasLibres.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      alignItems: 'flex-start',
                      transition: 'border 0.2s, background 0.2s'
                    }}
                    onClick={() => {
                      if (mesasLibres.length === 0) return;
                      setMesasLibres(mesasLibres.map(m => m.id_mesa === mesa.id_mesa ? { ...m, seleccionada: !m.seleccionada } : m));
                    }}
                  >
                    <div className="mesaCardNombre">Mesa {mesa.nro_mesa || mesa.nombre}</div>
                    <div style={{ color: '#2563eb', fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
                      <svg width="16" height="16" fill="#2563eb" style={{ marginRight: 2, verticalAlign: 'middle' }} viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      {mesa.capacidad} personas
                    </div>
                    <div style={{ color: '#6366f1', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="14" height="14" fill="#6366f1" style={{ marginRight: 2, verticalAlign: 'middle' }} viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      {typeof mesa.salon === 'object' ? mesa.salon.descripcion : mesa.salon || mesa.id_salon || '-'}
                    </div>
                  </div>
                ))}
            </div>
            {/* Botón de confirmar y resumen de reserva */}
            {mesasLibres.some(m => m.seleccionada) && clienteSeleccionado && fecha && numeroPersonas && (
              <div style={{ marginTop: 32, background: '#f8fafc', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(44,62,80,0.08)' }}>
                <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 12 }}>Resumen de la reserva</div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6366f1', fontWeight: 600, marginRight: 6 }}>🧑‍💼 Cliente:</span> <span>{clienteSeleccionado.nombre}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#2563eb', fontWeight: 600, marginRight: 6 }}>📅 Fecha y hora:</span> <span>{fecha.toLocaleString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6366f1', fontWeight: 600, marginRight: 6 }}>👥 Capacidad:</span> <span>{numeroPersonas} personas</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6366f1', fontWeight: 600, marginRight: 6 }}>🍽️ Mesa:</span> <span>{mesasLibres.filter(m => m.seleccionada).map(m => `${m.nro_mesa || m.nombre} (Salón: ${typeof m.salon === 'object' ? m.salon.descripcion : m.salon || m.id_salon || '-'})`).join(', ')}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#2563eb', fontWeight: 600, marginRight: 6 }}>🏢 Salón:</span> <span>{typeof mesasLibres.find(m => m.seleccionada)?.salon === 'object' ? mesasLibres.find(m => m.seleccionada)?.salon?.descripcion : mesasLibres.find(m => m.seleccionada)?.salon || '-'}</span>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: '#6366f1', fontWeight: 600, marginRight: 6 }}>📝 Observaciones:</span> <span>{observaciones || 'Sin observaciones'}</span>
                </div>
                <div style={{ marginTop: 18, fontSize: 15, color: '#222' }}>
                  ¿Confirmas que deseas realizar esta reserva con los datos mostrados?
                </div>
                <button
                  type="button"
                  className="buscarMesasBtn"
                  style={{ marginTop: 18, minWidth: 180, fontWeight: 700, fontSize: 16 }}
                  disabled={!(mesasLibres.some(m => m.seleccionada) && clienteSeleccionado && fecha && numeroPersonas)}
                  onClick={() => {
                    // Validaciones estrictas antes de enviar
                    const mesasSeleccionadas = mesasLibres.filter(m => m.seleccionada).map(m => m.id_mesa);
                    if (!fecha) { setError && setError('Selecciona una fecha válida.'); return; }
                    if (!clienteSeleccionado) { setError && setError('Selecciona un cliente.'); return; }
                    if (!numeroPersonas || isNaN(Number(numeroPersonas)) || Number(numeroPersonas) < 1) { setError && setError('Capacidad inválida.'); return; }
                    if (!mesasSeleccionadas.length) { setError && setError('Selecciona al menos una mesa.'); return; }

                    // Formato ISO: YYYY-MM-DDTHH:mm:ss
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    const fechaInicioISO = `${fecha.getFullYear()}-${pad(fecha.getMonth()+1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:00`;
                    const fechaFinObj = new Date(fecha.getTime() + 60 * 60 * 1000);
                    const fechaFinISO = `${fechaFinObj.getFullYear()}-${pad(fechaFinObj.getMonth()+1)}-${pad(fechaFinObj.getDate())}T${pad(fechaFinObj.getHours())}:${pad(fechaFinObj.getMinutes())}:00`;

                    // Validar rango horario permitido (12:00:00 a 20:00:00)
                    const horaInicio = fecha.getHours();
                    const horaFin = fechaFinObj.getHours();
                    if (horaInicio < 12 || horaInicio > 20) {
                      setError && setError('El horario de inicio debe ser entre 12:00 y 20:00.');
                      return;
                    }
                    if (horaFin > 20 || (horaInicio === 20 && fecha.getMinutes() > 0)) {
                      setError && setError('La reserva no puede terminar después de las 20:00.');
                      return;
                    }

                    // Validar capacidad
                    const capacidadTotal = mesasLibres.filter(m => m.seleccionada).reduce((acc, m) => acc + (m.capacidad || 0), 0);
                    if (Number(numeroPersonas) > capacidadTotal) {
                      setError && setError(`La capacidad total de las mesas seleccionadas (${capacidadTotal}) es menor al número de personas (${numeroPersonas}).`);
                      return;
                    }

                    // Validar id_cliente
                    if (!clienteSeleccionado.id_cliente && !clienteSeleccionado.id) {
                      setError && setError('El cliente seleccionado no es válido.');
                      return;
                    }

                    setError && setError('');
                    // Enviar solo los campos requeridos por el backend
                    onSubmit({
                      id_cliente: clienteSeleccionado?.id_cliente || clienteSeleccionado?.id || '',
                      fecha_inicio: fechaInicioISO,
                      fecha_fin: fechaFinISO,
                      id_mesas: mesasSeleccionadas,
                      numero_personas: Number(numeroPersonas),
                      observaciones: typeof observaciones === 'string' && observaciones.trim() !== '' ? observaciones : ' - '
                    });
                  }}
                >
                  Confirmar reserva
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default ReservaForm;
