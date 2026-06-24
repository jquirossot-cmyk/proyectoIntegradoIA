/**
 * JOUSLYNIA — /js/gestion-eventos.js
 * Controlador de la página de gestión de eventos.
 * Depende de: auth.js + admin.js + sidebar.js
 */
'use strict';

/* Inicializar sidebar y topbar */
inyectarSidebar('eventos');
inyectarTopbar('Gestión de Eventos', 'eventos');

/* ---- Estado ---- */
let modoModal      = 'crear';
let idEventoEditar = null;
let idEventoElim   = null;
let filtroActivo   = 'todos';
let terminoBusq    = '';
let paginaActual   = 1;
const POR_PAGINA   = 8;

/* ================================================================
   TABLA
   ================================================================ */
function refrescarTabla() {
  const mostrarInactivos = document.getElementById('toggle-inactivos')?.checked || false;
  let eventos = mostrarInactivos ? obtenerTodosEventos() : obtenerEventosActivos();

  if (filtroActivo !== 'todos') eventos = eventos.filter(e => e.categoria === filtroActivo);

  if (terminoBusq.length >= 2) {
    const t = terminoBusq.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    eventos = eventos.filter(e => {
      const s = (e.nombre + e.lugar + e.organizador + e.categoria).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      return s.includes(t);
    });
  }

  const numEl = document.getElementById('num-resultados');
  if (numEl) numEl.textContent = eventos.length;

  const totalPags = Math.max(1, Math.ceil(eventos.length / POR_PAGINA));
  paginaActual    = Math.min(paginaActual, totalPags);
  const inicio    = (paginaActual - 1) * POR_PAGINA;

  renderizarFilas(eventos.slice(inicio, inicio + POR_PAGINA), eventos.length === 0);
  renderizarPaginacion(totalPags);
}

function renderizarFilas(eventos, sinResultados) {
  const tbody = document.getElementById('tbody-eventos');
  if (!tbody) return;

  if (sinResultados) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:3rem;color:var(--texto-tenue);">
          <div style="font-size:2rem;margin-bottom:.5rem;">🔍</div>
          <div style="font-weight:700;">Sin resultados</div>
          <div style="font-size:var(--texto-sm);margin-top:4px;">Prueba con otro filtro.</div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = eventos.map(e => {
    const eliminado = !e.activo;
    return `
      <tr class="${eliminado ? 'fila-eliminada' : ''}" id="fila-evento-${e.id}">
        <td style="color:var(--texto-tenue);font-size:var(--texto-xs);font-weight:700;">${e.id}</td>
        <td>
          <div class="evento-nombre-principal" title="${sanitizar(e.nombre)}">${sanitizar(e.nombre)}</div>
          <div class="evento-nombre-lugar">📍 ${sanitizar(e.lugar)}</div>
        </td>
        <td><span class="chip-categoria chip-${e.categoria}">${EMOJI_CATEGORIA[e.categoria]||'📅'} ${e.categoria}</span></td>
        <td style="white-space:nowrap;">
          <div style="font-size:var(--texto-sm);font-weight:600;">${formatearFechaAdmin(e.fecha)}</div>
          <div style="font-size:var(--texto-xs);color:var(--texto-tenue);">${sanitizar(e.hora)} hrs</div>
        </td>
        <td>${barraOcupacion(e)}</td>
        <td>${eliminado ? '<span class="estado estado--inactivo">Eliminado</span>' : badgeCupos(e)}</td>
        <td style="text-align:center;">
          <button class="btn-destacado" onclick="toggleDestacado(${e.id})"
                  aria-label="${e.destacado?'Quitar destacado':'Destacar'}"
                  ${eliminado?'disabled':''}>${e.destacado?'⭐':'☆'}</button>
        </td>
        <td>
          <div class="celda-acciones">
            ${eliminado
              ? `<button class="btn-tabla btn-tabla--ver" onclick="restaurarEventoUI(${e.id})" title="Restaurar">↩</button>`
              : `<button class="btn-tabla btn-tabla--editar" onclick="abrirModalEditar(${e.id})" title="Editar">✏️</button>
                 <button class="btn-tabla btn-tabla--eliminar" onclick="pedirConfirmacion(${e.id})" title="Eliminar">🗑️</button>`
            }
          </div>
        </td>
      </tr>`;
  }).join('');
}

