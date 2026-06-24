/**
 * JOUSLYNIA — /js/panel-admin.js
 * Controlador del dashboard principal.
 * Depende de: auth.js + admin.js + sidebar.js
 */
'use strict';

/* Protección de ruta: solo administradores */
protegerRutaAdmin();

inyectarSidebar('dashboard');
inyectarTopbar('Dashboard', 'dashboard');

/* Saludo según hora */
function configurarSaludo() {
  const sesion = obtenerSesionActiva();
  const hora   = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';
  const el     = document.getElementById('titulo-bienvenida');
  if (el && sesion) el.textContent = `${saludo}, ${sesion.nombre} 👋`;
}

/* Anima un número desde 0 hasta destino */
function animarConteo(id, destino) {
  const el = document.getElementById(id);
  if (!el) return;
  let actual = 0;
  const paso = Math.max(1, Math.floor(destino / 25));
  const timer = setInterval(() => {
    actual = Math.min(actual + paso, destino);
    el.textContent = actual;
    if (actual >= destino) clearInterval(timer);
  }, 40);
}

/* Cargar estadísticas */
function cargarEstadisticas() {
  const eventos     = obtenerEventosActivos();
  const actividades = obtenerTodasActividades().filter(a => a.activo);
  const usuarios    = JSON.parse(localStorage.getItem('jouslynia_usuarios') || '[]');
  const cuposTotal  = eventos.reduce((s, e) => s + (e.cuposTotal || 0), 0);
  const cuposOcup   = eventos.reduce((s, e) => s + (e.cuposOcupados || 0), 0);
  const cuposDisp   = cuposTotal - cuposOcup;
  const pct         = cuposTotal > 0 ? Math.round((cuposOcup / cuposTotal) * 100) : 0;

  animarConteo('stat-total-eventos',    eventos.length);
  animarConteo('stat-total-usuarios',   usuarios.length);
  animarConteo('stat-total-actividades', actividades.length);
  animarConteo('stat-cupos-disp',        cuposDisp);

  const elPct = document.getElementById('stat-pct-ocup');
  if (elPct) elPct.textContent = `${pct}% ocupación`;

  renderizarTablaEventos(eventos.slice().sort((a,b) => a.fecha.localeCompare(b.fecha)).slice(0,5));
  renderizarGraficoOcupacion(eventos);
}

/* Tabla de próximos eventos */
function renderizarTablaEventos(eventos) {
  const tbody = document.getElementById('tbody-eventos-recientes');
  if (!tbody) return;

  if (!eventos.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--texto-tenue);">No hay eventos activos.</td></tr>';
    return;
  }

  tbody.innerHTML = eventos.map(e => {
    const libres = e.cuposTotal - (e.cuposOcupados || 0);
    const pct    = Math.round(((e.cuposOcupados||0) / e.cuposTotal) * 100);
    const color  = pct >= 90 ? 'var(--color-error)' : pct >= 60 ? 'var(--color-amarilloOscuro)' : 'var(--color-exito)';
    const fecha  = new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-CR', { day:'numeric', month:'short', year:'numeric' });

    return `
      <tr>
        <td>
          <div style="font-weight:700;font-size:var(--texto-sm);">${sanitizar(e.nombre)}</div>
          <div style="font-size:var(--texto-xs);color:var(--texto-tenue);">${sanitizar(e.lugar)}</div>
        </td>
        <td><span class="rol-badge rol-badge--admin" style="text-transform:capitalize;">${e.categoria}</span></td>
        <td style="font-size:var(--texto-sm);white-space:nowrap;">${fecha}</td>
        <td>
          <div class="barra-cupos-admin">
            <div class="barra-cupos-admin__pista">
              <div class="barra-cupos-admin__relleno" style="width:${pct}%;background:${color};"
                   role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <div class="barra-cupos-admin__texto">${libres}/${e.cuposTotal} libres</div>
          </div>
        </td>
        <td><span class="estado ${libres <= 0 ? 'estado--agotado' : 'estado--activo'}">${libres <= 0 ? 'Agotado' : 'Activo'}</span></td>
      </tr>`;
  }).join('');
}

/* Barras de ocupación */
function renderizarGraficoOcupacion(eventos) {
  const cont = document.getElementById('grafico-ocupacion');
  if (!cont) return;
  const top4 = [...eventos]
    .map(e => ({ ...e, pct: e.cuposTotal > 0 ? Math.round(((e.cuposOcupados||0)/e.cuposTotal)*100) : 0 }))
    .sort((a,b) => b.pct - a.pct).slice(0,4);

  cont.innerHTML = top4.map(e => {
    const color = e.pct >= 90 ? 'var(--color-error)' : e.pct >= 60 ? 'var(--color-amarilloOscuro)' : 'var(--color-exito)';
    const nombre = e.nombre.length > 30 ? e.nombre.substring(0,30) + '…' : e.nombre;
    return `
      <div style="margin-bottom:var(--espacio-3);">
        <div style="display:flex;justify-content:space-between;font-size:var(--texto-xs);margin-bottom:4px;">
          <span style="font-weight:600;" title="${e.nombre}">${sanitizar(nombre)}</span>
          <span style="font-weight:700;color:${color};">${e.pct}%</span>
        </div>
        <div style="height:7px;background:var(--admin-borde);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${e.pct}%;background:${color};border-radius:4px;transition:width .6s ease;"></div>
        </div>
      </div>`;
  }).join('');
}

/* Actividad reciente (simulada) */
function renderizarActividadReciente() {
  const items = [
    { ico:'👤', titulo:'Nuevo usuario registrado',  meta:'hace 5 min',  desc:'Se creó una cuenta nueva.' },
    { ico:'🗓️', titulo:'Evento creado',              meta:'hace 1h',     desc:'Seminario de Ciberseguridad.' },
    { ico:'🎟️', titulo:'Inscripción registrada',     meta:'hace 2h',     desc:'Cupo ocupado en Congreso IA.' },
    { ico:'✏️', titulo:'Evento editado',             meta:'ayer',        desc:'Fecha del Hackathon actualizada.' },
    { ico:'🔒', titulo:'Inicio de sesión admin',     meta:'ayer',        desc:'Acceso desde admin@cenfotec.ac.cr.' }
  ];
  const cont = document.getElementById('actividad-reciente');
  if (!cont) return;
  cont.innerHTML = items.map(a => `
    <div class="actividad-item">
      <div class="actividad-item__icono" aria-hidden="true">${a.ico}</div>
      <div class="actividad-item__contenido">
        <div class="actividad-item__titulo">${a.titulo}</div>
        <div class="actividad-item__meta">${a.desc}</div>
      </div>
      <div class="actividad-item__tiempo">${a.meta}</div>
    </div>
  `).join('');
}

/* Inicializar */
configurarSaludo();
cargarEstadisticas();
renderizarActividadReciente();