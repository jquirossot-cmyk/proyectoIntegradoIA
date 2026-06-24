/**
 * JOUSLYNIA — Sistema de Gestión de Eventos · Universidad CENFOTEC
 * app.js — Lógica de la landing page pública y utilidades compartidas
 *
 * Módulos:
 *  1. Datos de demostración (eventos y actividades)
 *  2. Utilidades generales (fechas, DOM, toast)
 *  3. Header y navegación móvil
 *  4. Sección de eventos (renderizado, filtros, búsqueda)
 *  5. Sección de agenda (timeline + calendario mini)
 *  6. Animaciones de entrada (IntersectionObserver)
 *  7. Inicialización
 */

'use strict';

/* ================================================================
   1. DATOS DE DEMOSTRACIÓN
   ================================================================ */

/**
 * Carga los datos iniciales en localStorage si no existen.
 * En producción, estos vendrían de una API.
 */
function inicializarDatosDemo() {
  if (!localStorage.getItem('jouslynia_eventos')) {
    const eventosDemo = [
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
        activo: true
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
        activo: true
      },
      {
        id: 3,
        nombre: 'Seminario: Ciberseguridad Empresarial 2026',
        descripcion: 'Análisis de las principales amenazas digitales actuales y estrategias de defensa aplicadas. Casos reales de empresas costarricenses y herramientas open source.',
        categoria: 'seminario',
        fecha: '2026-08-05',
        hora: '09:00',
        lugar: 'Sala de Conferencias B',
        organizador: 'CENFOTEC Security Lab',
        cuposTotal: 80,
        cuposOcupados: 41,
        destacado: false,
        activo: true
      },
      {
        id: 4,
        nombre: 'Hackathon Innovación Social 2026',
        descripcion: '48 horas de programación intensiva para crear soluciones tecnológicas a problemas sociales de Costa Rica. Equipos de hasta 5 personas. Premios en efectivo y mentoría.',
        categoria: 'hackathon',
        fecha: '2026-08-12',
        hora: '18:00',
        lugar: 'Campus CENFOTEC — Área Maker',
        organizador: 'Innovation Hub CENFOTEC',
        cuposTotal: 120,
        cuposOcupados: 88,
        destacado: true,
        activo: true
      },
      {
        id: 5,
        nombre: 'Conferencia: El Futuro del Trabajo Remoto',
        descripcion: 'Cómo las empresas globales están rediseñando sus culturas para equipos distribuidos. Ponentes de Google, Microsoft y startups costarricenses compartirán su experiencia.',
        categoria: 'conferencia',
        fecha: '2026-08-20',
        hora: '10:00',
        lugar: 'Auditorio Principal · CENFOTEC',
        organizador: 'Facultad de Administración',
        cuposTotal: 200,
        cuposOcupados: 115,
        destacado: false,
        activo: true
      },
      {
        id: 6,
        nombre: 'Taller Avanzado: Diseño UX con Figma',
        descripcion: 'Domine auto-layout, variables y prototipado interactivo en Figma. Construirá un sistema de diseño completo partiendo de cero durante la sesión.',
        categoria: 'taller',
        fecha: '2026-09-03',
        hora: '13:00',
        lugar: 'Laboratorio de Diseño Digital',
        organizador: 'Escuela de Diseño Interactivo',
        cuposTotal: 25,
        cuposOcupados: 25,
        destacado: false,
        activo: true
      }
    ];
    localStorage.setItem('jouslynia_eventos', JSON.stringify(eventosDemo));
  }

  if (!localStorage.getItem('jouslynia_actividades')) {
    const actividadesDemo = [
      {
        id: 1,
        eventoId: 1,
        nombre: 'Registro y acreditación',
        descripcion: 'Recepción de participantes y entrega de materiales',
        hora: '08:00',
        duracion: 60,
        ponente: 'Equipo organizador',
        tipo: '🚪',
        activo: true
      },
      {
        id: 2,
        eventoId: 1,
        nombre: 'Keynote: IA en 2026 — Estado del arte',
        descripcion: 'Conferencia magistral de apertura con perspectivas globales',
        hora: '09:00',
        duracion: 75,
        ponente: 'Dr. Andrés Mora Cascante',
        tipo: '🎤',
        activo: true
      },
      {
        id: 3,
        eventoId: 1,
        nombre: 'Panel: Ética e IA — Retos para Latinoamérica',
        descripcion: 'Mesa redonda con expertos regionales',
        hora: '10:30',
        duracion: 90,
        ponente: 'Panel de expertos',
        tipo: '🗣️',
        activo: true
      },
      {
        id: 4,
        eventoId: 1,
        nombre: 'Coffee break & Networking',
        descripcion: 'Pausa y espacio de conexión entre participantes',
        hora: '12:00',
        duracion: 45,
        ponente: '—',
        tipo: '☕',
        activo: true
      },
      {
        id: 5,
        eventoId: 1,
        nombre: 'Demo en vivo: Agentes autónomos',
        descripcion: 'Demostración práctica de sistemas multiagente',
        hora: '14:00',
        duracion: 60,
        ponente: 'Ing. Valeria Solís Quesada',
        tipo: '💡',
        activo: true
      },
      {
        id: 6,
        eventoId: 2,
        nombre: 'Configuración del entorno',
        descripcion: 'Setup de Node.js, dependencias y acceso a la API',
        hora: '14:00',
        duracion: 30,
        ponente: 'Instructores',
        tipo: '⚙️',
        activo: true
      },
      {
        id: 7,
        eventoId: 2,
        nombre: 'Integración con Claude API',
        descripcion: 'Primeras llamadas a la API y manejo de respuestas',
        hora: '14:30',
        duracion: 90,
        ponente: 'Ing. Roberto Chaves',
        tipo: '🤖',
        activo: true
      },
      {
        id: 8,
        eventoId: 2,
        nombre: 'Ejercicio: Chatbot con memoria',
        descripcion: 'Construcción guiada de un chatbot con contexto persistente',
        hora: '16:00',
        duracion: 60,
        ponente: 'Instructores',
        tipo: '🔨',
        activo: true
      },
      {
        id: 9,
        eventoId: 4,
        nombre: 'Apertura oficial y presentación de retos',
        descripcion: 'Inauguración del Hackathon y presentación de los 5 retos sociales',
        hora: '18:00',
        duracion: 45,
        ponente: 'Rectoría CENFOTEC',
        tipo: '🚀',
        activo: true
      },
      {
        id: 10,
        eventoId: 4,
        nombre: 'Formación de equipos',
        descripcion: 'Integración de equipos y primer sprint de planificación',
        hora: '19:00',
        duracion: 60,
        ponente: 'Mentores',
        tipo: '🤝',
        activo: true
      }
    ];
    localStorage.setItem('jouslynia_actividades', JSON.stringify(actividadesDemo));
  }

  if (!localStorage.getItem('jouslynia_usuarios')) {
    const usuariosDemo = [
      {
        id: 1,
        nombre: 'Administrador',
        apellido: 'CENFOTEC',
        correo: 'admin@cenfotec.ac.cr',
        contrasena: 'Admin2024!',
        rol: 'admin',
        activo: true,
        fechaRegistro: '2024-01-01'
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González Solís',
        correo: 'maria.gonzalez@cenfotec.ac.cr',
        contrasena: 'Maria2024!',
        rol: 'usuario',
        activo: true,
        fechaRegistro: '2024-03-15'
      }
    ];
    localStorage.setItem('jouslynia_usuarios', JSON.stringify(usuariosDemo));
  }
}

