/**
 * ================================================================
 * JOUSLYNIA — Sistema de Gestión de Eventos · Universidad CENFOTEC
 * /js/usuarios.js — Lógica de gestión de usuarios
 * ================================================================
 *
 * Depende de: auth.js (debe cargarse primero)
 * Responsabilidades:
 *  1. Leer usuarios desde localStorage
 *  2. Cambiar rol de usuario
 *  3. Eliminar usuario (lógico + físico)
 *  4. Renderizado de la tabla y resumen
 *  5. Filtros y búsqueda
 *  6. Paginación
 */

'use strict';

/* ================================================================
   CONSTANTES
   ================================================================ */
const CLAVE_USUARIOS_MOD = 'jouslynia_usuarios';
const ROLES_VALIDOS      = ['admin', 'asistente'];
const POR_PAGINA_USR     = 10;

/* ================================================================
   CAPA DE DATOS
   ================================================================ */

/** Devuelve todos los usuarios del localStorage */
function obtenerTodosUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS_MOD);
  return datos ? JSON.parse(datos) : [];
}

/** Devuelve solo usuarios activos */
function obtenerUsuariosActivos() {
  return obtenerTodosUsuarios().filter(u => u.activo !== false);
}

/** Persiste el array de usuarios */
function guardarUsuarios(lista) {
  localStorage.setItem(CLAVE_USUARIOS_MOD, JSON.stringify(lista));
}

/** Busca un usuario por ID */
function obtenerUsuarioPorId(id) {
  return obtenerTodosUsuarios().find(u => u.id === parseInt(id)) || null;
}

/* ================================================================
   CRUD DE USUARIOS
   ================================================================ */

/**
 * Cambia el rol de un usuario entre 'admin' y 'asistente'.
 * No permite cambiar el rol del administrador principal (id=1).
 * @param {number} id
 * @param {string} nuevoRol
 * @returns {{ exito: boolean, mensaje: string }}
 */
function cambiarRolUsuario(id, nuevoRol) {
  if (!ROLES_VALIDOS.includes(nuevoRol)) {
    return { exito: false, mensaje: 'Rol no válido.' };
  }

  const lista = obtenerTodosUsuarios();
  const idx   = lista.findIndex(u => u.id === parseInt(id));

  if (idx === -1) {
    return { exito: false, mensaje: 'Usuario no encontrado.' };
  }

  if (lista[idx].correo === 'admin@cenfotec.ac.cr' && nuevoRol !== 'admin') {
    return { exito: false, mensaje: 'No se puede cambiar el rol del administrador principal del sistema.' };
  }

  /* Si se asciende a admin, verificar sesión actual */
  const sesion = (typeof obtenerSesionActiva === 'function') ? obtenerSesionActiva() : null;
  if (!sesion) {
    return { exito: false, mensaje: 'Sesión no válida.' };
  }

  const rolAnterior = lista[idx].rol;
  lista[idx].rol = nuevoRol;
  guardarUsuarios(lista);

  return {
    exito: true,
    mensaje: `Rol de ${lista[idx].nombre} cambiado de "${rolAnterior}" a "${nuevoRol}".`
  };
}

/**
 * Elimina lógicamente un usuario (marca activo = false).
 * Protege al administrador principal y al usuario en sesión.
 * @param {number} id
 * @returns {{ exito: boolean, mensaje: string }}
 */
function eliminarUsuario(id) {
  const lista   = obtenerTodosUsuarios();
  const idx     = lista.findIndex(u => u.id === parseInt(id));

  if (idx === -1) {
    return { exito: false, mensaje: 'Usuario no encontrado.' };
  }

  /* Proteger el admin principal */
  if (lista[idx].correo === 'admin@cenfotec.ac.cr') {
    return { exito: false, mensaje: 'El administrador principal del sistema no puede eliminarse.' };
  }

  /* No eliminar el usuario con sesión activa */
  const sesion = (typeof obtenerSesionActiva === 'function') ? obtenerSesionActiva() : null;
  if (sesion && sesion.id === parseInt(id)) {
    return { exito: false, mensaje: 'No puedes eliminar tu propia cuenta mientras tienes sesión activa.' };
  }

  const nombre = lista[idx].nombre + ' ' + lista[idx].apellido;
  lista[idx].activo = false;
  guardarUsuarios(lista);

  return { exito: true, mensaje: `Usuario "${nombre}" eliminado correctamente.` };
}

/**
 * Restaura un usuario eliminado.
 * @param {number} id
 */
function restaurarUsuario(id) {
  const lista = obtenerTodosUsuarios();
  const idx   = lista.findIndex(u => u.id === parseInt(id));
  if (idx === -1) return;
  lista[idx].activo = true;
  guardarUsuarios(lista);
}

/* ================================================================
   ESTADÍSTICAS DE USUARIOS
   ================================================================ */

