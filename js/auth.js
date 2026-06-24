/**
 * ================================================================
 * JOUSLYNIA — Sistema de Gestión de Eventos · Universidad CENFOTEC
 * /js/auth.js — Módulo de autenticación y control de acceso
 * ================================================================
 *
 * CORRECCIONES v2:
 *  - Rutas calculadas dinámicamente (no hardcodeadas) para funcionar
 *    tanto desde / (index.html) como desde /pages/*.html
 *  - protegerRutaAdmin() ahora sí protege las páginas admin
 *  - actualizarHeaderPublico() usa ruta correcta a pages/
 *  - cerrarSesion() usa ruta dinámica
 */

'use strict';

/* ================================================================
   1. RUTAS DINÁMICAS (calculadas en tiempo de ejecución)
   ================================================================ */

/**
 * Detecta si la página actual está dentro de /pages/ y calcula
 * el prefijo correcto para navegar a la raíz del proyecto.
 *
 * /index.html        → prefijo = ''        (ya en la raíz)
 * /pages/login.html  → prefijo = '../'     (un nivel arriba)
 */
function calcularPrefijo() {
  const ruta = window.location.pathname;
  // Cualquier página dentro de /pages/ necesita subir un nivel
  if (ruta.includes('/pages/')) return '../';
  return '';
}

function rutaInicio()  { return calcularPrefijo() + 'index.html'; }
function rutaPanel()   { return calcularPrefijo() + 'pages/panel-admin.html'; }
function rutaLogin()   { return calcularPrefijo() + 'pages/login.html'; }


/* ================================================================
   2. CONSTANTES DE ALMACENAMIENTO
   ================================================================ */

const CLAVE_USUARIOS = 'jouslynia_usuarios';
const CLAVE_SESION   = 'jouslynia_sesion';

const ADMIN_POR_DEFECTO = {
  id:            1,
  nombre:        'Administrador',
  apellido:      'CENFOTEC',
  correo:        'admin@cenfotec.ac.cr',
  contrasena:    'admin123',
  rol:           'admin',
  activo:        true,
  fechaRegistro: '2026-01-01'
};


/* ================================================================
   3. INICIALIZACIÓN DE DATOS
   ================================================================ */

function inicializarUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);
  if (!datos) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify([ADMIN_POR_DEFECTO]));
    return;
  }
  const lista = JSON.parse(datos);
  const existeAdmin = lista.some(u => u.correo === ADMIN_POR_DEFECTO.correo);
  if (!existeAdmin) {
    lista.unshift(ADMIN_POR_DEFECTO);
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
  }
}

function obtenerTodosLosUsuarios() {
  const datos = localStorage.getItem(CLAVE_USUARIOS);
  return datos ? JSON.parse(datos) : [];
}

function persistirUsuarios(lista) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(lista));
}

function buscarUsuarioPorCorreo(correo) {
  return obtenerTodosLosUsuarios()
    .find(u => u.correo.toLowerCase() === correo.trim().toLowerCase()) || null;
}

function correoYaRegistrado(correo) {
  return buscarUsuarioPorCorreo(correo) !== null;
}


/* ================================================================
   4. REGISTRO
   ================================================================ */

function registrarUsuario(datos) {
  if (correoYaRegistrado(datos.correo)) {
    return { exito: false, mensaje: 'Este correo ya tiene una cuenta registrada.' };
  }

  const lista    = obtenerTodosLosUsuarios();
  const nuevoId  = lista.length > 0 ? Math.max(...lista.map(u => u.id)) + 1 : 1;

  lista.push({
    id:            nuevoId,
    nombre:        datos.nombre.trim(),
    apellido:      datos.apellido.trim(),
    correo:        datos.correo.trim().toLowerCase(),
    contrasena:    datos.contrasena,
    rol:           'asistente',
    activo:        true,
    fechaRegistro: new Date().toISOString().split('T')[0]
  });

  persistirUsuarios(lista);
  return { exito: true, mensaje: '¡Cuenta creada correctamente!' };
}


/* ================================================================
   5. INICIO DE SESIÓN
   ================================================================ */