/** Obtiene todos los eventos activos */
function obtenerEventos() {
  const datos = localStorage.getItem('jouslynia_eventos');
  const todos = datos ? JSON.parse(datos) : [];
  return todos.filter(e => e.activo);
}

/** Obtiene todas las actividades activas */
function obtenerActividades() {
  const datos = localStorage.getItem('jouslynia_actividades');
  const todas = datos ? JSON.parse(datos) : [];
  return todas.filter(a => a.activo);
}

/** Obtiene actividades de un evento específico */
function obtenerActividadesPorEvento(eventoId) {
  return obtenerActividades()
    .filter(a => a.eventoId === parseInt(eventoId))
    .sort((a, b) => a.hora.localeCompare(b.hora));
}

/** Calcula estadísticas resumidas para el hero */
function calcularEstadisticas() {
  const eventos = obtenerEventos();
  const actividades = obtenerActividades();
  const totalCupos = eventos.reduce((s, e) => s + (e.cuposTotal - e.cuposOcupados), 0);
  return {
    eventos: eventos.length,
    actividades: actividades.length,
    cuposDisponibles: totalCupos
  };
}


/* ================================================================
   2. UTILIDADES GENERALES
   ================================================================ */

/**
 * Formatea una fecha ISO a texto legible en español.
 * Ej: "2026-07-15" → "15 jul 2026"
 */
