/**
 * JOUSLYNIA — /js/login.js
 * Controlador de la página de inicio de sesión.
 * Depende de: auth.js (debe cargarse primero)
 *
 * CORRECCIONES:
 *  - Redirección usa rutaPanel() y rutaInicio() dinámicos (no hardcodeados)
 *  - Protección contra doble submit
 *  - Mensaje de error accesible con aria-live
 */
'use strict';

/* Si ya hay sesión activa, redirigir de inmediato */
redirigirSiYaTieneSesion();

/* ----------------------------------------------------------------
   Referencias DOM
   ---------------------------------------------------------------- */
const formLogin   = document.getElementById('form-login');
const inputCorreo = document.getElementById('correo');
const inputPass   = document.getElementById('contrasena');
const btnToggle   = document.getElementById('toggle-pass');
const btnIngresar = document.getElementById('btn-ingresar');
const btnDemo     = document.getElementById('btn-demo');
const alertaError = document.getElementById('alerta-error');
const alertaTexto = document.getElementById('alerta-error-texto');
const enlaceRecup = document.getElementById('enlace-recuperar');

/* ----------------------------------------------------------------
   Toggle visibilidad contraseña
   ---------------------------------------------------------------- */
btnToggle.addEventListener('click', () => {
  const visible = inputPass.type === 'text';
  inputPass.type    = visible ? 'password' : 'text';
  btnToggle.textContent = visible ? '👁️' : '🙈';
  btnToggle.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
  inputPass.focus();
});

/* ----------------------------------------------------------------
   Alertas
   ---------------------------------------------------------------- */
function mostrarAlertaError(msg) {
  alertaTexto.textContent = msg;
  alertaError.classList.add('alerta-form--visible');
  alertaError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarAlerta() {
  alertaError.classList.remove('alerta-form--visible');
}

/* Limpiar al escribir */
inputCorreo.addEventListener('input', () => { mostrarErrorCampo(inputCorreo, ''); ocultarAlerta(); });
inputPass.addEventListener('input',   () => { mostrarErrorCampo(inputPass,   ''); ocultarAlerta(); });

/* ----------------------------------------------------------------
   Validación
   ---------------------------------------------------------------- */
function validar() {
  limpiarErroresFormulario(formLogin);
  ocultarAlerta();
  let ok = true;

  if (!inputCorreo.value.trim()) {
    mostrarErrorCampo(inputCorreo, 'El correo es obligatorio.'); ok = false;
  } else if (!esCorreoValido(inputCorreo.value)) {
    mostrarErrorCampo(inputCorreo, 'Ingresa un correo electrónico válido.'); ok = false;
  }

  if (!inputPass.value) {
    mostrarErrorCampo(inputPass, 'La contraseña es obligatoria.'); ok = false;
  }

  return ok;
}

/* ----------------------------------------------------------------
   Envío del formulario
   ---------------------------------------------------------------- */
formLogin.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validar()) return;

  toggleBotonCarga(btnIngresar, true, 'Ingresar');

  /* Pequeño delay para mostrar el estado de carga */
  setTimeout(() => {
    const res = iniciarSesion(inputCorreo.value.trim(), inputPass.value);

    if (!res.exito) {
      toggleBotonCarga(btnIngresar, false, 'Ingresar');
      mostrarAlertaError(res.mensaje);
      inputPass.value = '';
      inputPass.focus();
      return;
    }

    /* Login exitoso: feedback visual y redirección */
    btnIngresar.textContent     = '✅ ¡Acceso concedido!';
    btnIngresar.style.background = 'var(--color-exito)';
    btnIngresar.style.color      = '#fff';

    setTimeout(() => {
      if (res.usuario.rol === 'admin') {
        /* Admin → panel de administración */
        window.location.href = rutaPanel();
      } else {
        /* Asistente → ruta pendiente o landing */
        const pendiente = sessionStorage.getItem('jouslynia_ruta_pendiente');
        if (pendiente) {
          sessionStorage.removeItem('jouslynia_ruta_pendiente');
          window.location.href = pendiente;
        } else {
          window.location.href = rutaInicio();
        }
      }
    }, 800);
  }, 400);
});

/* ----------------------------------------------------------------
   Credenciales de demo
   ---------------------------------------------------------------- */
btnDemo.addEventListener('click', () => {
  inputCorreo.value = 'admin@cenfotec.ac.cr';
  inputPass.value   = 'admin123';
  limpiarErroresFormulario(formLogin);
  ocultarAlerta();
  mostrarToastAuth('Credenciales cargadas. Presiona "Ingresar".', 'info', 3000);
  inputPass.focus();
});

/* ----------------------------------------------------------------
   Recuperar contraseña
   ---------------------------------------------------------------- */
enlaceRecup.addEventListener('click', (e) => {
  e.preventDefault();
  mostrarToastAuth('Función de recuperación próximamente. Contacta: soporte@cenfotec.ac.cr', 'aviso', 5000);
});