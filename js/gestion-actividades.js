/**
 * JOUSLYNIA — /js/gestion-actividades.js
 * Controlador de la página de gestión de actividades.
 * Depende de: auth.js + admin.js + sidebar.js
 */
'use strict';

/* Protección de ruta: solo administradores */
protegerRutaAdmin();

inyectarSidebar('actividades');
inyectarTopbar('Gestión de Actividades', 'actividades');

/* ---- Estado ---- */
let eventoTablaActivo = null;
let modoForm          = 'crear';
let idActEditar       = null;
let idActElim         = null;
let tipoSeleccionado  = '🎤';

/* ================================================================
   INICIALIZACIÓN
   ================================================================ */
function inicializar() {
  poblarSelectEventos(document.getElementById('act-eventoId'));
  poblarSelectEventos(document.getElementById('selector-evento-tabla'));

  const eventos = obtenerEventosActivos();
  if (eventos.length > 0) {
    const sel = document.getElementById('selector-evento-tabla');
    if (sel) { sel.value = eventos[0].id; cambiarEventoTabla(eventos[0].id); }
  }
}

/* ================================================================
   SELECTOR DE EVENTO (TABLA)
   ================================================================ */
function cambiarEventoTabla(eventoId) {
  eventoTablaActivo = eventoId ? parseInt(eventoId) : null;

  const infoEl     = document.getElementById('info-evento-sel');
  const infoNombre = document.getElementById('info-ev-nombre');
  const infoMeta   = document.getElementById('info-ev-meta');
  const infoEmoji  = document.getElementById('info-ev-emoji');

  if (eventoId && infoEl) {
    const e = obtenerEventoPorId(eventoId);
    if (e) {
      infoEl.style.display   = 'flex';
      infoNombre.textContent = e.nombre;
      infoMeta.textContent   = `📅 ${formatearFechaAdmin(e.fecha)} · 📍 ${e.lugar}`;
      infoEmoji.textContent  = EMOJI_CATEGORIA[e.categoria] || '📅';
    }
  } else if (infoEl) {
    infoEl.style.display = 'none';
  }

  refrescarTablaActividades();
}

/* Cambiar selector del formulario → sincroniza tabla */
function cambiarEventoFormulario(eventoId) {
  if (eventoId) {
    const sel = document.getElementById('selector-evento-tabla');
    if (sel) { sel.value = eventoId; cambiarEventoTabla(eventoId); }
  }
}

/* ================================================================
   TABLA
   ================================================================ */