function formatearFecha(fechaISO, opciones = {}) {
  const opcionesDefecto = { day: 'numeric', month: 'short', year: 'numeric' };
  const config = Object.assign(opcionesDefecto, opciones);
  const fecha = new Date(fechaISO + 'T00:00:00');
  return fecha.toLocaleDateString('es-CR', config);
}

/**
 * Devuelve el día y mes de una fecha ISO por separado.
 * Ej: { dia: "15", mes: "JUL" }
 */
function descomponerFecha(fechaISO) {
  const fecha = new Date(fechaISO + 'T00:00:00');
  const dia = fecha.getDate().toString();
  const mes = fecha.toLocaleDateString('es-CR', { month: 'short' }).toUpperCase().replace('.', '');
  return { dia, mes };
}

/**
 * Calcula el porcentaje de ocupación de un evento.
 * @returns {number} 0–100
 */
function calcularOcupacion(evento) {
  if (!evento.cuposTotal) return 0;
  return Math.round((evento.cuposOcupados / evento.cuposTotal) * 100);
}

/**
 * Escapa caracteres HTML para evitar XSS.
 */
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

/**
 * Normaliza texto para búsqueda (minúsculas, sin tildes).
 */
function normalizarTexto(texto) {
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Muestra una notificación toast.
 * @param {string} mensaje
 * @param {'info'|'exito'|'error'|'aviso'} tipo
 * @param {number} duracionMs
 */
function mostrarToast(mensaje, tipo = 'info', duracionMs = 4000) {
  const iconos = { info: 'ℹ️', exito: '✅', error: '❌', aviso: '⚠️' };
  const contenedor = document.getElementById('toast-contenedor');
  if (!contenedor) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.innerHTML = `
    <span class="toast__icono" aria-hidden="true">${iconos[tipo] || 'ℹ️'}</span>
    <span class="toast__mensaje">${escaparHTML(mensaje)}</span>
    <button class="toast__cerrar" aria-label="Cerrar notificación">✕</button>
  `;

  const cerrarToast = () => {
    toast.style.animation = 'entrar-toast 0.25s ease reverse';
    setTimeout(() => toast.remove(), 240);
  };

  toast.querySelector('.toast__cerrar').addEventListener('click', cerrarToast);
  contenedor.appendChild(toast);
  setTimeout(cerrarToast, duracionMs);
}

/**
 * Selecciona un elemento del DOM de forma segura.
 */
function sel(selector, contexto = document) {
  return contexto.querySelector(selector);
}

/**
 * Selecciona múltiples elementos del DOM.
 */
function selTodos(selector, contexto = document) {
  return Array.from(contexto.querySelectorAll(selector));
}


/* ================================================================
   3. HEADER Y NAVEGACIÓN MÓVIL
   ================================================================ */

function inicializarHeader() {
  const btnHamburguesa = sel('#btn-hamburguesa');
  const navMovil       = sel('#nav-movil');
  const header         = sel('#encabezado');

  if (!btnHamburguesa || !navMovil) return;

  /* Toggle del menú móvil */
  btnHamburguesa.addEventListener('click', () => {
    const estaAbierto = navMovil.classList.toggle('nav-movil--visible');
    btnHamburguesa.setAttribute('aria-expanded', estaAbierto ? 'true' : 'false');
    btnHamburguesa.setAttribute('aria-label', estaAbierto ? 'Cerrar menú' : 'Abrir menú');
  });

  /* Cerrar al hacer clic en un enlace del menú móvil */
  selTodos('.nav-movil__enlace', navMovil).forEach(enlace => {
    enlace.addEventListener('click', () => {
      navMovil.classList.remove('nav-movil--visible');
      btnHamburguesa.setAttribute('aria-expanded', 'false');
    });
  });

  /* Cerrar al hacer clic fuera */
  document.addEventListener('click', (evento) => {
    if (navMovil.classList.contains('nav-movil--visible') &&
        !navMovil.contains(evento.target) &&
        !btnHamburguesa.contains(evento.target)) {
      navMovil.classList.remove('nav-movil--visible');
      btnHamburguesa.setAttribute('aria-expanded', 'false');
    }
  });

  /* Sombra del header al hacer scroll */
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10
        ? '0 2px 12px rgba(22,74,152,0.12)'
        : '';
    }, { passive: true });
  }

  /* Marcar enlace activo según sección visible */
  const secciones = selTodos('section[id]');
  const enlacesNav = selTodos('.nav-principal__enlace[href^="#"]');

  if (secciones.length && enlacesNav.length) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          const id = entrada.target.id;
          enlacesNav.forEach(enlace => {
            const esteId = enlace.getAttribute('href').slice(1);
            enlace.setAttribute('aria-current', esteId === id ? 'page' : '');
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    secciones.forEach(s => observador.observe(s));
  }
}

