/**
 * JOUSLYNIA — /js/gestion-usuarios.js
 * Controlador de la página de gestión de usuarios.
 * Depende de: auth.js + admin.js + usuarios.js + sidebar.js
 */
'use strict';

/* ---- Estado ---- */
let filtroActivo   = 'todos';
let terminoBusq    = '';
let paginaActual   = 1;
const POR_PAGINA   = 10;
let idUsuarioElim  = null;

/* ---- Inicializar sidebar y topbar ---- */
inyectarSidebar('usuarios');
inyectarTopbar('Gestión de Usuarios', 'usuarios');

/* ================================================================
   RESUMEN NUMÉRICO
   ================================================================ */
function renderizarResumen() {
  const stats = calcularStatsUsuarios();
  const el    = document.getElementById('resumen-usuarios');
  if (!el) return;

  el.innerHTML = `
    <div class="resumen-usuarios__item">
      <div class="resumen-usuarios__numero">${stats.total}</div>
      <div class="resumen-usuarios__label">Total</div>
    </div>
    <div class="resumen-usuarios__item">
      <div class="resumen-usuarios__numero" style="color:var(--color-AzulOscuro);">${stats.admins}</div>
      <div class="resumen-usuarios__label">Admins</div>
    </div>
    <div class="resumen-usuarios__item">
      <div class="resumen-usuarios__numero" style="color:var(--color-Morado);">${stats.asistentes}</div>
      <div class="resumen-usuarios__label">Asistentes</div>
    </div>
    <div class="resumen-usuarios__item">
      <div class="resumen-usuarios__numero" style="color:var(--color-error);">${stats.inactivos}</div>
      <div class="resumen-usuarios__label">Inactivos</div>
    </div>
  `;
}

/* ================================================================
   RENDERIZADO DE TABLA
   ================================================================ */
function refrescarTablaUsuarios() {
  const sesion  = (typeof obtenerSesionActiva === 'function') ? obtenerSesionActiva() : null;
  let usuarios  = obtenerTodosUsuarios();

  /* Filtro por rol / estado */
  if (filtroActivo === 'admin')     usuarios = usuarios.filter(u => u.rol === 'admin' && u.activo !== false);
  if (filtroActivo === 'asistente') usuarios = usuarios.filter(u => u.rol === 'asistente' && u.activo !== false);
  if (filtroActivo === 'inactivo')  usuarios = usuarios.filter(u => u.activo === false);
  if (filtroActivo === 'todos')     { /* sin filtro adicional */ }

  /* Búsqueda */
  if (terminoBusq.length >= 2) {
    const t = terminoBusq.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    usuarios = usuarios.filter(u => {
      const texto = `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return texto.includes(t);
    });
  }

  /* Contador */
  const contEl = document.getElementById('contador-usuarios');
  if (contEl) contEl.textContent = `${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''}`;

  /* Paginación */
  const totalPags = Math.max(1, Math.ceil(usuarios.length / POR_PAGINA));
  paginaActual    = Math.min(paginaActual, totalPags);
  const inicio    = (paginaActual - 1) * POR_PAGINA;
  const pagina    = usuarios.slice(inicio, inicio + POR_PAGINA);

  /* Renderizar filas */
  const tbody = document.getElementById('tbody-usuarios');
  if (!tbody) return;

  if (pagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:3rem;color:var(--texto-tenue);">
          <div style="font-size:2rem;margin-bottom:.5rem;">👥</div>
          <div style="font-weight:700;">Sin resultados</div>
          <div style="font-size:var(--texto-sm);margin-top:4px;">Prueba con otro filtro o término.</div>
        </td>
      </tr>`;
  } else {
    tbody.innerHTML = pagina.map(u => generarFilaUsuario(u, sesion)).join('');
  }

  /* Paginación */
  renderizarPaginacion(totalPags);
}

function renderizarPaginacion(totalPags) {
  const cont = document.getElementById('paginacion-usuarios');
  if (!cont || totalPags <= 1) { if (cont) cont.innerHTML = ''; return; }

  let html = `<button class="paginacion__btn" onclick="irPag(${paginaActual - 1})"
    ${paginaActual === 1 ? 'disabled' : ''} aria-label="Anterior">‹</button>`;

  for (let p = 1; p <= totalPags; p++) {
    html += `<button class="paginacion__btn ${p === paginaActual ? 'paginacion__btn--activo' : ''}"
      onclick="irPag(${p})" aria-label="Página ${p}" ${p === paginaActual ? 'aria-current="page"' : ''}>${p}</button>`;
  }

  html += `<button class="paginacion__btn" onclick="irPag(${paginaActual + 1})"
    ${paginaActual === totalPags ? 'disabled' : ''} aria-label="Siguiente">›</button>`;

  cont.innerHTML = html;
}

function irPag(n) { paginaActual = n; refrescarTablaUsuarios(); }
window.irPag = irPag;

/* ================================================================
   FILTROS
   ================================================================ */
['todos','admin','asistente','inactivo'].forEach(id => {
  const btn = document.getElementById(`filtro-${id}`);
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabla-filtro').forEach(b => b.classList.remove('tabla-filtro--activo'));
    btn.classList.add('tabla-filtro--activo');
    filtroActivo = id;
    paginaActual = 1;
    refrescarTablaUsuarios();
  });
});