function renderizarPaginacion(totalPags) {
  const cont = document.getElementById('contenedor-paginacion');
  if (!cont || totalPags <= 1) { if(cont) cont.innerHTML=''; return; }
  let html = `<button class="paginacion__btn" onclick="irPag(${paginaActual-1})" ${paginaActual===1?'disabled':''}>‹</button>`;
  for (let p=1; p<=totalPags; p++) {
    html += `<button class="paginacion__btn ${p===paginaActual?'paginacion__btn--activo':''}" onclick="irPag(${p})">${p}</button>`;
  }
  html += `<button class="paginacion__btn" onclick="irPag(${paginaActual+1})" ${paginaActual===totalPags?'disabled':''}>›</button>`;
  cont.innerHTML = html;
}

function irPag(n) { paginaActual = n; refrescarTabla(); }

/* ================================================================
   FILTROS
   ================================================================ */
document.querySelectorAll('.tabla-filtro').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabla-filtro').forEach(b => b.classList.remove('tabla-filtro--activo'));
    btn.classList.add('tabla-filtro--activo');
    filtroActivo = btn.dataset.filtro;
    paginaActual = 1;
    refrescarTabla();
  });
});

document.getElementById('toggle-inactivos').addEventListener('change', () => {
  paginaActual = 1; refrescarTabla();
});

/* ================================================================
   MODAL CREAR / EDITAR
   ================================================================ */
function abrirModalCrear() {
  modoModal = 'crear'; idEventoEditar = null;
  document.getElementById('modal-evento-titulo').textContent    = 'Nuevo evento';
  document.getElementById('modal-evento-subtitulo').textContent = 'Completa los datos del evento';
  document.getElementById('modal-icono').textContent            = '🗓️';
  document.getElementById('btn-guardar-evento').textContent     = 'Crear evento';
  document.getElementById('form-evento').reset();
  document.getElementById('ev-id').value = '';
  document.getElementById('ev-fecha').min = new Date().toISOString().split('T')[0];
  if (typeof limpiarErroresFormulario === 'function') limpiarErroresFormulario(document.getElementById('form-evento'));
  abrirModal('modal-evento');
  document.getElementById('ev-nombre').focus();
}

function abrirModalEditar(id) {
  const e = obtenerEventoPorId(id);
  if (!e) return;
  modoModal = 'editar'; idEventoEditar = id;
  document.getElementById('modal-evento-titulo').textContent    = 'Editar evento';
  document.getElementById('modal-evento-subtitulo').textContent = `Editando: ${e.nombre}`;
  document.getElementById('modal-icono').textContent            = EMOJI_CATEGORIA[e.categoria] || '🗓️';
  document.getElementById('btn-guardar-evento').textContent     = 'Guardar cambios';
  document.getElementById('ev-id').value          = e.id;
  document.getElementById('ev-nombre').value      = e.nombre;
  document.getElementById('ev-descripcion').value = e.descripcion;
  document.getElementById('ev-categoria').value   = e.categoria;
  document.getElementById('ev-cuposTotal').value  = e.cuposTotal;
  document.getElementById('ev-fecha').value       = e.fecha;
  document.getElementById('ev-hora').value        = e.hora;
  document.getElementById('ev-lugar').value       = e.lugar;
  document.getElementById('ev-organizador').value = e.organizador;
  document.getElementById('ev-destacado').checked = e.destacado;
  if (typeof limpiarErroresFormulario === 'function') limpiarErroresFormulario(document.getElementById('form-evento'));
  abrirModal('modal-evento');
  document.getElementById('ev-nombre').focus();
}