/** Calcula estadísticas rápidas de la lista de usuarios */
function calcularStatsUsuarios() {
  const todos      = obtenerTodosUsuarios();
  const activos    = todos.filter(u => u.activo !== false);
  const admins     = activos.filter(u => u.rol === 'admin');
  const asistentes = activos.filter(u => u.rol === 'asistente');
  const inactivos  = todos.filter(u => u.activo === false);

  return {
    total:       todos.length,
    activos:     activos.length,
    admins:      admins.length,
    asistentes:  asistentes.length,
    inactivos:   inactivos.length
  };
}

/* ================================================================
   RENDERIZADO DE LA TABLA
   ================================================================ */

/**
 * Genera el HTML de una fila de usuario.
 * @param {Object} usuario
 * @param {Object} sesionActual — sesión del admin logueado
 * @returns {string} HTML
 */
function generarFilaUsuario(usuario, sesionActual) {
  const esActual    = sesionActual && sesionActual.id === usuario.id;
  const esProtegido = usuario.correo === 'admin@cenfotec.ac.cr';
  const esInactivo  = usuario.activo === false;

  const iniciales = (usuario.nombre || '?').charAt(0).toUpperCase() +
                    (usuario.apellido || '').charAt(0).toUpperCase();

  const claseAvatar = usuario.rol === 'admin'
    ? 'usuario-avatar usuario-avatar--admin'
    : 'usuario-avatar usuario-avatar--asistente';

  const fechaReg = usuario.fechaRegistro
    ? new Date(usuario.fechaRegistro + 'T00:00:00').toLocaleDateString('es-CR', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : '—';

  /* Selector de rol */
  const selectorRol = `
    <select class="select-rol"
            onchange="accionCambiarRol(${usuario.id}, this.value)"
            aria-label="Cambiar rol de ${usuario.nombre}"
            ${esProtegido ? 'disabled' : ''}>
      <option value="admin"     ${usuario.rol === 'admin'     ? 'selected' : ''}>👑 Admin</option>
      <option value="asistente" ${usuario.rol === 'asistente' ? 'selected' : ''}>👤 Asistente</option>
    </select>
  `;

  /* Columna de acciones */
  let acciones;
  if (esInactivo) {
    acciones = `
      <button class="btn-tabla btn-tabla--ver"
              onclick="accionRestaurarUsuario(${usuario.id})"
              title="Restaurar usuario" aria-label="Restaurar a ${usuario.nombre}">↩</button>
    `;
  } else if (esProtegido || esActual) {
    acciones = `<span class="estado-protegido">🔒 Protegido</span>`;
  } else {
    acciones = `
      <button class="btn-tabla btn-tabla--eliminar"
              onclick="accionEliminarUsuario(${usuario.id})"
              title="Eliminar usuario"
              aria-label="Eliminar a ${usuario.nombre} ${usuario.apellido}">🗑️</button>
    `;
  }

  return `
    <tr id="fila-usr-${usuario.id}"
        class="${esActual ? 'fila-usuario-actual' : ''} ${esInactivo ? 'fila-eliminada' : ''}">
      <td>
        <div class="celda-usuario">
          <div class="${claseAvatar}" aria-hidden="true">${iniciales}</div>
          <div>
            <div class="celda-usuario__nombre">
              ${sanitizarTexto(usuario.nombre)} ${sanitizarTexto(usuario.apellido)}
              ${esActual ? '<span class="badge-tu">Tú</span>' : ''}
            </div>
            <div class="celda-usuario__fecha">Desde ${fechaReg}</div>
          </div>
        </div>
      </td>
      <td style="font-size:var(--texto-sm);">${sanitizarTexto(usuario.correo)}</td>
      <td>${selectorRol}</td>
      <td>
        <span class="estado ${esInactivo ? 'estado--inactivo' : 'estado--activo'}">
          ${esInactivo ? 'Inactivo' : 'Activo'}
        </span>
      </td>
      <td>
        <div class="celda-acciones">${acciones}</div>
      </td>
    </tr>
  `;
}

/**
 * Escapa HTML para prevenir XSS.
 * Reutiliza sanitizar() de admin.js si existe.
 */
function sanitizarTexto(texto) {
  if (typeof sanitizar === 'function') return sanitizar(texto);
  const d = document.createElement('div');
  d.textContent = String(texto || '');
  return d.innerHTML;
}

/* ================================================================
   EXPORTAR GLOBALMENTE
   ================================================================ */
window.obtenerTodosUsuarios   = obtenerTodosUsuarios;
window.obtenerUsuariosActivos = obtenerUsuariosActivos;
window.obtenerUsuarioPorId    = obtenerUsuarioPorId;
window.cambiarRolUsuario      = cambiarRolUsuario;
window.eliminarUsuario        = eliminarUsuario;
window.restaurarUsuario       = restaurarUsuario;
window.calcularStatsUsuarios  = calcularStatsUsuarios;
window.generarFilaUsuario     = generarFilaUsuario;
window.sanitizarTexto         = sanitizarTexto;
