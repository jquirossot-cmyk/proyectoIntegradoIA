/**
 * ================================================================
 * JOUSLYNIA — Sistema de Gestión de Eventos · Universidad CENFOTEC
 * /js/admin.js — Lógica del panel de administración
 * ================================================================
 *
 * IMPORTANTE: Este script debe cargarse DESPUÉS de auth.js en cada
 * página de administrador. La protección de ruta se activa de forma
 * automática al incluir este archivo.
 *
 * Módulos:
 *  1.  Claves y datos iniciales de prueba
 *  2.  Capa de persistencia (localStorage)
 *  3.  CRUD — Eventos
 *  4.  CRUD — Actividades
 *  5.  Validaciones de formularios
 *  6.  Utilidades de renderizado compartidas
 *  7.  Gestión del sidebar (colapsar / móvil)
 *  8.  Inicialización automática
 */

'use strict';

/* ================================================================
   1. CLAVES DE ALMACENAMIENTO Y DATOS INICIALES
   ================================================================ */

const CLAVE_EVENTOS     = 'jouslynia_eventos';
const CLAVE_ACTIVIDADES = 'jouslynia_actividades';

/** Categorías válidas para un evento */
const CATEGORIAS_EVENTO = [
  'congreso', 'taller', 'seminario', 'hackathon', 'conferencia', 'otro'
];

/** Emojis por categoría (usados en la UI) */
const EMOJI_CATEGORIA = {
  congreso:    '🎓',
  taller:      '🛠️',
  seminario:   '📚',
  hackathon:   '💻',
  conferencia: '🎤',
  otro:        '📅'
};

/**
 * Datos de ejemplo que se cargan la primera vez.
 * En producción vendrían de una API REST.
 */
const EVENTOS_DEMO = [
  {
    id: 1,
    nombre: 'Congreso Internacional de Inteligencia Artificial',
    descripcion: 'El evento tecnológico más importante de Centroamérica. Expertos internacionales compartirán los últimos avances en IA generativa, machine learning y sistemas autónomos.',
    categoria: 'congreso',
    fecha: '2026-07-15',
    hora: '08:00',
    lugar: 'Auditorio Principal · CENFOTEC',
    organizador: 'Facultad de Ingeniería',
    cuposTotal: 300,
    cuposOcupados: 247,
    destacado: true,
    activo: true,
    creadoEn: '2026-01-10'
  },
  {
    id: 2,
    nombre: 'Taller de Desarrollo Web con IA Generativa',
    descripcion: 'Aprenda a integrar modelos de lenguaje en sus aplicaciones web con Node.js y la API de Anthropic. Sesión práctica con ejercicios reales y código de producción.',
    categoria: 'taller',
    fecha: '2026-07-22',
    hora: '14:00',
    lugar: 'Laboratorio de Cómputo 3',
    organizador: 'Escuela de Ingeniería en Sistemas',
    cuposTotal: 30,
    cuposOcupados: 28,
    destacado: true,
    activo: true,
    creadoEn: '2026-01-15'
  },
  {
    id: 3,
    nombre: 'Seminario: Ciberseguridad Empresarial 2026',
    descripcion: 'Análisis de amenazas digitales actuales y estrategias de defensa aplicadas. Casos reales de empresas costarricenses.',
    categoria: 'seminario',
    fecha: '2026-08-05',
    hora: '09:00',
    lugar: 'Sala de Conferencias B',
    organizador: 'CENFOTEC Security Lab',
    cuposTotal: 80,
    cuposOcupados: 41,
    destacado: false,
    activo: true,
    creadoEn: '2026-01-20'
  },
  {
    id: 4,
    nombre: 'Hackathon Innovación Social 2026',
    descripcion: '48 horas de programación intensiva para crear soluciones tecnológicas a problemas sociales de Costa Rica.',
    categoria: 'hackathon',
    fecha: '2026-08-12',
    hora: '18:00',
    lugar: 'Campus CENFOTEC — Área Maker',
    organizador: 'Innovation Hub CENFOTEC',
    cuposTotal: 120,
    cuposOcupados: 88,
    destacado: true,
    activo: true,
    creadoEn: '2026-02-01'
  },
  {
    id: 5,
    nombre: 'Conferencia: El Futuro del Trabajo Remoto',
    descripcion: 'Cómo las empresas globales están rediseñando sus culturas para equipos distribuidos. Ponentes de Google, Microsoft y startups locales.',
    categoria: 'conferencia',
    fecha: '2026-08-20',
    hora: '10:00',
    lugar: 'Auditorio Principal · CENFOTEC',
    organizador: 'Facultad de Administración',
    cuposTotal: 200,
    cuposOcupados: 115,
    destacado: false,
    activo: true,
    creadoEn: '2026-02-10'
  },
  {
    id: 6,
    nombre: 'Taller Avanzado: Diseño UX con Figma',
    descripcion: 'Domine auto-layout, variables y prototipado interactivo en Figma. Construirá un sistema de diseño completo desde cero.',
    categoria: 'taller',
    fecha: '2026-09-03',
    hora: '13:00',
    lugar: 'Laboratorio de Diseño Digital',
    organizador: 'Escuela de Diseño Interactivo',
    cuposTotal: 25,
    cuposOcupados: 25,
    destacado: false,
    activo: true,
    creadoEn: '2026-02-15'
  }
];

