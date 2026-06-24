/**
 * JOUSLYNIA — /js/registro.js
 * Controlador de la página de registro.
 * Depende de: auth.js
 *
 * CORRECCIONES:
 *  - Redirección a login usa rutaLogin() dinámico
 *  - Validaciones robustecidas
 */
'use strict';

/* Si ya hay sesión, redirigir */
redirigirSiYaTieneSesion();

/* ----------------------------------------------------------------
   Referencias DOM
   ---------------------------------------------------------------- */
const formReg     = document.getElementById('form-registro');
const inputNombre = document.getElementById('nombre');
const inputApell  = document.getElementById('apellido');
const inputCorreo = document.getElementById('correo');
const inputPass   = document.getElementById('contrasena');
const inputConf   = document.getElementById('confirmar');
const inputTerm   = document.getElementById('terminos');
const btnReg      = document.getElementById('btn-registrar');
const alertaGlob  = document.getElementById('alerta-global');
const alertaIcon  = document.getElementById('alerta-icono');
const alertaTxt   = document.getElementById('alerta-texto');
const medRelleno  = document.getElementById('medidor-relleno');
const medEtiq     = document.getElementById('medidor-etiqueta');

/* ----------------------------------------------------------------
   Toggles de contraseña
   ---------------------------------------------------------------- */
document.getElementById('toggle-pass1').addEventListener('click', () => {
  const v = inputPass.type === 'text';
  inputPass.type = v ? 'password' : 'text';
  document.getElementById('toggle-pass1').textContent = v ? '👁️' : '🙈';
});

document.getElementById('toggle-pass2').addEventListener('click', () => {
  const v = inputConf.type === 'text';
  inputConf.type = v ? 'password' : 'text';
  document.getElementById('toggle-pass2').textContent = v ? '👁️' : '🙈';
});

/* ----------------------------------------------------------------
   Medidor de fortaleza
   ---------------------------------------------------------------- */
inputPass.addEventListener('input', () => {
  mostrarErrorCampo(inputPass, '');
  const val = inputPass.value;

  if (!val) {
    medRelleno.style.width = '0';
    medEtiq.textContent    = '';
    return;
  }

  const r = evaluarContrasena(val);
  medRelleno.style.width      = r.porcentaje + '%';
  medRelleno.style.background = r.color;
  medEtiq.style.color         = r.color;
  medEtiq.textContent         = r.etiqueta;

  if (inputConf.value) verificarCoincidencia();
});

function verificarCoincidencia() {
  if (inputConf.value && inputPass.value !== inputConf.value) {
    mostrarErrorCampo(inputConf, 'Las contraseñas no coinciden.');
  } else {
    mostrarErrorCampo(inputConf, '');
  }
}

inputConf.addEventListener('input', verificarCoincidencia);

/* Limpiar errores al escribir */
[inputNombre, inputApell, inputCorreo].forEach(c =>
  c.addEventListener('input', () => mostrarErrorCampo(c, ''))
);

/* ----------------------------------------------------------------
   Alerta global
   ---------------------------------------------------------------- */
function mostrarAlerta(tipo, texto) {
  alertaIcon.textContent = tipo === 'exito' ? '✅' : '❌';
  alertaTxt.textContent  = texto;
  alertaGlob.className   = `alerta-form alerta-form--${tipo} alerta-form--visible`;
  alertaGlob.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function ocultarAlerta() {
  alertaGlob.classList.remove('alerta-form--visible');
}

/* ----------------------------------------------------------------
   Validación completa
   ---------------------------------------------------------------- */
function validar() {
  limpiarErroresFormulario(formReg);
  ocultarAlerta();
  let ok = true;

  if (!inputNombre.value.trim() || inputNombre.value.trim().length < 2) {
    mostrarErrorCampo(inputNombre, 'El nombre debe tener al menos 2 caracteres.'); ok = false;
  }
  if (!inputApell.value.trim() || inputApell.value.trim().length < 2) {
    mostrarErrorCampo(inputApell, 'El apellido debe tener al menos 2 caracteres.'); ok = false;
  }
  if (!inputCorreo.value.trim()) {
    mostrarErrorCampo(inputCorreo, 'El correo es obligatorio.'); ok = false;
  } else if (!esCorreoValido(inputCorreo.value)) {
    mostrarErrorCampo(inputCorreo, 'Ingresa un correo electrónico válido.'); ok = false;
  }
  if (!inputPass.value || inputPass.value.length < 6) {
    mostrarErrorCampo(inputPass, 'La contraseña debe tener al menos 6 caracteres.'); ok = false;
  }
  if (!inputConf.value) {
    mostrarErrorCampo(inputConf, 'Debes confirmar tu contraseña.'); ok = false;
  } else if (inputPass.value !== inputConf.value) {
    mostrarErrorCampo(inputConf, 'Las contraseñas no coinciden.'); ok = false;
  }
  if (!inputTerm.checked) {
    mostrarErrorCampo(inputTerm, 'Debes aceptar los términos y condiciones.'); ok = false;
  }

  return ok;
}

/* ----------------------------------------------------------------
   Envío del formulario
   ---------------------------------------------------------------- */
formReg.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validar()) return;

  toggleBotonCarga(btnReg, true, 'Crear mi cuenta');

  setTimeout(() => {
    const res = registrarUsuario({
      nombre:     inputNombre.value.trim(),
      apellido:   inputApell.value.trim(),
      correo:     inputCorreo.value.trim(),
      contrasena: inputPass.value
    });

    if (!res.exito) {
      toggleBotonCarga(btnReg, false, 'Crear mi cuenta');
      mostrarAlerta('error', res.mensaje);
      if (res.mensaje.toLowerCase().includes('correo')) {
        mostrarErrorCampo(inputCorreo, res.mensaje);
      }
      return;
    }

    /* Registro exitoso: feedback y redirección al login */
    mostrarAlerta('exito', '¡Cuenta creada exitosamente! Redirigiendo al login…');
    btnReg.textContent     = '✅ ¡Listo!';
    btnReg.style.background = 'var(--color-exito)';
    btnReg.disabled         = true;

    setTimeout(() => {
      // rutaLogin() calcula la ruta correcta desde /pages/registro.html
      window.location.href = rutaLogin();
    }, 1800);
  }, 600);
});