/* Búsqueda */
const inputBusq = document.getElementById('busqueda-usuarios');
if (inputBusq) {
  let timer;
  inputBusq.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      terminoBusq  = e.target.value.trim();
      paginaActual = 1;
      refrescarTablaUsuarios();
    }, 250);
  });
}

/* ================================================================
   ACCIONES SOBRE USUARIOS
   ================================================================ */

/** Cambia el rol desde el select inline de la tabla */
function accionCambiarRol(id, nuevoRol) {
  const res = cambiarRolUsuario(id, nuevoRol);
  if (res.exito) {
    mostrarToastAuth(res.mensaje, 'exito');
    refrescarTablaUsuarios();
    renderizarResumen();
  } else {
    mostrarToastAuth(res.mensaje, 'error');
    refrescarTablaUsuarios(); /* Revertir el select */
  }
}

/** Abre el modal de confirmación de eliminación */
function accionEliminarUsuario(id) {
  const usr = obtenerUsuarioPorId(id);
  if (!usr) return;

  idUsuarioElim = id;
  document.getElementById('texto-confirmar-usr').textContent =
    `Estás a punto de desactivar a "${usr.nombre} ${usr.apellido}".`;

  document.getElementById('modal-confirmar-usr').classList.add('modal-fondo--visible');
  document.body.style.overflow = 'hidden';
}

/** Restaura un usuario desactivado */
function accionRestaurarUsuario(id) {
  restaurarUsuario(id);
  mostrarToastAuth('Usuario restaurado correctamente.', 'exito');
  refrescarTablaUsuarios();
  renderizarResumen();
}

/* Confirmar eliminación */
document.getElementById('btn-confirmar-eliminar-usr').addEventListener('click', () => {
  if (!idUsuarioElim) return;
  const res = eliminarUsuario(idUsuarioElim);
  cerrarConfirmarUsr();

  if (res.exito) {
    mostrarToastAuth(res.mensaje, 'exito');
  } else {
    mostrarToastAuth(res.mensaje, 'error');
  }
  refrescarTablaUsuarios();
  renderizarResumen();
  idUsuarioElim = null;
});

/* Cerrar modal */
function cerrarConfirmarUsr() {
  document.getElementById('modal-confirmar-usr').classList.remove('modal-fondo--visible');
  document.body.style.overflow = '';
  idUsuarioElim = null;
}

document.getElementById('btn-cancelar-usr').addEventListener('click', cerrarConfirmarUsr);
document.getElementById('btn-cerrar-confirmar-usr').addEventListener('click', cerrarConfirmarUsr);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarConfirmarUsr();
});

/* Exportar CSV */
document.getElementById('btn-exportar-csv').addEventListener('click', () => {
  const usuarios  = obtenerTodosUsuarios();
  const cabeceras = ['ID','Nombre','Apellido','Correo','Rol','Activo','Fecha Registro'];
  const filas     = usuarios.map(u => [
    u.id,
    `"${(u.nombre || '').replace(/"/g, '""')}"`,
    `"${(u.apellido || '').replace(/"/g, '""')}"`,
    u.correo, u.rol,
    u.activo !== false ? 'Sí' : 'No',
    u.fechaRegistro || '—'
  ].join(','));

  const csv    = [cabeceras.join(','), ...filas].join('\n');
  const blob   = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `jouslynia-usuarios-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToastAuth('CSV de usuarios descargado.', 'exito');
});

/* Exponer acciones usadas en HTML generado */
window.accionCambiarRol       = accionCambiarRol;
window.accionEliminarUsuario  = accionEliminarUsuario;
window.accionRestaurarUsuario = accionRestaurarUsuario;

/* ================================================================
   INICIALIZACIÓN
   ================================================================ */
renderizarResumen();
refrescarTablaUsuarios();