const ACTIVIDADES_DEMO = [
  { id: 1, eventoId: 1, nombre: 'Registro y acreditación',            hora: '08:00', duracion: 60,  ponente: 'Equipo organizador', tipo: '🚪', activo: true },
  { id: 2, eventoId: 1, nombre: 'Keynote: IA en 2026',                hora: '09:00', duracion: 75,  ponente: 'Dr. Andrés Mora',    tipo: '🎤', activo: true },
  { id: 3, eventoId: 1, nombre: 'Panel: Ética e IA',                  hora: '10:30', duracion: 90,  ponente: 'Mesa redonda',       tipo: '🗣️', activo: true },
  { id: 4, eventoId: 1, nombre: 'Coffee break & Networking',           hora: '12:00', duracion: 45,  ponente: '—',                  tipo: '☕', activo: true },
  { id: 5, eventoId: 1, nombre: 'Demo en vivo: Agentes autónomos',    hora: '14:00', duracion: 60,  ponente: 'Ing. Valeria Solís', tipo: '💡', activo: true },
  { id: 6, eventoId: 2, nombre: 'Configuración del entorno',          hora: '14:00', duracion: 30,  ponente: 'Instructores',       tipo: '⚙️', activo: true },
  { id: 7, eventoId: 2, nombre: 'Integración con Claude API',         hora: '14:30', duracion: 90,  ponente: 'Ing. Roberto Chaves',tipo: '🤖', activo: true },
  { id: 8, eventoId: 4, nombre: 'Apertura oficial',                   hora: '18:00', duracion: 45,  ponente: 'Rectoría CENFOTEC', tipo: '🚀', activo: true },
  { id: 9, eventoId: 4, nombre: 'Formación de equipos',               hora: '19:00', duracion: 60,  ponente: 'Mentores',           tipo: '🤝', activo: true }
];


/* ================================================================
   2. CAPA DE PERSISTENCIA (localStorage)
   ================================================================ */

/**
 * Garantiza que los datos de demo existan en localStorage.
 * Solo se ejecuta la primera vez (si las claves no existen).
 */
function inicializarDatosAdmin() {
  if (!localStorage.getItem(CLAVE_EVENTOS)) {
    localStorage.setItem(CLAVE_EVENTOS, JSON.stringify(EVENTOS_DEMO));
  }
  if (!localStorage.getItem(CLAVE_ACTIVIDADES)) {
    localStorage.setItem(CLAVE_ACTIVIDADES, JSON.stringify(ACTIVIDADES_DEMO));
  }
}

