/// <reference types="vite/client" />
// Centraliza todas las llamadas a la API (login, salones, etc)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/web';

// Debug: Mostrar la URL de la API
console.log('🌐 API_URL configurada:', API_URL);
console.log('🔧 Variables de entorno:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

/**
 * Consulta mesas disponibles para una fecha y rango horario específico usando el endpoint oficial.
 * @param params { fecha_reserva, hora_inicio, hora_fin, numero_personas }
 * @returns mesas_disponibles (array), mesas_ocupadas (array), total_disponibles, total_ocupadas, horario_consulta
 */
export async function getMesasDisponibles(params: {
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  numero_personas?: number;
}) {
  if (!isTokenValid()) return;
  // Corregir la URL del endpoint para que coincida con la disponible en el servidor
  const res = await fetch(`${API_URL}/mesas-disponibles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) {
    console.error(`Error al consultar mesas disponibles: ${res.status} ${res.statusText}`);
    throw new Error(`Error al consultar mesas disponibles (${res.status})`);
  }
  const responseData = await res.json();
  if (responseData && responseData.success && responseData.data) {
    return responseData.data;
  }
  throw new Error('Respuesta inesperada al consultar mesas disponibles');
}


// --- LOGIN ---
// El API espera { email, password }
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

export async function logout() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (e) {
    // Ignorar errores de red o backend
  }
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

// --- REGISTRO ---
// El API espera { name, email, telefono, password }
export async function register(userData: { name: string; email: string; telefono: string; password: string }) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
}


// Valida si el token existe y no está expirado, pero NO borra ni redirige.
// El manejo de cierre de sesión debe hacerse en los componentes según la UX deseada.
function isTokenValid() {
  const token = localStorage.getItem('token');
  return !!token;
}

// --- SALONES ---
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
}

/**
 * Obtiene todos los salones (activos e inactivos) con sus mesas y estadísticas.
 * Usa el endpoint listarSalones del backend.
 */
export async function getSalones() {
  if (!isTokenValid()) return [];
  const res = await fetch(`${API_URL}/ajustes/salones`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    // No autorizado, dejar que el frontend lo maneje
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('Error al obtener salones');
  const responseData = await res.json();
  console.log('📋 Respuesta cruda de salones:', responseData);
  // Siempre retornar el array correcto
  if (responseData && typeof responseData === 'object') {
    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }
    if (Array.isArray(responseData.salones)) {
      return responseData.salones;
    }
  }
  if (Array.isArray(responseData)) {
    return responseData;
  }
  console.error('❌ Formato inesperado en respuesta de salones:', responseData);
  return [];
}


export async function createSalon(salonData: { descripcion: string; estado: string }) {
  if (!isTokenValid()) return;
  const res = await fetch(`${API_URL}/ajustes/salones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(salonData),
  });
  if (!res.ok) throw new Error('Error al crear salón');
  
  const responseData = await res.json();
  console.log('✅ Salón creado, respuesta:', responseData);
  return responseData;
}