/** Actualiza las acciones del header según el estado de sesión */
function actualizarAccionesHeader() {
  const sesion = obtenerSesionActiva();
  const contenedor = sel('#acciones-header');
  if (!contenedor) return;

  if (sesion) {
    contenedor.innerHTML = `
      <span style="font-size:0.8rem;font-weight:600;color:var(--texto-secundario);">
        👋 ${escaparHTML(sesion.nombre)}
      </span>
      ${sesion.rol === 'admin'
        ? `<a href="html/panel-admin.html" class="btn btn-primario btn-sm">Panel admin</a>`
        : ''}
      <button onclick="cerrarSesion()" class="btn btn-secundario btn-sm">Salir</button>
    `;
  } else {
    contenedor.innerHTML = `
      <a href="html/login.html" class="btn btn-secundario btn-sm">Ingresar</a>
      <a href="html/registro.html" class="btn btn-primario btn-sm">Registrarse</a>
    `;
  }

  /* Mismo contenido en menú móvil */
  const accionesMovil = sel('#acciones-movil');
  if (accionesMovil) accionesMovil.innerHTML = contenedor.innerHTML;
}


/* ================================================================
   4. SECCIÓN EVENTOS
   ================================================================ */

let eventosFiltrados   = [];
let terminoBusqueda    = '';
let categoriaActiva    = 'todos';

/**
 * Genera el HTML de una tarjeta de evento.
 */