/* ---- Eventos ---- */

/** Devuelve todos los eventos (activos e inactivos) */
function obtenerTodosEventos() {
  return JSON.parse(localStorage.getItem(CLAVE_EVENTOS) || '[]');
}

/** Devuelve solo los eventos activos */
function obtenerEventosActivos() {
  return obtenerTodosEventos().filter(e => e.activo);
}

/** Devuelve un evento por su id numérico */
function obtenerEventoPorId(id) {
  return obtenerTodosEventos().find(e => e.id === parseInt(id)) || null;
}

/** Persiste el array completo de eventos */
function guardarEventos(lista) {
  localStorage.setItem(CLAVE_EVENTOS, JSON.stringify(lista));
}

/* ---- Actividades ---- */

/** Devuelve todas las actividades (activas e inactivas) */
function obtenerTodasActividades() {
  return JSON.parse(localStorage.getItem(CLAVE_ACTIVIDADES) || '[]');
}

/** Devuelve actividades activas de un evento específico, ordenadas por hora */
function obtenerActividadesPorEvento(eventoId) {
  return obtenerTodasActividades()
    .filter(a => a.eventoId === parseInt(eventoId) && a.activo)
    .sort((a, b) => a.hora.localeCompare(b.hora));
}

/** Persiste el array completo de actividades */
function guardarActividades(lista) {
  localStorage.setItem(CLAVE_ACTIVIDADES, JSON.stringify(lista));
}

/** Genera el próximo ID para una lista (máx actual + 1) */
function generarId(lista) {
  return lista.length > 0 ? Math.max(...lista.map(i => i.id)) + 1 : 1;
}


/* ================================================================
   3. CRUD — EVENTOS
   ================================================================ */

/**
 * Crea un nuevo evento y lo persiste.
 * @param {Object} datos — campos del formulario ya validados
 * @returns {{ exito: boolean, mensaje: string, evento?: Object }}
 */
function crearEvento(datos) {
  const lista = obtenerTodosEventos();

  const nuevoEvento = {
    id:          generarId(lista),
    nombre:      datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    categoria:   datos.categoria,
    fecha:       datos.fecha,
    hora:        datos.hora,
    lugar:       datos.lugar.trim(),
    organizador: datos.organizador.trim(),
    cuposTotal:  parseInt(datos.cuposTotal, 10),
    cuposOcupados: 0,
    destacado:   datos.destacado === true || datos.destacado === 'on',
    activo:      true,
    creadoEn:    new Date().toISOString().split('T')[0]
  };

  lista.push(nuevoEvento);
  guardarEventos(lista);

  return { exito: true, mensaje: `Evento "${nuevoEvento.nombre}" creado exitosamente.`, evento: nuevoEvento };
}

/**
 * Actualiza los campos de un evento existente.
 * @param {number} id
 * @param {Object} datos — campos actualizados
 * @returns {{ exito: boolean, mensaje: string }}
 */
function editarEvento(id, datos) {
  const lista = obtenerTodosEventos();
  const idx   = lista.findIndex(e => e.id === parseInt(id));

  if (idx === -1) {
    return { exito: false, mensaje: 'Evento no encontrado.' };
  }

  /* Mantener campos que no vienen del formulario */
  lista[idx] = {
    ...lista[idx],
    nombre:      datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    categoria:   datos.categoria,
    fecha:       datos.fecha,
    hora:        datos.hora,
    lugar:       datos.lugar.trim(),
    organizador: datos.organizador.trim(),
    cuposTotal:  parseInt(datos.cuposTotal, 10),
    destacado:   datos.destacado === true || datos.destacado === 'on',
    actualizadoEn: new Date().toISOString().split('T')[0]
  };

  guardarEventos(lista);
  return { exito: true, mensaje: `Evento actualizado correctamente.` };
}