function iniciarSesion(correo, contrasena) {
  const usuario = buscarUsuarioPorCorreo(correo);

  if (!usuario) {
    return { exito: false, mensaje: 'No existe ninguna cuenta con ese correo.' };
  }
  if (!usuario.activo) {
    return { exito: false, mensaje: 'Esta cuenta está desactivada. Contacta al administrador.' };
  }
  if (usuario.contrasena !== contrasena) {
    return { exito: false, mensaje: 'La contraseña no es correcta.' };
  }

  const sesion = {
    id:         usuario.id,
    nombre:     usuario.nombre,
    apellido:   usuario.apellido,
    correo:     usuario.correo,
    rol:        usuario.rol,
    iniciadoEn: new Date().toISOString()
  };

  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  return { exito: true, mensaje: `¡Bienvenido/a, ${usuario.nombre}!`, usuario: sesion };
}


/* ================================================================
   6. CIERRE DE SESIÓN
   ================================================================ */

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  // Siempre navegar al index desde la raíz del proyecto
  window.location.href = rutaInicio();
}


/* ================================================================
   7. CONSULTA DE SESIÓN
   ================================================================ */

function obtenerSesionActiva() {
  const datos = sessionStorage.getItem(CLAVE_SESION);
  return datos ? JSON.parse(datos) : null;
}

function haySesionActiva() {
  return obtenerSesionActiva() !== null;
}

function esAdministrador() {
  const sesion = obtenerSesionActiva();
  return sesion !== null && sesion.rol === 'admin';
}


/* ================================================================
   8. PROTECCIÓN DE RUTAS
   ================================================================ */

/**
 * Protege páginas que requieren sesión de administrador.
 * DEBE llamarse al inicio de cada JS controlador de admin.
 */
function protegerRutaAdmin() {
  if (!haySesionActiva()) {
    sessionStorage.setItem('jouslynia_ruta_pendiente', window.location.href);
    window.location.replace(rutaLogin());
    return;
  }
  if (!esAdministrador()) {
    window.location.replace(rutaInicio());
  }
}

function protegerRuta() {
  if (!haySesionActiva()) {
    sessionStorage.setItem('jouslynia_ruta_pendiente', window.location.href);
    window.location.replace(rutaLogin());
  }
}

/**
 * En login/registro: si ya hay sesión, redirigir al destino correcto.
 */
function redirigirSiYaTieneSesion() {
  if (esAdministrador()) {
    window.location.replace(rutaPanel());
  } else if (haySesionActiva()) {
    window.location.replace(rutaInicio());
  }
}


/* ================================================================
   9. UI DEL HEADER PÚBLICO
   ================================================================ */

function actualizarHeaderPublico() {
  const contenedor = document.getElementById('acciones-header');
  const movil      = document.getElementById('acciones-movil');
  const sesion     = obtenerSesionActiva();

  if (!sesion) return; // sin sesión → HTML estático ya tiene los botones correctos

  const prefijo = calcularPrefijo();

  const htmlSesion = `
    <span class="header-saludo" style="font-size:var(--texto-sm);font-weight:600;color:var(--texto-secundario);">
      👋 ${escaparTexto(sesion.nombre)}
    </span>
    ${sesion.rol === 'admin'
      ? `<a href="${prefijo}pages/panel-admin.html" class="btn btn-primario btn-sm">Panel admin</a>`
      : ''}
    <button onclick="cerrarSesion()" class="btn btn-secundario btn-sm">Cerrar sesión</button>
  `;

  if (contenedor) contenedor.innerHTML = htmlSesion;
  if (movil) movil.innerHTML = htmlSesion;
}


/* ================================================================
   10. VALIDACIONES REUTILIZABLES
   ================================================================ */

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

function evaluarContrasena(contrasena) {
  if (!contrasena || contrasena.length < 4) {
    return { nivel: 'debil', etiqueta: 'Muy corta', color: 'var(--color-error)', porcentaje: 15 };
  }
  let puntos = 0;
  if (contrasena.length >= 8)           puntos++;
  if (/[A-Z]/.test(contrasena))         puntos++;
  if (/[0-9]/.test(contrasena))         puntos++;
  if (/[^A-Za-z0-9]/.test(contrasena)) puntos++;

  if (puntos <= 1) return { nivel: 'debil',  etiqueta: 'Débil',     color: 'var(--color-error)',          porcentaje: 25 };
  if (puntos <= 2) return { nivel: 'media',  etiqueta: 'Aceptable', color: 'var(--color-amarilloOscuro)', porcentaje: 60 };
  return             { nivel: 'fuerte', etiqueta: 'Fuerte',     color: 'var(--color-exito)',          porcentaje: 100 };
}