export async function updateSalon(id: number, salonData: { descripcion: string; estado: string }) {
  if (!isTokenValid()) return;
  const res = await fetch(`${API_URL}/ajustes/salones/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(salonData),
  });
  if (!res.ok) throw new Error('Error al editar salón');
  
  const responseData = await res.json();
  console.log('✅ Salón editado, respuesta:', responseData);
  return responseData;
}

export async function deleteSalon(id: number) {
  if (!isTokenValid()) return;
  // Obtener las mesas del salón antes de intentar eliminar
  const mesas = await getMesas();
  const mesasDelSalon = mesas.filter(mesa => mesa.id_salon === id);
  const mesasNoLibres = mesasDelSalon.filter(mesa => mesa.estado !== 'libre');

  if (mesasNoLibres.length > 0) {
    // Hay mesas en uso, lanzar error con mensaje claro
    throw new Error('No se puede eliminar el salón porque tiene mesas en uso o no están en estado "libre". Elimine o libere las mesas primero.');
  }

  // Eliminar todas las mesas del salón
  for (const mesa of mesasDelSalon) {
    try {
      await deleteMesa(mesa.id_mesa);
    } catch (err) {
      console.error(`Error al eliminar la mesa ${mesa.id_mesa}:`, err);
      // Si falla la eliminación de una mesa, lanzar error y detener el proceso
      throw new Error(`No se pudo eliminar la mesa ${mesa.numero_mesa || mesa.id_mesa}. Detalle: ${err.message}`);
    }
  }

  // Eliminar el salón
  const res = await fetch(`${API_URL}/ajustes/salones/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar salón');

  const responseData = await res.json();
  console.log('✅ Salón eliminado, respuesta:', responseData);
  return responseData;
}

// --- MESAS ---
/**
 * Obtiene todas las mesas, permitiendo filtrar por fecha y capacidad si se pasan como parámetros.
 * @param params Opcional: { fecha, capacidad }
 */
export async function getMesas(params?: { fecha?: string; capacidad?: string | number }) {
  if (!isTokenValid()) return;
  let url = `${API_URL}/ajustes/mesas`;
  if (params && (params.fecha || params.capacidad)) {
    const query = new URLSearchParams();
    if (params.fecha) query.append('fecha', params.fecha);
    if (params.capacidad) query.append('capacidad', String(params.capacidad));
    url += `?${query.toString()}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) throw new Error('Error al obtener mesas');
  const responseData = await res.json();
  console.log('🍽️ Respuesta cruda de mesas:', responseData);
  // Retornar el campo correcto según la estructura
  if (responseData && typeof responseData === 'object') {
    if (Array.isArray(responseData.data)) {
      console.log('✅ Datos de mesas extraídos del campo data:', responseData.data);
      return responseData.data;
    }
    if (Array.isArray(responseData.mesas)) {
      console.log('✅ Datos de mesas extraídos del campo mesas:', responseData.mesas);
      return responseData.mesas;
    }
  }
  if (Array.isArray(responseData)) {
    return responseData;
  }
  console.error('❌ Formato inesperado en respuesta de mesas:', responseData);
  return [];
}

export async function createMesa(formData) {
  if (!isTokenValid()) return;
  try {
    const headers = { ...getAuthHeaders() };
    // Remover Content-Type para que el navegador lo establezca automáticamente con boundary
    const { 'Content-Type': removed, ...headersWithoutContentType } = headers;
    
    const res = await fetch(`${API_URL}/ajustes/mesas`, {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData,
    });
    
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        console.error('❌ Error del servidor al crear mesa:', errorData);
        
        if (errorData.message) {
          if (errorData.message.includes('reserva_mesas') || errorData.message.includes('reserva_mesa')) {
            errorMessage = 'Error de base de datos: problema con la tabla de reservas-mesas. Contacte al administrador del sistema.';
          } else if (errorData.message.includes('validation')) {
            errorMessage = 'Error de validación: verifique los datos ingresados.';
          } else {
            errorMessage = `Error del servidor: ${errorData.message}`;
          }
        } else {
          errorMessage = 'Error desconocido del servidor';
        }
      } catch (parseError) {
        const errorText = await res.text();
        console.error('❌ Error al parsear respuesta de error:', parseError);
        errorMessage = `Error del servidor (${res.status}): ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await res.json();
    console.log('✅ Mesa creada exitosamente:', responseData);
    
    // Extraer datos del campo `data` si existe
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData;
  } catch (error) {
    console.error('❌ Error en createMesa:', error);
    
    // Si es un error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    
    // Re-lanzar el error con el mensaje ya procesado
    throw error;
  }
}

export async function updateMesa(id_mesa, formData) {
  if (!isTokenValid()) return;
  try {
    const headers = { ...getAuthHeaders() };
    // Remover Content-Type para que el navegador lo establezca automáticamente con boundary
    const { 'Content-Type': removed, ...headersWithoutContentType } = headers;
    
    const res = await fetch(`${API_URL}/ajustes/mesas/${id_mesa}`, {
      method: 'POST', // Cambiar a POST para soportar FormData
      headers: {
        ...headersWithoutContentType,
        'X-HTTP-Method-Override': 'PUT' // Simular PUT con POST
      },
      body: formData,
    });
    
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        console.error('❌ Error del servidor al editar mesa:', errorData);
        
        if (errorData.message) {
          if (errorData.message.includes('reserva_mesas') || errorData.message.includes('reserva_mesa')) {
            errorMessage = 'Error de base de datos: problema con la tabla de reservas-mesas. Contacte al administrador del sistema.';
          } else if (errorData.message.includes('reservas activas')) {
            errorMessage = 'No se puede editar la mesa porque tiene reservas activas.';
          } else {
            errorMessage = `Error del servidor: ${errorData.message}`;
          }
        } else {
          errorMessage = 'Error desconocido del servidor';
        }
      } catch (parseError) {
        const errorText = await res.text();
        console.error('❌ Error al parsear respuesta de error:', parseError);
        errorMessage = `Error del servidor (${res.status}): ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await res.json();
    console.log('✅ Mesa editada exitosamente:', responseData);
    
    // Extraer datos del campo `data` si existe
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData;
  } catch (error) {
    console.error('❌ Error en updateMesa:', error);
    
    // Si es un error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    
    // Re-lanzar el error con el mensaje ya procesado
    throw error;
  }
}

export async function deleteMesa(id_mesa) {
  if (!isTokenValid()) return;
  try {
    const res = await fetch(`${API_URL}/ajustes/mesas/${id_mesa}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        console.error('❌ Error del servidor al eliminar mesa:', errorData);
        
        // Extraer mensaje de error más específico
        if (errorData.message) {
          if (errorData.message.includes('reserva_mesas') || errorData.message.includes('reserva_mesa')) {
            errorMessage = 'Error de base de datos: problema con la tabla de reservas-mesas. Contacte al administrador del sistema.';
          } else if (errorData.message.includes('reservas activas')) {
            errorMessage = 'No se puede eliminar la mesa porque tiene reservas activas.';
          } else {
            errorMessage = `Error del servidor: ${errorData.message}`;
          }
        } else {
          errorMessage = 'Error desconocido del servidor';
        }
      } catch (parseError) {
        const errorText = await res.text();
        console.error('❌ Error al parsear respuesta de error:', parseError);
        errorMessage = `Error del servidor (${res.status}): ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const responseData = await res.json();
    console.log('✅ Mesa eliminada exitosamente:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ Error en deleteMesa:', error);
    
    // Si es un error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    
    // Re-lanzar el error con el mensaje ya procesado
    throw error;
  }
}

// --- RESERVAS ---
/**
 * Obtiene reservas. Si se pasa { historico: true } en params, incluye todas las reservas (todos los estados).
 * Por defecto, solo muestra reservas en estado "pendiente" (según la relación reserva_estado).
 */
export async function getReservas(params: Record<string, any> = {}) {
  if (!isTokenValid()) return;
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/reservas${query ? `?${query}` : ''}`;
    console.log('🔄 Obteniendo reservas desde:', url);

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    console.log('📡 Respuesta de reservas:', res.status, res.statusText);

    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        console.error('❌ Error del servidor al obtener reservas:', errorData);

        if (res.status === 403) {
          errorMessage = 'No tienes permisos para acceder a las reservas. Verifica tu sesión.';
        } else if (res.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (errorData.message) {
          errorMessage = `Error del servidor: ${errorData.message}`;
        } else {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
      } catch (parseError) {
        console.error('❌ Error al parsear respuesta de error:', parseError);
        if (res.status === 403) {
          errorMessage = 'No tienes permisos para acceder a las reservas. Verifica tu sesión.';
        } else if (res.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else {
          errorMessage = `Error del servidor (${res.status}): ${res.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    const responseData = await res.json();
    console.log('📋 Respuesta cruda de reservas:', responseData);

    // Verificar si la respuesta tiene el formato {success, message, data}
    if (responseData && typeof responseData === 'object' && responseData.data) {
      console.log('✅ Datos de reservas extraídos del campo data:', responseData.data);
      return responseData.data;
    }

    // Si no tiene ese formato, asumir que es un array directo
    console.log('⚠️ Respuesta de reservas en formato directo:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ Error en getReservas:', error);

    // Si es un error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }

    // Re-lanzar el error con el mensaje ya procesado
    throw error;
  }
}

export async function createReserva(data: Record<string, any>) {
  if (!isTokenValid()) return;
  try {
    console.log('🚀 api.ts: Datos recibidos del frontend:', data);
    // Compatibilidad con formato nuevo (fecha_inicio, fecha_fin, id_mesas)
      const isNuevoFormato = data.fecha_inicio && data.fecha_fin && Array.isArray(data.id_mesas) && data.id_mesas.length > 0;
    let backendData;
    if (isNuevoFormato) {
      // Validar campos requeridos
      if (!data.id_cliente || isNaN(parseInt(data.id_cliente))) {
        throw new Error('ID del cliente no válido o faltante');
      }
      if (!data.fecha_inicio || typeof data.fecha_inicio !== 'string') {
        throw new Error('Fecha de inicio no válida o faltante');
      }
      if (!data.fecha_fin || typeof data.fecha_fin !== 'string') {
        throw new Error('Fecha de fin no válida o faltante');
      }
        if (!data.id_mesas || !Array.isArray(data.id_mesas)) {
        throw new Error('Debe seleccionar al menos una mesa');
      }
      if (!data.numero_personas || isNaN(parseInt(data.numero_personas))) {
        throw new Error('Número de personas no válido o faltante');
      }
      backendData = {
        id_cliente: parseInt(data.id_cliente),
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        id_mesas: data.id_mesas.map((m: any) => parseInt(m)),
        numero_personas: parseInt(data.numero_personas),
        observaciones: data.observaciones || ''
      };
    } else {
      // Formato antiguo (fecha_reserva, hora_inicio, hora_fin, mesas)
      if (!data.id_cliente || isNaN(parseInt(data.id_cliente))) {
        throw new Error('ID del cliente no válido o faltante');
      }
      if (!data.fecha_reserva || typeof data.fecha_reserva !== 'string') {
        throw new Error('Fecha de reserva no válida o faltante');
      }
      if (!data.hora_inicio || typeof data.hora_inicio !== 'string') {
        throw new Error('Hora de inicio no válida o faltante');
      }
      if (!data.hora_fin || typeof data.hora_fin !== 'string') {
        throw new Error('Hora de fin no válida o faltante');
      }
      if (!data.mesas || !Array.isArray(data.mesas) || data.mesas.length === 0) {
        throw new Error('Debe seleccionar al menos una mesa');
      }
      if (!data.numero_personas || isNaN(parseInt(data.numero_personas))) {
        throw new Error('Número de personas no válido o faltante');
      }
      backendData = {
        id_cliente: parseInt(data.id_cliente),
        fecha_reserva: data.fecha_reserva,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        estado: data.estado || 'pendiente',
        mesas: data.mesas.map((m: any) => parseInt(m)),
        numero_personas: parseInt(data.numero_personas),
        observaciones: data.observaciones || ''
      };
    }
    console.log('📤 api.ts: Payload final enviado al backend:', JSON.stringify(backendData, null, 2));
    const res = await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
    });
    let responseText = await res.text();
    let responseJson = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch (e) {
      // No es JSON, dejar como texto
    }
    console.log('📡 api.ts: Respuesta cruda del servidor:', responseText);
    if (!res.ok) {
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      if (responseJson && typeof responseJson === 'object' && 'message' in responseJson) {
        errorMessage = (responseJson as any).message;
      } else if (typeof responseText === 'string' && responseText.length < 200) {
        errorMessage = responseText;
      }
      throw new Error(errorMessage);
    }
    return responseJson || responseText;
  } catch (error) {
    console.error('❌ Error en createReserva:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    throw error;
  }
}

export async function updateReserva(id: number | string, data: Record<string, any>) {
  if (!isTokenValid()) return;
  try {
    // Asegurar que el id sea un número válido
    const reservaId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!reservaId || isNaN(reservaId)) throw new Error('ID de reserva inválido');
    console.log('✏️ updateReserva: id usado:', reservaId, 'data:', data);
    const res = await fetch(`${API_URL}/reservas/${reservaId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        console.error('❌ Error del servidor al actualizar reserva:', errorData);
        if (res.status === 403) {
          errorMessage = 'No tienes permisos para actualizar reservas.';
        } else if (res.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (errorData.message) {
          errorMessage = `Error del servidor: ${errorData.message}`;
        } else {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
      } catch (parseError) {
        errorMessage = `Error del servidor (${res.status}): ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error) {
    console.error('❌ Error en updateReserva:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    throw error;
  }
}

export async function deleteReserva(id: number | string) {
  if (!isTokenValid()) return;
  try {
    // Asegurar que el id sea un número válido
    const reservaId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!reservaId || isNaN(reservaId)) throw new Error('ID de reserva inválido');
    console.log('🗑️ deleteReserva: id usado:', reservaId);
    const res = await fetch(`${API_URL}/reservas/${reservaId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        console.error('❌ Error del servidor al eliminar reserva:', errorData);
        if (res.status === 403) {
          errorMessage = 'No tienes permisos para eliminar reservas.';
        } else if (res.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        } else if (errorData.message) {
          errorMessage = `Error del servidor: ${errorData.message}`;
        } else {
          errorMessage = `Error ${res.status}: ${res.statusText}`;
        }
      } catch (parseError) {
        errorMessage = `Error del servidor (${res.status}): ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error) {
    console.error('❌ Error en deleteReserva:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    throw error;
  }
}

// --- CLIENTES ---
export async function getUsuariosClientes() {
  if (!isTokenValid()) return;
  try {
    console.log('👥 API: Obteniendo clientes desde:', `${API_URL}/usuarios-clientes`);
    const res = await fetch(`${API_URL}/usuarios-clientes`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 API: Respuesta de clientes:', res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error('Error al obtener usuarios-clientes');
    }
    
    const data = await res.json();
    console.log('👥 API: Datos crudos de clientes:', data);
    
    // Verificar si la respuesta tiene el formato {success, message, data}
    if (data && typeof data === 'object' && data.data) {
      console.log('✅ API: Datos de clientes extraídos del campo data:', data.data);
      return data.data;
    }
    
    // Si no tiene ese formato, asumir que es un array directo
    console.log('⚠️ API: Respuesta de clientes en formato directo:', data);
    return data;
  } catch (error) {
    console.error('❌ API: Error al obtener clientes:', error);
    throw error;
  }
}

// --- FUNCIÓN COMBINADA: SALONES CON MESAS ---
export async function getSalonesConMesas() {
  if (!isTokenValid()) return [];
  try {
    console.log('🔄 API: Obteniendo salones...');
    const salones = await getSalones();
    console.log('📋 API: Salones obtenidos:', salones);
    if (!Array.isArray(salones)) {
      console.error('❌ API: Los salones no son un array:', typeof salones, salones);
      return [];
    }
    console.log('🔄 API: Obteniendo mesas...');
    const mesas = await getMesas();
    console.log('🍽️ API: Mesas obtenidas:', mesas);
    if (!Array.isArray(mesas)) {
      console.error('❌ API: Las mesas no son un array:', typeof mesas, mesas);
      // No lanzar error aquí, mesas puede estar vacío
      console.warn('⚠️ API: Continuando sin mesas');
    }
    // Combinar salones con sus mesas
    const salonesConMesas = salones.map(salon => {
      const mesasDelSalon = Array.isArray(mesas) ? mesas.filter(mesa => mesa.id_salon === salon.id_salon) : [];
      console.log(`🏪 API: Salón "${salon.descripcion}" tiene ${mesasDelSalon.length} mesas`);
      return {
        ...salon,
        mesas: mesasDelSalon
      };
    });
    console.log('✅ API: Salones con mesas combinados:', salonesConMesas);
    return salonesConMesas;
  } catch (error) {
    console.error('❌ API: Error al obtener salones con mesas:', error);
    return [];
  }
}

// --- FUNCIÓN DE PRUEBA DE CONECTIVIDAD ---
export async function testConnection() {
  if (!isTokenValid()) return;
  try {
    console.log('🔗 Probando conexión con:', API_URL);
    
    // Probar endpoint de salones
    const salonesResponse = await fetch(`${API_URL}/ajustes/salones`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Respuesta de salones:', salonesResponse.status, salonesResponse.statusText);
    
    if (!salonesResponse.ok) {
      throw new Error(`Error ${salonesResponse.status}: ${salonesResponse.statusText}`);
    }
    
    const salonesData = await salonesResponse.json();
    console.log('📋 Datos crudos de salones:', salonesData);
    
    // Usar la función getSalones para obtener los datos procesados
    const salonesProcessed = await getSalones();
    console.log('📋 Datos procesados de salones:', salonesProcessed);
    
    // Probar endpoint de mesas
    const mesasResponse = await fetch(`${API_URL}/ajustes/mesas`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Respuesta de mesas:', mesasResponse.status, mesasResponse.statusText);
    
    if (!mesasResponse.ok) {
      throw new Error(`Error ${mesasResponse.status}: ${mesasResponse.statusText}`);
    }
    
    const mesasData = await mesasResponse.json();
    console.log('🍽️ Datos crudos de mesas:', mesasData);
    
    // Usar la función getMesas para obtener los datos procesados
    const mesasProcessed = await getMesas();
    console.log('🍽️ Datos procesados de mesas:', mesasProcessed);
    
    return { 
      salones: salonesProcessed, 
      mesas: mesasProcessed,
      raw: { salones: salonesData, mesas: mesasData }
    };
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    throw error;
  }
}

/**
 * Cambia el estado de una reserva usando el endpoint PATCH /api/reservas/{id}/cambiar-estado
 * @param id ID de la reserva
 * @param estado Nuevo estado (pendiente, confirmada, cancelada, completada, anulada)
 * @param observaciones Texto opcional
 */
export async function cambiarEstadoReserva(id: number | string, estado: string, observaciones?: string) {
  if (!isTokenValid()) return;
  try {
    const reservaId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!reservaId || isNaN(reservaId)) throw new Error('ID de reserva inválido');
    const body: any = { estado };
    if (observaciones) body.observaciones = observaciones;
    const res = await fetch(`${API_URL}/reservas/${reservaId}/cambiar-estado`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let errorMessage;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || `Error ${res.status}: ${res.statusText}`;
      } catch {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      throw new Error(errorMessage);
    }
    return res.json();
  } catch (error) {
    console.error('❌ Error en cambiarEstadoReserva:', error);
    throw error;
  }
}

// Obtener reservas del cliente autenticado (token de cliente)
export async function getMisReservas() {
  if (!isTokenValid()) throw new Error('No autenticado');
  const res = await fetch(`${API_URL}/mis-reservas`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener reservas del cliente');
  }
  const responseData = await res.json();
  // Si la respuesta tiene {data: ...}
  if (responseData && typeof responseData === 'object' && responseData.data) {
    return responseData.data;
  }
  return responseData;
}