/**
 * Elimina lógicamente un evento (marca como inactivo).
 * También desactiva sus actividades asociadas.
 * @param {number} id
 * @returns {{ exito: boolean, mensaje: string }}
 */
function eliminarEvento(id) {
  const lista = obtenerTodosEventos();
  const idx   = lista.findIndex(e => e.id === parseInt(id));

  if (idx === -1) {
    return { exito: false, mensaje: 'Evento no encontrado.' };
  }

  const nombreEvento = lista[idx].nombre;
  lista[idx].activo  = false;
  guardarEventos(lista);

  /* Desactivar actividades del evento */
  const actividades = obtenerTodasActividades();
  actividades.forEach(a => {
    if (a.eventoId === parseInt(id)) a.activo = false;
  });
  guardarActividades(actividades);

  return { exito: true, mensaje: `Evento "${nombreEvento}" eliminado.` };
}

/**
 * Restaura un evento que fue eliminado lógicamente.
 * @param {number} id
 */
function restaurarEvento(id) {
  const lista = obtenerTodosEventos();
  const idx   = lista.findIndex(e => e.id === parseInt(id));
  if (idx === -1) return;
  lista[idx].activo = true;
  guardarEventos(lista);
}


/* ================================================================
   4. CRUD — ACTIVIDADES
   ================================================================ */

/**
 * Crea una nueva actividad para un evento.
 * @param {Object} datos
 * @returns {{ exito: boolean, mensaje: string, actividad?: Object }}
 */
function crearActividad(datos) {
  /* Verificar que el evento padre exista */
  const evento = obtenerEventoPorId(datos.eventoId);
  if (!evento) {
    return { exito: false, mensaje: 'El evento seleccionado no existe.' };
  }

  const lista = obtenerTodasActividades();

  const nueva = {
    id:       generarId(lista),
    eventoId: parseInt(datos.eventoId, 10),
    nombre:   datos.nombre.trim(),
    hora:     datos.hora,
    duracion: parseInt(datos.duracion, 10) || 60,
    ponente:  (datos.ponente || '').trim() || '—',
    tipo:     datos.tipo || '📋',
    activo:   true,
    creadoEn: new Date().toISOString().split('T')[0]
  };

  lista.push(nueva);
  guardarActividades(lista);

  return { exito: true, mensaje: `Actividad "${nueva.nombre}" añadida.`, actividad: nueva };
}

/**
 * Actualiza una actividad existente.
 * @param {number} id
 * @param {Object} datos
 * @returns {{ exito: boolean, mensaje: string }}
 */
function editarActividad(id, datos) {
  const lista = obtenerTodasActividades();
  const idx   = lista.findIndex(a => a.id === parseInt(id));

  if (idx === -1) {
    return { exito: false, mensaje: 'Actividad no encontrada.' };
  }

  lista[idx] = {
    ...lista[idx],
    nombre:   datos.nombre.trim(),
    hora:     datos.hora,
    duracion: parseInt(datos.duracion, 10) || 60,
    ponente:  (datos.ponente || '').trim() || '—',
    tipo:     datos.tipo || lista[idx].tipo,
    actualizadoEn: new Date().toISOString().split('T')[0]
  };

  guardarActividades(lista);
  return { exito: true, mensaje: 'Actividad actualizada.' };
}

/**
 * Elimina lógicamente una actividad.
 * @param {number} id
 * @returns {{ exito: boolean, mensaje: string }}
 */
function eliminarActividad(id) {
  const lista = obtenerTodasActividades();
  const idx   = lista.findIndex(a => a.id === parseInt(id));

  if (idx === -1) {
    return { exito: false, mensaje: 'Actividad no encontrada.' };
  }

  const nombre = lista[idx].nombre;
  lista[idx].activo = false;
  guardarActividades(lista);

  return { exito: true, mensaje: `Actividad "${nombre}" eliminada.` };
}