function escaparTexto(texto) {
  const div = document.createElement('div');
  div.textContent = String(texto);
  return div.innerHTML;
}

function mostrarErrorCampo(campo, mensaje) {
  if (!campo) return;

  // Buscar el elemento de error en el padre directo o en su abuelo
  let errorEl = campo.parentElement.querySelector('.campo-error-msg')
             || campo.parentElement.parentElement?.querySelector('.campo-error-msg');

  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'campo-error-msg';
    errorEl.setAttribute('role', 'alert');
    campo.parentElement.appendChild(errorEl);
  }

  if (mensaje) {
    campo.classList.add('campo-form__control--error');
    campo.setAttribute('aria-invalid', 'true');
    errorEl.textContent = '⚠ ' + mensaje;
    errorEl.style.display = 'block';
  } else {
    campo.classList.remove('campo-form__control--error');
    campo.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

function limpiarErroresFormulario(formulario) {
  if (!formulario) return;
  formulario.querySelectorAll('.campo-form__control--error').forEach(c => {
    c.classList.remove('campo-form__control--error');
    c.removeAttribute('aria-invalid');
  });
  formulario.querySelectorAll('.campo-error-msg').forEach(e => {
    e.textContent = '';
    e.style.display = 'none';
  });
}


/* ================================================================
   11. UTILIDADES DE INTERFAZ
   ================================================================ */

function mostrarToastAuth(mensaje, tipo = 'info', duracion = 4500) {
  if (typeof mostrarToast === 'function') { mostrarToast(mensaje, tipo, duracion); return; }

  const iconos = { info: 'ℹ️', exito: '✅', error: '❌', aviso: '⚠️' };
  let cont = document.getElementById('toast-contenedor');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'toast-contenedor';
    cont.className = 'toast-contenedor';
    cont.setAttribute('aria-live', 'assertive');
    document.body.appendChild(cont);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icono" aria-hidden="true">${iconos[tipo] || 'ℹ️'}</span>
    <span class="toast__mensaje">${escaparTexto(mensaje)}</span>
    <button class="toast__cerrar" aria-label="Cerrar" onclick="this.parentElement.remove()">✕</button>
  `;
  cont.appendChild(toast);
  setTimeout(() => toast.remove(), duracion);
}

function toggleBotonCarga(boton, cargando, textoOriginal) {
  if (!boton) return;
  boton.disabled      = cargando;
  boton.textContent   = cargando ? 'Procesando…' : textoOriginal;
  boton.style.opacity = cargando ? '0.7' : '1';
}


/* ================================================================
   INICIALIZACIÓN AUTOMÁTICA
   ================================================================ */
inicializarUsuarios();

/* Exponer globalmente */
window.cerrarSesion              = cerrarSesion;
window.obtenerSesionActiva       = obtenerSesionActiva;
window.haySesionActiva           = haySesionActiva;
window.esAdministrador           = esAdministrador;
window.protegerRuta              = protegerRuta;
window.protegerRutaAdmin         = protegerRutaAdmin;
window.redirigirSiYaTieneSesion  = redirigirSiYaTieneSesion;
window.actualizarHeaderPublico   = actualizarHeaderPublico;
window.registrarUsuario          = registrarUsuario;
window.iniciarSesion             = iniciarSesion;
window.obtenerTodosLosUsuarios   = obtenerTodosLosUsuarios;
window.mostrarErrorCampo         = mostrarErrorCampo;
window.limpiarErroresFormulario  = limpiarErroresFormulario;
window.evaluarContrasena         = evaluarContrasena;
window.esCorreoValido            = esCorreoValido;
window.escaparTexto              = escaparTexto;
window.mostrarToastAuth          = mostrarToastAuth;
window.toggleBotonCarga          = toggleBotonCarga;
window.calcularPrefijo           = calcularPrefijo;
window.rutaInicio                = rutaInicio;
window.rutaPanel                 = rutaPanel;
window.rutaLogin                 = rutaLogin;