function refrescarTablaActividades() {
  const tbody    = document.getElementById('tbody-actividades');
  const contador = document.getElementById('contador-actividades');
  if (!tbody) return;

  if (!eventoTablaActivo) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="tabla-vacia">
      <span class="tabla-vacia__icono">📅</span>
      <div class="tabla-vacia__titulo">Selecciona un evento</div>
    </div></td></tr>`;
    if (contador) contador.textContent = '';
    return;
  }

  const actividades = obtenerActividadesPorEvento(eventoTablaActivo);
  if (contador) contador.textContent = `${actividades.length} actividad${actividades.length!==1?'es':''}`;

  if (actividades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="tabla-vacia">
      <span class="tabla-vacia__icono">📋</span>
      <div class="tabla-vacia__titulo">Sin actividades</div>
      <p style="font-size:var(--texto-sm);margin-top:4px;">Usa el formulario para añadir la primera.</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = actividades.map(a => `
    <tr id="fila-act-${a.id}">
      <td style="font-size:1.3rem;text-align:center;">${sanitizar(a.tipo)}</td>
      <td><span class="hora-chip">🕐 ${sanitizar(a.hora)}</span></td>
      <td style="font-weight:700;font-size:var(--texto-sm);">${sanitizar(a.nombre)}</td>
      <td style="font-size:var(--texto-sm);color:var(--texto-secundario);">${sanitizar(a.ponente)}</td>
      <td><span class="duracion-chip">⏱ ${a.duracion} min</span></td>
      <td>
        <div class="celda-acciones" style="justify-content:center;">
          <button class="btn-tabla btn-tabla--editar" onclick="abrirEdicionActividad(${a.id})" title="Editar">✏️</button>
          <button class="btn-tabla btn-tabla--eliminar" onclick="pedirConfirmacionAct(${a.id})" title="Eliminar">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ================================================================
   SELECTOR DE TIPO
   ================================================================ */
function seleccionarTipo(btnEl) {
  document.querySelectorAll('.tipo-btn').forEach(b => b.classList.remove('tipo-btn--activo'));
  btnEl.classList.add('tipo-btn--activo');
  tipoSeleccionado = btnEl.dataset.tipo;
  document.getElementById('act-tipo').value = tipoSeleccionado;
}

document.querySelectorAll('.tipo-btn').forEach(btn => {
  btn.addEventListener('click', () => seleccionarTipo(btn));
});

/* ================================================================
   MODO EDICIÓN
   ================================================================ */
function abrirEdicionActividad(id) {
  const todas = obtenerTodasActividades();
  const act   = todas.find(a => a.id === parseInt(id));
  if (!act) return;

  modoForm = 'editar'; idActEditar = id;
  document.getElementById('form-header-titulo').textContent = '✏️ Editar actividad';
  document.getElementById('form-header-sub').textContent    = `Editando: ${act.nombre}`;
  document.getElementById('btn-guardar-act').textContent    = 'Guardar cambios';
  document.getElementById('btn-cancelar-edicion').style.display = 'inline-flex';

  document.getElementById('act-id').value       = act.id;
  document.getElementById('act-eventoId').value = act.eventoId;
  document.getElementById('act-nombre').value   = act.nombre;
  document.getElementById('act-hora').value     = act.hora;
  document.getElementById('act-duracion').value = act.duracion;
  document.getElementById('act-ponente').value  = act.ponente !== '—' ? act.ponente : '';

  tipoSeleccionado = act.tipo;
  document.getElementById('act-tipo').value = tipoSeleccionado;
  document.querySelectorAll('.tipo-btn').forEach(b => b.classList.toggle('tipo-btn--activo', b.dataset.tipo === tipoSeleccionado));

  if (typeof limpiarErroresFormulario === 'function') limpiarErroresFormulario(document.getElementById('form-actividad'));
  ocultarAlertaForm();

  document.querySelector('.panel-formulario')?.scrollIntoView({ behavior:'smooth', block:'start' });
  document.getElementById('act-nombre').focus();
}

function cancelarEdicionActividad() { resetForm(); }

function resetForm() {
  modoForm = 'crear'; idActEditar = null;
  document.getElementById('form-header-titulo').textContent = '➕ Nueva actividad';
  document.getElementById('form-header-sub').textContent    = 'Añade una actividad a la agenda';
  document.getElementById('btn-guardar-act').textContent    = 'Añadir actividad';
  document.getElementById('btn-cancelar-edicion').style.display = 'none';
  document.getElementById('form-actividad').reset();
  document.getElementById('act-id').value   = '';
  document.getElementById('act-tipo').value = '🎤';
  document.querySelectorAll('.tipo-btn').forEach((b,i) => b.classList.toggle('tipo-btn--activo', i===0));
  tipoSeleccionado = '🎤';
  if (typeof limpiarErroresFormulario === 'function') limpiarErroresFormulario(document.getElementById('form-actividad'));
  ocultarAlertaForm();
  if (eventoTablaActivo) document.getElementById('act-eventoId').value = eventoTablaActivo;
}

/* ================================================================
   ALERTAS
   ================================================================ */
function mostrarAlertaForm(txt) {
  document.getElementById('form-alerta-texto').textContent = txt;
  document.getElementById('form-alerta').classList.add('form-alerta--visible');
}

function ocultarAlertaForm() {
  document.getElementById('form-alerta')?.classList.remove('form-alerta--visible');
}

/* ================================================================
   ENVÍO DEL FORMULARIO
   ================================================================ */
document.getElementById('form-actividad').addEventListener('submit', e => {
  e.preventDefault();
  ocultarAlertaForm();

  const datos = {
    eventoId: document.getElementById('act-eventoId').value,
    nombre:   document.getElementById('act-nombre').value,
    hora:     document.getElementById('act-hora').value,
    duracion: document.getElementById('act-duracion').value,
    ponente:  document.getElementById('act-ponente').value,
    tipo:     document.getElementById('act-tipo').value || '📋'
  };

  const errores = validarDatosActividad(datos);
  if (errores) {
    mostrarErroresEnFormulario(document.getElementById('form-actividad'), errores);
    mostrarAlertaForm(Object.values(errores)[0]);
    return;
  }

  const btn = document.getElementById('btn-guardar-act');
  const txt = btn.textContent;
  if (typeof toggleBotonCarga === 'function') toggleBotonCarga(btn, true, txt);

  setTimeout(() => {
    const res = modoForm === 'crear' ? crearActividad(datos) : editarActividad(idActEditar, datos);
    if (typeof toggleBotonCarga === 'function') toggleBotonCarga(btn, false, txt);

    if (res.exito) {
      const eid = parseInt(datos.eventoId);
      if (eventoTablaActivo !== eid) {
        eventoTablaActivo = eid;
        const sel = document.getElementById('selector-evento-tabla');
        if (sel) { sel.value = eid; cambiarEventoTabla(eid); }
      } else {
        refrescarTablaActividades();
      }
      resetForm();
      mostrarToastAuth(res.mensaje,'exito');
    } else {
      mostrarAlertaForm(res.mensaje);
      mostrarToastAuth(res.mensaje,'error');
    }
  }, 300);
});

/* ================================================================
   ELIMINAR ACTIVIDAD
   ================================================================ */
function pedirConfirmacionAct(id) {
  const act = obtenerTodasActividades().find(a => a.id === parseInt(id));
  if (!act) return;
  idActElim = id;
  document.getElementById('confirmar-act-texto').textContent = `Estás a punto de eliminar "${act.nombre}".`;
  document.getElementById('modal-confirmar-act').classList.add('modal-fondo--visible');
  document.body.style.overflow = 'hidden';
}

document.getElementById('btn-confirmar-eliminar-act').addEventListener('click', () => {
  if (!idActElim) return;
  const res = eliminarActividad(idActElim);
  cerrarConfirmarAct();
  if (res.exito) { refrescarTablaActividades(); mostrarToastAuth(res.mensaje,'exito'); }
  else mostrarToastAuth(res.mensaje,'error');
  idActElim = null;
});

function cerrarConfirmarAct() {
  document.getElementById('modal-confirmar-act').classList.remove('modal-fondo--visible');
  document.body.style.overflow = '';
  idActElim = null;
}

document.getElementById('btn-cancelar-act').addEventListener('click', cerrarConfirmarAct);
document.getElementById('btn-cerrar-confirmar-act').addEventListener('click', cerrarConfirmarAct);
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarConfirmarAct(); });

/* Selector de tabla */
document.getElementById('selector-evento-tabla').addEventListener('change', e => cambiarEventoTabla(e.target.value));
document.getElementById('act-eventoId').addEventListener('change', e => cambiarEventoFormulario(e.target.value));
document.getElementById('btn-cancelar-edicion').addEventListener('click', cancelarEdicionActividad);

/* Exponer */
window.abrirEdicionActividad  = abrirEdicionActividad;
window.pedirConfirmacionAct   = pedirConfirmacionAct;
window.seleccionarTipo        = seleccionarTipo;
window.cambiarEventoTabla     = cambiarEventoTabla;

/* Init */
inicializar();