function generarTarjetaEvento(evento) {
  const { dia, mes } = descomponerFecha(evento.fecha);
  const cuposLibres   = evento.cuposTotal - evento.cuposOcupados;
  const pctOcupacion  = calcularOcupacion(evento);
  const agotado       = cuposLibres <= 0;
  const casiLleno     = cuposLibres <= 5 && !agotado;

  /* Clase del banner según categoría */
  const claseBanner = `banner-${evento.categoria}`;

  /* Clase y color de la barra de cupos */
  let claseBarra = '';
  if (agotado)     claseBarra = 'barra-cupos__relleno--lleno';
  else if (pctOcupacion >= 80) claseBarra = 'barra-cupos__relleno--casi';

  return `
    <article class="tarjeta-evento" data-id="${evento.id}" data-categoria="${evento.categoria}">
      <div class="tarjeta-evento__banner ${claseBanner}">
        <div class="tarjeta-evento__banner-placeholder" aria-hidden="true">
          ${obtenerEmojiCategoria(evento.categoria)}
        </div>
        <span class="tarjeta-evento__chip-cat">${escaparHTML(evento.categoria)}</span>
        ${evento.destacado ? `<div class="tarjeta-evento__destacado" title="Evento destacado" aria-label="Destacado">⭐</div>` : ''}
      </div>

      <div class="tarjeta-evento__cuerpo">
        <h3 class="tarjeta-evento__nombre">${escaparHTML(evento.nombre)}</h3>
        <p class="tarjeta-evento__descripcion">${escaparHTML(evento.descripcion)}</p>

        <div class="tarjeta-evento__meta">
          <div class="tarjeta-evento__meta-item">
            <span class="tarjeta-evento__meta-icono" aria-hidden="true">📅</span>
            <span>${formatearFecha(evento.fecha)} · ${escaparHTML(evento.hora)} hrs</span>
          </div>
          <div class="tarjeta-evento__meta-item">
            <span class="tarjeta-evento__meta-icono" aria-hidden="true">📍</span>
            <span>${escaparHTML(evento.lugar)}</span>
          </div>
          <div class="tarjeta-evento__meta-item">
            <span class="tarjeta-evento__meta-icono" aria-hidden="true">👤</span>
            <span>${escaparHTML(evento.organizador)}</span>
          </div>
        </div>
      </div>

      <div class="tarjeta-evento__pie">
        <div class="tarjeta-evento__cupos">
          <span class="tarjeta-evento__cupos-texto${agotado ? ' tarjeta-evento__cupos-texto--agotado' : ''}">
            ${agotado
              ? '<strong>Sin cupos</strong>'
              : casiLleno
                ? `<strong>${cuposLibres}</strong> cupo${cuposLibres === 1 ? '' : 's'} ⚠️`
                : `<strong>${cuposLibres}</strong> cupos`
            }
          </span>
          <div class="barra-cupos" role="progressbar"
               aria-valuenow="${pctOcupacion}"
               aria-valuemin="0" aria-valuemax="100"
               aria-label="${pctOcupacion}% ocupado">
            <div class="barra-cupos__relleno ${claseBarra}" style="width:${pctOcupacion}%"></div>
          </div>
        </div>

        <button
          class="btn btn-primario btn-sm"
          onclick="abrirDetalleEvento(${evento.id})"
          ${agotado ? 'disabled' : ''}
          aria-label="${agotado ? 'Sin cupos disponibles' : `Ver detalle de ${escaparHTML(evento.nombre)}`}"
        >
          ${agotado ? 'Agotado' : 'Ver más →'}
        </button>
      </div>
    </article>
  `;
}

/** Devuelve un emoji representativo según categoría */
function obtenerEmojiCategoria(categoria) {
  const emojis = {
    congreso:    '🎓',
    taller:      '🛠️',
    seminario:   '📚',
    hackathon:   '💻',
    conferencia: '🎤',
    otro:        '📅'
  };
  return emojis[categoria] || emojis.otro;
}

/**
 * Renderiza el grid de eventos con los datos filtrados.
 */