/* ================================================================
   5. VALIDACIONES DE FORMULARIOS
   ================================================================ */

/**
 * Valida el formulario de evento.
 * Retorna null si es válido, o un objeto { campo: mensaje } si hay errores.
 * @param {Object} datos
 * @returns {Object|null}
 */
function validarDatosEvento(datos) {
  const errores = {};

  if (!datos.nombre || datos.nombre.trim().length < 4) {
    errores.nombre = 'El nombre debe tener al menos 4 caracteres.';
  }

  if (!datos.descripcion || datos.descripcion.trim().length < 10) {
    errores.descripcion = 'La descripción debe tener al menos 10 caracteres.';
  }

  if (!datos.categoria || !CATEGORIAS_EVENTO.includes(datos.categoria)) {
    errores.categoria = 'Selecciona una categoría válida.';
  }

  if (!datos.fecha) {
    errores.fecha = 'La fecha es obligatoria.';
  } else {
    const hoy = new Date().toISOString().split('T')[0];
    if (datos.fecha < hoy) {
      errores.fecha = 'La fecha no puede ser anterior a hoy.';
    }
  }

  if (!datos.hora) {
    errores.hora = 'La hora es obligatoria.';
  }

  if (!datos.lugar || datos.lugar.trim().length < 3) {
    errores.lugar = 'El lugar debe tener al menos 3 caracteres.';
  }

  if (!datos.organizador || datos.organizador.trim().length < 3) {
    errores.organizador = 'El organizador debe tener al menos 3 caracteres.';
  }

  const cupos = parseInt(datos.cuposTotal, 10);
  if (isNaN(cupos) || cupos < 1 || cupos > 5000) {
    errores.cuposTotal = 'Los cupos deben ser un número entre 1 y 5000.';
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

/**
 * Valida el formulario de actividad.
 * @param {Object} datos
 * @returns {Object|null}
 */
function validarDatosActividad(datos) {
  const errores = {};

  if (!datos.eventoId) {
    errores.eventoId = 'Selecciona un evento.';
  }

  if (!datos.nombre || datos.nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!datos.hora) {
    errores.hora = 'La hora es obligatoria.';
  }

  const dur = parseInt(datos.duracion, 10);
  if (isNaN(dur) || dur < 5 || dur > 480) {
    errores.duracion = 'La duración debe estar entre 5 y 480 minutos.';
  }

  return Object.keys(errores).length > 0 ? errores : null;
}

/**
 * Muestra los errores de validación en el formulario indicado.
 * @param {HTMLFormElement} form
 * @param {Object} errores — { nombreCampo: 'mensaje de error' }
 */
function mostrarErroresEnFormulario(form, errores) {
  /* Limpiar errores previos */
  if (typeof limpiarErroresFormulario === 'function') {
    limpiarErroresFormulario(form);
  }

  Object.entries(errores).forEach(([campo, mensaje]) => {
    const input = form.querySelector(`[name="${campo}"], #${campo}`);
    if (input && typeof mostrarErrorCampo === 'function') {
      mostrarErrorCampo(input, mensaje);
    }
  });

  /* Hacer foco en el primer campo con error */
  const primerCampoConError = Object.keys(errores)[0];
  const primerInput = form.querySelector(`[name="${primerCampoConError}"], #${primerCampoConError}`);
  if (primerInput) primerInput.focus();
}


/* ================================================================
   6. UTILIDADES DE RENDERIZADO COMPARTIDAS
   ================================================================ */

/**
 * Formatea una fecha ISO a texto legible en español.
 * Ej: "2026-07-15" → "15 jul. 2026"
 */
function formatearFechaAdmin(fechaISO) {
  if (!fechaISO) return '—';
  const f = new Date(fechaISO + 'T00:00:00');
  return f.toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Escapa texto para inserción segura en innerHTML.
 * (Reexporta la función de auth.js por si se usa en contextos donde
 * auth.js no cargó primero; si ya existe, la reutiliza.)
 */
function sanitizar(texto) {
  if (typeof escaparTexto === 'function') return escaparTexto(texto);
  const d = document.createElement('div');
  d.textContent = String(texto || '');
  return d.innerHTML;
}

/**
 * Calcula el porcentaje de ocupación de un evento.
 * @returns {number} 0-100
 */
function calcularPctOcupacion(evento) {
  if (!evento.cuposTotal) return 0;
  return Math.min(100, Math.round(((evento.cuposOcupados || 0) / evento.cuposTotal) * 100));
}

/**
 * Genera el HTML del badge de estado de cupos.
 */
function badgeCupos(evento) {
  const libres = evento.cuposTotal - (evento.cuposOcupados || 0);
  const pct    = calcularPctOcupacion(evento);
  const clase  = libres <= 0 ? 'estado--agotado'
    : pct >= 80  ? 'estado--pendiente'
    : 'estado--activo';
  const texto  = libres <= 0 ? 'Agotado'
    : pct >= 80  ? `⚠ ${libres} libres`
    : `${libres} libres`;
  return `<span class="estado ${clase}">${texto}</span>`;
}

/**
 * Genera la barra de progreso de cupos para una celda de tabla.
 */
function barraOcupacion(evento) {
  const pct   = calcularPctOcupacion(evento);
  const color = pct >= 90 ? 'var(--color-error)'
    : pct >= 60 ? 'var(--color-amarilloOscuro)'
    : 'var(--color-exito)';
  return `
    <div class="barra-cupos-admin">
      <div class="barra-cupos-admin__pista">
        <div class="barra-cupos-admin__relleno"
             style="width:${pct}%;background:${color};"
             role="progressbar" aria-valuenow="${pct}"
             aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <div class="barra-cupos-admin__texto">${evento.cuposOcupados || 0}/${evento.cuposTotal} (${pct}%)</div>
    </div>
  `;
}

/**
 * Puebla un <select> con los eventos activos.
 * @param {HTMLSelectElement} selectEl
 * @param {number|null} valorSeleccionado — ID preseleccionado
 */
function poblarSelectEventos(selectEl, valorSeleccionado = null) {
  if (!selectEl) return;
  const eventos = obtenerEventosActivos();

  selectEl.innerHTML = `<option value="">— Selecciona un evento —</option>` +
    eventos.map(e =>
      `<option value="${e.id}" ${e.id === parseInt(valorSeleccionado) ? 'selected' : ''}>
         ${sanitizar(e.nombre)} · ${formatearFechaAdmin(e.fecha)}
       </option>`
    ).join('');
}


/* ================================================================
   7. GESTIÓN DEL SIDEBAR (colapsar / móvil)
   Estas funciones son idénticas al panel-admin.html para
   mantener coherencia. Se exponen globalmente.
   ================================================================ */

function toggleSidebar() {
  const cuerpo = document.getElementById('cuerpo-admin');
  if (!cuerpo) return;
  const esColapsado = cuerpo.classList.toggle('sidebar-colapsado');
  const btn = document.getElementById('btn-colapsar-sidebar');
  if (btn) {
    btn.textContent = esColapsado ? '▸' : '◂';
    btn.setAttribute('aria-label', esColapsado ? 'Expandir menú' : 'Colapsar menú');
  }
  localStorage.setItem('jouslynia_sidebar_col', esColapsado ? '1' : '0');
}

function abrirSidebarMovil() {
  document.getElementById('sidebar')?.classList.add('sidebar--abierto');
  document.getElementById('sidebar-overlay')?.classList.add('sidebar-overlay--visible');
  document.getElementById('btn-menu-movil')?.setAttribute('aria-expanded', 'true');
}

function cerrarSidebarMovil() {
  document.getElementById('sidebar')?.classList.remove('sidebar--abierto');
  document.getElementById('sidebar-overlay')?.classList.remove('sidebar-overlay--visible');
  document.getElementById('btn-menu-movil')?.setAttribute('aria-expanded', 'false');
}

/** Restaura el estado del sidebar desde localStorage */
function restaurarEstadoSidebar() {
  if (localStorage.getItem('jouslynia_sidebar_col') === '1') {
    document.getElementById('cuerpo-admin')?.classList.add('sidebar-colapsado');
    const btn = document.getElementById('btn-colapsar-sidebar');
    if (btn) { btn.textContent = '▸'; btn.setAttribute('aria-label', 'Expandir menú'); }
  }
}

/** Rellena el nombre del admin en el sidebar y topbar */
function configurarInfoAdmin() {
  const sesion = (typeof obtenerSesionActiva === 'function') ? obtenerSesionActiva() : null;
  if (!sesion) return;

  const nombre    = sesion.nombre + ' ' + sesion.apellido;
  const iniciales = sesion.nombre.charAt(0).toUpperCase() + sesion.apellido.charAt(0).toUpperCase();

  const elSidebarNombre = document.getElementById('sidebar-nombre');
  const elSidebarAvatar = document.getElementById('sidebar-avatar');
  const elTopbarNombre  = document.getElementById('topbar-nombre');
  const elTopbarAvatar  = document.getElementById('topbar-avatar');

  if (elSidebarNombre) elSidebarNombre.textContent = nombre;
  if (elSidebarAvatar) elSidebarAvatar.textContent = iniciales;
  if (elTopbarNombre)  elTopbarNombre.textContent  = sesion.nombre;
  if (elTopbarAvatar)  elTopbarAvatar.textContent  = iniciales;
}


/* ================================================================
   8. INICIALIZACIÓN AUTOMÁTICA
   ================================================================ */

/* Proteger todas las páginas que carguen este script */
if (typeof protegerRutaAdmin === 'function') {
  protegerRutaAdmin();
}

/* Garantizar datos de demo */
inicializarDatosAdmin();

/* Ejecutar cuando el DOM esté listo */
document.addEventListener('DOMContentLoaded', () => {
  restaurarEstadoSidebar();
  configurarInfoAdmin();
});

if (document.readyState !== 'loading') {
  restaurarEstadoSidebar();
  configurarInfoAdmin();
}

/* ---- Exponer todo globalmente ---- */
window.crearEvento            = crearEvento;
window.editarEvento           = editarEvento;
window.eliminarEvento         = eliminarEvento;
window.restaurarEvento        = restaurarEvento;
window.obtenerEventosActivos  = obtenerEventosActivos;
window.obtenerTodosEventos    = obtenerTodosEventos;
window.obtenerEventoPorId     = obtenerEventoPorId;
window.crearActividad         = crearActividad;
window.editarActividad        = editarActividad;
window.eliminarActividad      = eliminarActividad;
window.obtenerActividadesPorEvento = obtenerActividadesPorEvento;
window.validarDatosEvento     = validarDatosEvento;
window.validarDatosActividad  = validarDatosActividad;
window.mostrarErroresEnFormulario = mostrarErroresEnFormulario;
window.formatearFechaAdmin    = formatearFechaAdmin;
window.sanitizar              = sanitizar;
window.poblarSelectEventos    = poblarSelectEventos;
window.badgeCupos             = badgeCupos;
window.barraOcupacion         = barraOcupacion;
window.calcularPctOcupacion   = calcularPctOcupacion;
window.EMOJI_CATEGORIA        = EMOJI_CATEGORIA;
window.obtenerTodasActividades  = obtenerTodasActividades;
window.toggleSidebar            = toggleSidebar;
window.abrirSidebarMovil        = abrirSidebarMovil;
window.cerrarSidebarMovil       = cerrarSidebarMovil;
window.restaurarEstadoSidebar   = restaurarEstadoSidebar;
