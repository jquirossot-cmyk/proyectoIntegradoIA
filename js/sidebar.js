/**
 * JOUSLYNIA — /js/sidebar.js
 * Genera y controla el sidebar y topbar del panel de administración.
 * Depende de: auth.js + admin.js
 *
 * Uso: incluir en cada página admin DESPUÉS de auth.js y admin.js.
 * El HTML de cada página solo necesita el contenedor vacío con el id correcto.
 */
'use strict';

/**
 * Inyecta el sidebar completo en el elemento #sidebar.
 * @param {string} paginaActiva — ID de la sección activa (ej. 'dashboard', 'eventos'…)
 */
function inyectarSidebar(paginaActiva) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const sesion     = (typeof obtenerSesionActiva === 'function') ? obtenerSesionActiva() : null;
  const nombre     = sesion ? `${sesion.nombre} ${sesion.apellido}` : 'Administrador';
  const iniciales  = sesion
    ? sesion.nombre.charAt(0).toUpperCase() + sesion.apellido.charAt(0).toUpperCase()
    : 'A';

  const totalEventos  = (typeof obtenerEventosActivos === 'function') ? obtenerEventosActivos().length : '–';
  const totalUsuarios = JSON.parse(localStorage.getItem('jouslynia_usuarios') || '[]').length;

  const enlaces = [
    { id: 'dashboard',    icono: '📊', texto: 'Dashboard',       href: 'panel-admin.html',           badge: null },
    { id: 'eventos',      icono: '🗓️', texto: 'Eventos',          href: 'gestion-eventos.html',       badge: totalEventos },
    { id: 'actividades',  icono: '📋', texto: 'Actividades',      href: 'gestion-actividades.html',   badge: null },
    { id: 'usuarios',     icono: '👥', texto: 'Usuarios',         href: 'gestion-usuarios.html',      badge: totalUsuarios },
    { id: 'reportes',     icono: '📈', texto: 'Reportes',         href: 'reportes.html',              badge: null },
    { id: 'sitio-publico',icono: '🌐', texto: 'Ver sitio público',href: '../index.html',              badge: null }
  ];

  const generarEnlace = (e) => {
    const esActivo = e.id === paginaActiva;
    const badge    = e.badge !== null
      ? `<span class="nav-enlace__badge" aria-label="${e.badge}">${e.badge}</span>`
      : '';
    return `
      <a href="${e.href}" class="nav-enlace ${esActivo ? 'nav-enlace--activo' : ''}"
         ${esActivo ? 'aria-current="page"' : ''} title="${e.texto}">
        <span class="nav-enlace__icono" aria-hidden="true">${e.icono}</span>
        <span class="nav-enlace__texto">${e.texto}</span>
        ${badge}
      </a>
    `;
  };

  sidebar.innerHTML = `
    <div class="sidebar__cabecera">
      <div class="sidebar__logo-icono" aria-hidden="true">J</div>
      <div class="sidebar__logo-textos">
        <div class="sidebar__logo-nombre">Jouslynia</div>
        <div class="sidebar__logo-sub">CENFOTEC Admin</div>
      </div>
      <button class="sidebar__btn-colapsar" id="btn-colapsar-sidebar"
              onclick="toggleSidebar()" aria-label="Colapsar menú">◂</button>
    </div>

    <div class="sidebar__usuario">
      <div class="sidebar__usuario-avatar" id="sidebar-avatar" aria-hidden="true">${iniciales}</div>
      <div class="sidebar__usuario-info">
        <div class="sidebar__usuario-nombre">${nombre}</div>
        <div class="sidebar__usuario-rol">Administrador</div>
      </div>
    </div>

    <nav class="sidebar__nav" aria-label="Secciones del panel">
      <div class="nav-seccion">
        <span class="nav-seccion__etiqueta">Principal</span>
        ${generarEnlace(enlaces[0])}
      </div>
      <div class="nav-seccion">
        <span class="nav-seccion__etiqueta">Gestión</span>
        ${generarEnlace(enlaces[1])}
        ${generarEnlace(enlaces[2])}
        ${generarEnlace(enlaces[3])}
      </div>
      <div class="nav-seccion">
        <span class="nav-seccion__etiqueta">Análisis</span>
        ${generarEnlace(enlaces[4])}
      </div>
      <div class="nav-seccion">
        <span class="nav-seccion__etiqueta">Sistema</span>
        ${generarEnlace(enlaces[5])}
      </div>
    </nav>

    <div class="sidebar__pie">
      <button class="btn-cerrar-sesion" onclick="cerrarSesion()">
        <span>🏠</span>
        <span class="nav-enlace__texto">Volver al inicio</span>
      </button>
    </div>
  `;

  restaurarEstadoSidebar();
}

/**
 * Inyecta el topbar en el elemento #topbar.
 * @param {string} tituloPagina — título visible en el topbar
 * @param {string} paginaActiva — para la miga de pan
 */
function inyectarTopbar(tituloPagina, paginaActiva) {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const sesion    = (typeof obtenerSesionActiva === 'function') ? obtenerSesionActiva() : null;
  const nombre    = sesion ? sesion.nombre : 'Admin';
  const iniciales = sesion
    ? sesion.nombre.charAt(0).toUpperCase() + sesion.apellido.charAt(0).toUpperCase()
    : 'A';

  topbar.innerHTML = `
    <button class="topbar__btn-menu" id="btn-menu-movil"
            aria-label="Abrir menú lateral" aria-expanded="false"
            onclick="abrirSidebarMovil()">
      <span></span><span></span><span></span>
    </button>

    <div class="topbar__titulo">
      <div class="topbar__pagina-actual">${tituloPagina}</div>
      <nav class="topbar__migas" aria-label="Ruta de navegación">
        <a href="panel-admin.html">Dashboard</a>
        <span class="topbar__migas-sep" aria-hidden="true">/</span>
        <span aria-current="page">${tituloPagina}</span>
      </nav>
    </div>

    <div class="topbar__buscador" role="search">
      <span class="topbar__buscador-icono" aria-hidden="true">🔍</span>
      <input type="search" class="topbar__buscador-input" id="busqueda-topbar"
             placeholder="Buscar…" aria-label="Búsqueda global">
    </div>

    <div class="topbar__acciones">
      <button class="topbar__btn-icono" aria-label="Notificaciones" title="Notificaciones">
        🔔
        <span class="badge-notif" aria-hidden="true">3</span>
      </button>
      <div class="topbar__perfil" aria-label="Perfil">
        <div class="topbar__perfil-avatar" aria-hidden="true">${iniciales}</div>
        <span class="topbar__perfil-nombre">${nombre}</span>
      </div>
    </div>
  `;

  /* Búsqueda global */
  const inputBusq = document.getElementById('busqueda-topbar');
  if (inputBusq) {
    inputBusq.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        if (typeof mostrarToastAuth === 'function') {
          mostrarToastAuth(`Buscando "${e.target.value.trim()}" — función próximamente.`, 'info');
        }
      }
    });
  }
}

/* Exponer globalmente */
window.inyectarSidebar = inyectarSidebar;
window.inyectarTopbar  = inyectarTopbar;