function renderizarEventos() {
  const grid = sel('#grid-eventos');
  if (!grid) return;

  /* Aplicar filtros */
  let eventos = obtenerEventos();

  if (categoriaActiva !== 'todos') {
    eventos = eventos.filter(e => e.categoria === categoriaActiva);
  }

  if (terminoBusqueda.length >= 2) {
    const termino = normalizarTexto(terminoBusqueda);
    eventos = eventos.filter(e =>
      normalizarTexto(e.nombre).includes(termino) ||
      normalizarTexto(e.descripcion).includes(termino) ||
      normalizarTexto(e.lugar).includes(termino) ||
      normalizarTexto(e.organizador).includes(termino)
    );
  }

  eventosFiltrados = eventos;

  if (eventos.length === 0) {
    grid.innerHTML = `
      <div class="estado-vacio" role="status" aria-live="polite">
        <span class="estado-vacio__icono" aria-hidden="true">🔍</span>
        <h3 class="estado-vacio__titulo">Sin resultados</h3>
        <p>Prueba con otro término o categoría.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = eventos.map(e => generarTarjetaEvento(e)).join('');

  /* Animación de entrada con stagger */
  const tarjetas = selTodos('.tarjeta-evento', grid);
  tarjetas.forEach((tarjeta, i) => {
    tarjeta.style.opacity = '0';
    tarjeta.style.transform = 'translateY(16px)';
    setTimeout(() => {
      tarjeta.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      tarjeta.style.opacity = '1';
      tarjeta.style.transform = 'translateY(0)';
    }, i * 60);
  });
}

/** Inicializa los controles de filtro y búsqueda */
function inicializarControlesEventos() {
  /* Botones de filtro */
  selTodos('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      selTodos('.filtro').forEach(b => b.classList.remove('filtro--activo'));
      btn.classList.add('filtro--activo');
      categoriaActiva = btn.dataset.filtro || 'todos';
      renderizarEventos();
    });
  });

  /* Buscador con debounce */
  const inputBusqueda = sel('#buscador-eventos');
  if (inputBusqueda) {
    let temporizador;
    inputBusqueda.addEventListener('input', (e) => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        terminoBusqueda = e.target.value.trim();
        renderizarEventos();
      }, 280);
    });

    inputBusqueda.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        inputBusqueda.value = '';
        terminoBusqueda = '';
        renderizarEventos();
      }
    });
  }
}

/**
 * Abre un modal/panel de detalle de un evento.
 * (Versión pública: muestra toast; en versión completa abriría un modal)
 */
function abrirDetalleEvento(eventoId) {
  const evento = obtenerEventos().find(e => e.id === eventoId);
  if (!evento) return;
  mostrarToast(
    `Para inscribirse en "${evento.nombre}", inicie sesión o cree una cuenta.`,
    'info',
    5000
  );
}


/* ================================================================
   5. SECCIÓN AGENDA
   ================================================================ */

let eventoSeleccionadoAgenda = null;
let mesCalendario  = null;
let anioCalendario = null;

/** Inicializa el selector de eventos para la agenda */
function inicializarAgenda() {
  const selector = sel('#selector-evento-agenda');
  if (!selector) return;

  const eventos = obtenerEventos();

  /* Poblar el selector */
  selector.innerHTML = `<option value="">— Seleccione un evento —</option>` +
    eventos.map(e =>
      `<option value="${e.id}">${escaparHTML(e.nombre)} · ${formatearFecha(e.fecha)}</option>`
    ).join('');

  /* Seleccionar primer evento automáticamente */
  if (eventos.length > 0) {
    selector.value = eventos[0].id;
    eventoSeleccionadoAgenda = eventos[0].id;
    renderizarTimeline(eventos[0].id);
  }

  selector.addEventListener('change', (e) => {
    eventoSeleccionadoAgenda = e.target.value ? parseInt(e.target.value) : null;
    renderizarTimeline(eventoSeleccionadoAgenda);
  });

  /* Iniciar calendario */
  const hoy = new Date();
  mesCalendario  = hoy.getMonth();
  anioCalendario = hoy.getFullYear();
  renderizarCalendario();

  /* Navegación del calendario */
  const btnAnterior  = sel('#cal-anterior');
  const btnSiguiente = sel('#cal-siguiente');

  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      mesCalendario--;
      if (mesCalendario < 0) { mesCalendario = 11; anioCalendario--; }
      renderizarCalendario();
    });
  }

  if (btnSiguiente) {
    btnSiguiente.addEventListener('click', () => {
      mesCalendario++;
      if (mesCalendario > 11) { mesCalendario = 0; anioCalendario++; }
      renderizarCalendario();
    });
  }
}

/**
 * Renderiza la timeline de actividades de un evento.
 */
function renderizarTimeline(eventoId) {
  const contenedor = sel('#timeline-actividades');
  if (!contenedor) return;

  if (!eventoId) {
    contenedor.innerHTML = `
      <div class="timeline__vacio" role="status">
        <span aria-hidden="true">📋</span>
        <p>Seleccione un evento para ver su agenda.</p>
      </div>
    `;
    return;
  }

  const actividades = obtenerActividadesPorEvento(eventoId);

  if (actividades.length === 0) {
    contenedor.innerHTML = `
      <div class="timeline__vacio" role="status">
        <span aria-hidden="true">🗒️</span>
        <p>Este evento no tiene actividades programadas aún.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = actividades.map(act => `
    <div class="timeline__item">
      <div class="timeline__punto" aria-hidden="true">${escaparHTML(act.tipo)}</div>
      <div class="timeline__contenido">
        <div class="timeline__hora">${escaparHTML(act.hora)} hrs · ${act.duracion} min</div>
        <div class="timeline__nombre">${escaparHTML(act.nombre)}</div>
        <div class="timeline__detalles">
          <span>👤 ${escaparHTML(act.ponente)}</span>
          ${act.descripcion ? `<span>· ${escaparHTML(act.descripcion)}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Renderiza el calendario mini.
 * Marca los días que tienen eventos.
 */
function renderizarCalendario() {
  const gridCal  = sel('#calendario-grid');
  const tituloEl = sel('#calendario-mes-anio');
  if (!gridCal || !tituloEl) return;

  const hoy        = new Date();
  const primerDia  = new Date(anioCalendario, mesCalendario, 1);
  const ultimoDia  = new Date(anioCalendario, mesCalendario + 1, 0);
  const diaSemana  = primerDia.getDay(); /* 0=dom */
  const diasEnMes  = ultimoDia.getDate();

  /* Título del mes */
  const nombreMes = primerDia.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });
  tituloEl.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

  /* Fechas de eventos para marcar en el calendario */
  const fechasConEvento = new Set(
    obtenerEventos().map(e => e.fecha)
  );

  /* Días de la semana */
  const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  let html = diasSemana.map(d =>
    `<div class="calendario__dia-sem" aria-hidden="true">${d}</div>`
  ).join('');

  /* Celdas vacías antes del primer día */
  for (let i = 0; i < diaSemana; i++) {
    html += `<div class="calendario__dia calendario__dia--vacio" aria-hidden="true"></div>`;
  }

  /* Días del mes */
  for (let d = 1; d <= diasEnMes; d++) {
    const mes2d   = String(mesCalendario + 1).padStart(2, '0');
    const dia2d   = String(d).padStart(2, '0');
    const fechaISO = `${anioCalendario}-${mes2d}-${dia2d}`;

    const esHoy       = (d === hoy.getDate() && mesCalendario === hoy.getMonth() && anioCalendario === hoy.getFullYear());
    const tieneEvento = fechasConEvento.has(fechaISO);

    let clases = 'calendario__dia';
    if (esHoy)       clases += ' calendario__dia--hoy';
    if (tieneEvento) clases += ' calendario__dia--con-evento';

    const atributoTitle = tieneEvento ? `title="Evento el ${d} de ${nombreMes}"` : '';
    const ariaLabel = `${d}${tieneEvento ? ', hay evento' : ''}${esHoy ? ', hoy' : ''}`;

    html += `
      <div class="${clases}"
           ${atributoTitle}
           aria-label="${ariaLabel}"
           role="${tieneEvento ? 'button' : 'gridcell'}"
           ${tieneEvento ? `onclick="filtrarPorFecha('${fechaISO}')" tabindex="0"` : ''}
      >${d}</div>
    `;
  }

  gridCal.innerHTML = html;

  /* Soporte teclado en días con evento */
  selTodos('.calendario__dia--con-evento', gridCal).forEach(dia => {
    dia.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dia.click();
      }
    });
  });
}