/* Envío */
document.getElementById('form-evento').addEventListener('submit', e => {
  e.preventDefault();
  const datos = {
    nombre:      document.getElementById('ev-nombre').value,
    descripcion: document.getElementById('ev-descripcion').value,
    categoria:   document.getElementById('ev-categoria').value,
    cuposTotal:  document.getElementById('ev-cuposTotal').value,
    fecha:       document.getElementById('ev-fecha').value,
    hora:        document.getElementById('ev-hora').value,
    lugar:       document.getElementById('ev-lugar').value,
    organizador: document.getElementById('ev-organizador').value,
    destacado:   document.getElementById('ev-destacado').checked
  };

  const errores = validarDatosEvento(datos);
  if (errores) { mostrarErroresEnFormulario(document.getElementById('form-evento'), errores); return; }

  const btn = document.getElementById('btn-guardar-evento');
  if (typeof toggleBotonCarga === 'function') toggleBotonCarga(btn, true, btn.textContent);

  setTimeout(() => {
    const res = modoModal === 'crear' ? crearEvento(datos) : editarEvento(idEventoEditar, datos);
    if (typeof toggleBotonCarga === 'function') toggleBotonCarga(btn, false, modoModal==='crear'?'Crear evento':'Guardar cambios');
    if (res.exito) { cerrarModal('modal-evento'); refrescarTabla(); mostrarToastAuth(res.mensaje,'exito'); }
    else mostrarToastAuth(res.mensaje,'error');
  }, 350);
});

/* Botones de cierre de modal */
document.getElementById('btn-cerrar-modal-evento').addEventListener('click', () => cerrarModal('modal-evento'));
document.getElementById('btn-cancelar-modal').addEventListener('click', () => cerrarModal('modal-evento'));

/* ================================================================
   ELIMINAR
   ================================================================ */
function pedirConfirmacion(id) {
  const e = obtenerEventoPorId(id);
  if (!e) return;
  idEventoElim = id;
  document.getElementById('confirmar-texto').textContent = `Estás a punto de eliminar "${e.nombre}".`;
  abrirModal('modal-confirmar');
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
  if (!idEventoElim) return;
  const res = eliminarEvento(idEventoElim);
  cerrarModal('modal-confirmar');
  idEventoElim = null;
  if (res.exito) { refrescarTabla(); mostrarToastAuth(res.mensaje,'exito'); }
  else mostrarToastAuth(res.mensaje,'error');
});

document.getElementById('btn-cerrar-confirmar').addEventListener('click', () => cerrarModal('modal-confirmar'));
document.getElementById('btn-cancelar-confirmar').addEventListener('click', () => cerrarModal('modal-confirmar'));

function restaurarEventoUI(id) {
  restaurarEvento(id); refrescarTabla();
  mostrarToastAuth('Evento restaurado.','exito');
}

function toggleDestacado(id) {
  const lista = obtenerTodosEventos();
  const idx   = lista.findIndex(e => e.id === parseInt(id));
  if (idx === -1) return;
  lista[idx].destacado = !lista[idx].destacado;
  localStorage.setItem('jouslynia_eventos', JSON.stringify(lista));
  refrescarTabla();
  mostrarToastAuth(lista[idx].destacado ? 'Marcado como destacado.' : 'Desmarcado.','info');
}

/* ================================================================
   MODALES GENÉRICOS
   ================================================================ */
function abrirModal(id) {
  document.getElementById(id)?.classList.add('modal-fondo--visible');
  document.body.style.overflow = 'hidden';
}

function cerrarModal(id) {
  document.getElementById(id)?.classList.remove('modal-fondo--visible');
  document.body.style.overflow = '';
}

/* Cerrar al fondo / Escape */
['modal-evento','modal-confirmar'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', e => {
    if (e.target.id === id) cerrarModal(id);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { cerrarModal('modal-evento'); cerrarModal('modal-confirmar'); }
});

/* Botón principal */
document.getElementById('btn-nuevo-evento').addEventListener('click', abrirModalCrear);

/* Exponer */
window.abrirModalEditar   = abrirModalEditar;
window.pedirConfirmacion  = pedirConfirmacion;
window.restaurarEventoUI  = restaurarEventoUI;
window.toggleDestacado    = toggleDestacado;
window.irPag              = irPag;

/* Init */
refrescarTabla();