/**
 * Filtra eventos por fecha al hacer clic en el calendario.
 */
function filtrarPorFecha(fechaISO) {
  const eventoDelDia = obtenerEventos().find(e => e.fecha === fechaISO);
  if (!eventoDelDia) return;

  const selector = sel('#selector-evento-agenda');
  if (selector) {
    selector.value = eventoDelDia.id;
    eventoSeleccionadoAgenda = eventoDelDia.id;
    renderizarTimeline(eventoDelDia.id);
  }

  /* Scroll suave a la agenda */
  sel('#agenda')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  mostrarToast(`Agenda del evento: ${eventoDelDia.nombre}`, 'info');
}


/* ================================================================
   6. SECCIÓN HERO — estadísticas dinámicas
   ================================================================ */

function inicializarHero() {
  const stats = calcularEstadisticas();
  const eventos = obtenerEventos();

  /* Actualizar contadores del hero */
  const elEventos     = sel('#stat-eventos');
  const elActividades = sel('#stat-actividades');
  const elCupos       = sel('#stat-cupos');

  if (elEventos)     elEventos.textContent     = stats.eventos;
  if (elActividades) elActividades.textContent  = stats.actividades;
  if (elCupos)       elCupos.textContent        = stats.cuposDisponibles;

  /* Panel flotante — próximos eventos */
  const panelEventos = sel('#panel-proximos-eventos');
  if (panelEventos && eventos.length > 0) {
    const proximos = eventos
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 3);

    panelEventos.innerHTML = proximos.map(e => {
      const { dia, mes } = descomponerFecha(e.fecha);
      const cuposLibres = e.cuposTotal - e.cuposOcupados;
      return `
        <div class="hero-evento">
          <div class="hero-evento__fecha" aria-hidden="true">
            <span class="hero-evento__fecha-dia">${dia}</span>
            <span class="hero-evento__fecha-mes">${mes}</span>
          </div>
          <div class="hero-evento__info">
            <div class="hero-evento__nombre" title="${escaparHTML(e.nombre)}">
              ${escaparHTML(e.nombre)}
            </div>
            <div class="hero-evento__meta">
              <span class="hero-evento__badge badge-${e.categoria}">${e.categoria}</span>
              · ${cuposLibres > 0 ? `${cuposLibres} cupos` : 'Agotado'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}


/* ================================================================
   7. ANIMACIONES DE ENTRADA (IntersectionObserver)
   ================================================================ */

function inicializarAnimacionesEntrada() {
  const opciones = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, opciones);

  /* Estilos base para elementos animables */
  const estiloEntrada = document.createElement('style');
  estiloEntrada.textContent = `
    .animar-entrada {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .animar-entrada.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(estiloEntrada);

  /* Aplicar clase a elementos que se animarán */
  selTodos('.separador-seccion, .seccion-cta .cta__interior').forEach(el => {
    el.classList.add('animar-entrada');
    observador.observe(el);
  });
}


/* ================================================================
   8. GESTIÓN DE SESIÓN (compartida entre páginas)
   ================================================================ */

const CLAVE_SESION = 'jouslynia_sesion';

/** Obtiene la sesión activa desde sessionStorage */
function obtenerSesionActiva() {
  const datos = sessionStorage.getItem(CLAVE_SESION);
  return datos ? JSON.parse(datos) : null;
}

/** Cierra la sesión y redirige al inicio */
function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  window.location.href = '/index.html';
}


/* ================================================================
   9. INICIALIZACIÓN PRINCIPAL
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* Garantizar datos de demostración */
  inicializarDatosDemo();

  /* Header */
  inicializarHeader();
  actualizarAccionesHeader();

  /* Hero */
  inicializarHero();

  /* Sección de eventos */
  renderizarEventos();
  inicializarControlesEventos();

  /* Sección de agenda */
  inicializarAgenda();

  /* Animaciones */
  inicializarAnimacionesEntrada();

  /* Hacer disponible globalmente la función del calendario */
  window.filtrarPorFecha     = filtrarPorFecha;
  window.abrirDetalleEvento  = abrirDetalleEvento;
  window.cerrarSesion        = cerrarSesion;
  window.mostrarToast        = mostrarToast;
});
