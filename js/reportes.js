/**
 * ================================================================
 * JOUSLYNIA — Sistema de Gestión de Eventos · Universidad CENFOTEC
 * /js/reportes.js — Lógica de la página de reportes y estadísticas
 * ================================================================
 *
 * Depende de: auth.js + admin.js (deben cargarse primero)
 * Responsabilidades:
 *  1. Cálculo de todas las métricas del sistema
 *  2. Renderizado de KPI cards
 *  3. Gráficos de barras horizontales (CSS puro)
 *  4. Gráfico donut de ocupación y roles
 *  5. Distribución de eventos por mes
 *  6. Top de eventos por ocupación
 *  7. Exportar datos como CSV
 */

'use strict';

/* ================================================================
   1. CÁLCULO DE MÉTRICAS
   ================================================================ */

/**
 * Recopila todas las métricas del sistema desde localStorage.
 * @returns {Object} objeto con todas las métricas
 */
function calcularMetricas() {
  /* ---- Eventos ---- */
  const todosEventos   = (typeof obtenerTodosEventos === 'function') ? obtenerTodosEventos() : [];
  const eventosActivos = todosEventos.filter(e => e.activo);
  const hoyISO         = new Date().toISOString().split('T')[0];
  const eventosPasados = eventosActivos.filter(e => e.fecha < hoyISO);
  const eventosFuturos = eventosActivos.filter(e => e.fecha >= hoyISO);
  const destacados     = eventosActivos.filter(e => e.destacado);

  /* Cupos totales */
  const cuposTotal    = eventosActivos.reduce((s, e) => s + (e.cuposTotal || 0), 0);
  const cuposOcupados = eventosActivos.reduce((s, e) => s + (e.cuposOcupados || 0), 0);
  const cuposLibres   = cuposTotal - cuposOcupados;
  const pctOcupacion  = cuposTotal > 0 ? Math.round((cuposOcupados / cuposTotal) * 100) : 0;

  /* Distribución por categoría */
  const porCategoria = {};
  eventosActivos.forEach(e => {
    porCategoria[e.categoria] = (porCategoria[e.categoria] || 0) + 1;
  });

  /* Distribución por mes */
  const porMes = Array(12).fill(0);
  eventosActivos.forEach(e => {
    const mes = parseInt(e.fecha.split('-')[1]) - 1;
    if (mes >= 0 && mes <= 11) porMes[mes]++;
  });

  /* Top eventos por ocupación */
  const topEventos = [...eventosActivos]
    .map(e => ({
      ...e,
      pct: e.cuposTotal > 0 ? Math.round(((e.cuposOcupados || 0) / e.cuposTotal) * 100) : 0
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  /* ---- Actividades ---- */
  const actividades = (typeof obtenerTodasActividades === 'function')
    ? obtenerTodasActividades().filter(a => a.activo)
    : [];

  const actividadesPorTipo = {};
  actividades.forEach(a => {
    actividadesPorTipo[a.tipo] = (actividadesPorTipo[a.tipo] || 0) + 1;
  });

  /* ---- Usuarios ---- */
  const todosUsuarios   = JSON.parse(localStorage.getItem('jouslynia_usuarios') || '[]');
  const usuariosActivos = todosUsuarios.filter(u => u.activo !== false);
  const admins          = usuariosActivos.filter(u => u.rol === 'admin');
  const asistentes      = usuariosActivos.filter(u => u.rol === 'asistente');

  return {
    /* Eventos */
    totalEventos:    eventosActivos.length,
    eventosPasados:  eventosPasados.length,
    eventosFuturos:  eventosFuturos.length,
    destacados:      destacados.length,
    porCategoria,
    porMes,
    topEventos,

    /* Cupos */
    cuposTotal,
    cuposOcupados,
    cuposLibres,
    pctOcupacion,

    /* Actividades */
    totalActividades:  actividades.length,
    actividadesPorTipo,

    /* Usuarios */
    totalUsuarios:   todosUsuarios.length,
    usuariosActivos: usuariosActivos.length,
    admins:          admins.length,
    asistentes:      asistentes.length
  };
}

/* ================================================================
   2. RENDERIZADO DE KPI CARDS
   ================================================================ */

/**
 * Actualiza los elementos de KPI en el DOM con animación de conteo.
 * @param {Object} metricas
 */
function renderizarKPIs(metricas) {
  const kpis = [
    { id: 'kpi-eventos',    valor: metricas.totalEventos,    sufijo: '' },
    { id: 'kpi-actividades',valor: metricas.totalActividades, sufijo: '' },
    { id: 'kpi-usuarios',   valor: metricas.totalUsuarios,    sufijo: '' },
    { id: 'kpi-cupos',      valor: metricas.cuposLibres,       sufijo: '' },
    { id: 'kpi-ocupacion',  valor: metricas.pctOcupacion,     sufijo: '%' }
  ];

  kpis.forEach(({ id, valor, sufijo }) => {
    const el = document.getElementById(id);
    if (!el) return;
    animarConteo(el, valor, sufijo);
  });
}

/**
 * Anima un número desde 0 hasta el valor objetivo.
 */
function animarConteo(elemento, destino, sufijo = '') {
  let actual   = 0;
  const pasos  = 30;
  const duracion = 600;
  const intervalo = duracion / pasos;
  const incremento = destino / pasos;

  const timer = setInterval(() => {
    actual = Math.min(actual + incremento, destino);
    elemento.textContent = Math.round(actual) + sufijo;
    if (actual >= destino) clearInterval(timer);
  }, intervalo);
}

/* ================================================================
   3. GRÁFICO DE BARRAS — DISTRIBUCIÓN POR CATEGORÍA
   ================================================================ */

/**
 * Renderiza el gráfico de barras de eventos por categoría.
 * @param {Object} porCategoria — { congreso: 2, taller: 3, ... }
 */
function renderizarBarrasCategorias(porCategoria) {
  const contenedor = document.getElementById('grafico-categorias');
  if (!contenedor) return;

  const colores = {
    congreso:    '--azul-oscuro',
    taller:      '--morado',
    seminario:   '--azul-claro',
    hackathon:   '--amarillo',
    conferencia: '--exito',
    otro:        '--celeste'
  };

  const clasesBarra = {
    congreso:    'barra--azul-oscuro',
    taller:      'barra--morado',
    seminario:   'barra--azul-claro',
    hackathon:   'barra--amarillo',
    conferencia: 'barra--exito',
    otro:        'barra--celeste'
  };

  const maximo = Math.max(...Object.values(porCategoria), 1);

  const entradas = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1]);

  if (entradas.length === 0) {
    contenedor.innerHTML = '<p style="color:var(--texto-tenue);font-size:var(--texto-sm);">Sin datos disponibles.</p>';
    return;
  }

  contenedor.innerHTML = entradas.map(([cat, count]) => {
    const pct   = Math.round((count / maximo) * 100);
    const clase = clasesBarra[cat] || 'barra--azul-claro';
    const emoji = (typeof EMOJI_CATEGORIA !== 'undefined') ? (EMOJI_CATEGORIA[cat] || '📅') : '📅';

    return `
      <div class="barra-item">
        <div class="barra-item__etiqueta" title="${cat}">
          ${emoji} ${cat.charAt(0).toUpperCase() + cat.slice(1)}
        </div>
        <div class="barra-item__pista" role="progressbar"
             aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="${maximo}"
             aria-label="${count} eventos de tipo ${cat}">
          <div class="barra-item__relleno ${clase}"
               style="width:0" data-ancho="${pct}%"></div>
        </div>
        <div class="barra-item__valor">${count}</div>
      </div>
    `;
  }).join('');

  /* Animar barras tras renderizar */
  requestAnimationFrame(() => {
    contenedor.querySelectorAll('.barra-item__relleno').forEach(el => {
      el.style.width = el.dataset.ancho;
    });
  });
}

/* ================================================================
   4. GRÁFICO DE BARRAS — OCUPACIÓN POR EVENTO
   ================================================================ */

/**
 * Renderiza barras horizontales de ocupación para los top eventos.
 */
function renderizarBarrasOcupacion(topEventos) {
  const contenedor = document.getElementById('grafico-ocupacion');
  if (!contenedor) return;

  if (!topEventos || topEventos.length === 0) {
    contenedor.innerHTML = '<p style="color:var(--texto-tenue);font-size:var(--texto-sm);">Sin eventos para mostrar.</p>';
    return;
  }

  contenedor.innerHTML = topEventos.map(e => {
    const color = e.pct >= 90 ? 'barra--error'
      : e.pct >= 60 ? 'barra--amarillo'
      : 'barra--exito';

    const nombreCorto = e.nombre.length > 30
      ? e.nombre.substring(0, 30) + '…'
      : e.nombre;

    return `
      <div class="barra-item">
        <div class="barra-item__etiqueta" title="${e.nombre}">${nombreCorto}</div>
        <div class="barra-item__pista" role="progressbar"
             aria-valuenow="${e.pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="barra-item__relleno ${color}"
               style="width:0" data-ancho="${e.pct}%"></div>
        </div>
        <div class="barra-item__valor">${e.pct}%</div>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => {
    contenedor.querySelectorAll('.barra-item__relleno').forEach(el => {
      el.style.width = el.dataset.ancho;
    });
  });
}

/* ================================================================
   5. DONUT CSS — OCUPACIÓN GLOBAL
   ================================================================ */

/**
 * Actualiza el donut de ocupación global.
 */
function renderizarDonutOcupacion(pct, ocupados, libres) {
  const donut = document.getElementById('donut-ocupacion');
  if (donut) {
    donut.style.setProperty('--donut-pct', pct + '%');
    donut.style.setProperty('--donut-color', pct >= 80 ? 'var(--color-error)' : 'var(--color-AzulClaro)');
  }

  const elPct = document.getElementById('donut-ocupacion-pct');
  if (elPct) elPct.textContent = pct + '%';

  const elOcup  = document.getElementById('leyenda-ocupados');
  const elLibres = document.getElementById('leyenda-libres');
  if (elOcup)   elOcup.textContent  = ocupados.toLocaleString('es-CR') + ' cupos';
  if (elLibres) elLibres.textContent = libres.toLocaleString('es-CR') + ' cupos';
}

/**
 * Actualiza el donut de distribución de roles de usuarios.
 */
function renderizarDonutRoles(admins, asistentes) {
  const total = admins + asistentes;
  const pct   = total > 0 ? Math.round((admins / total) * 100) : 0;

  const donut = document.getElementById('donut-roles');
  if (donut) {
    donut.style.setProperty('--donut-pct', pct + '%');
    donut.style.setProperty('--donut-color', 'var(--color-Morado)');
  }

  const elPct = document.getElementById('donut-roles-pct');
  if (elPct) elPct.textContent = pct + '%';

  const elAdmins     = document.getElementById('leyenda-admins');
  const elAsistentes = document.getElementById('leyenda-asistentes');
  if (elAdmins)     elAdmins.textContent     = admins + ' admin' + (admins !== 1 ? 's' : '');
  if (elAsistentes) elAsistentes.textContent = asistentes + ' asistente' + (asistentes !== 1 ? 's' : '');
}

/* ================================================================
   6. DISTRIBUCIÓN POR MES
   ================================================================ */

const NOMBRES_MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun',
                              'Jul','Ago','Sep','Oct','Nov','Dic'];

/**
 * Renderiza el mini gráfico de barras por mes.
 */
function renderizarDistribucionMeses(porMes) {
  const contenedor = document.getElementById('grafico-meses');
  if (!contenedor) return;

  const maximo = Math.max(...porMes, 1);

  contenedor.innerHTML = porMes.map((count, idx) => {
    const altoPct = Math.round((count / maximo) * 100);
    const estaVacio = count === 0;

    return `
      <div class="mes-columna">
        <div class="mes-numero">${count > 0 ? count : ''}</div>
        <div class="mes-barra-wrap">
          <div class="mes-barra ${estaVacio ? 'mes-barra--vacio' : ''}"
               style="height:${altoPct}%"
               role="img" aria-label="${count} eventos en ${NOMBRES_MESES_CORTO[idx]}">
          </div>
        </div>
        <div class="mes-etiqueta">${NOMBRES_MESES_CORTO[idx]}</div>
      </div>
    `;
  }).join('');
}

/* ================================================================
   7. TOP EVENTOS
   ================================================================ */

/**
 * Renderiza la lista de top 5 eventos por ocupación.
 */
function renderizarTopEventos(topEventos) {
  const contenedor = document.getElementById('lista-top-eventos');
  if (!contenedor) return;

  if (!topEventos || topEventos.length === 0) {
    contenedor.innerHTML = '<p style="color:var(--texto-tenue);font-size:var(--texto-sm);">Sin datos.</p>';
    return;
  }

  contenedor.innerHTML = topEventos.map((e, idx) => {
    const colorPct = e.pct >= 90 ? 'var(--color-error)'
      : e.pct >= 60 ? 'var(--color-amarilloOscuro)'
      : 'var(--color-exito)';

    const nombreCorto = e.nombre.length > 34 ? e.nombre.substring(0, 34) + '…' : e.nombre;

    return `
      <div class="top-evento">
        <div class="top-evento__posicion top-evento__posicion--${idx + 1}">
          ${idx + 1}
        </div>
        <div class="top-evento__info">
          <div class="top-evento__nombre" title="${e.nombre}">${nombreCorto}</div>
          <div class="top-evento__meta">
            ${e.cuposOcupados || 0} / ${e.cuposTotal} cupos · ${e.categoria}
          </div>
        </div>
        <div class="top-evento__pct" style="color:${colorPct}">
          ${e.pct}%
        </div>
      </div>
    `;
  }).join('');
}

/* ================================================================
   8. EXPORTAR CSV
   ================================================================ */

/**
 * Genera y descarga un archivo CSV con los eventos del sistema.
 */
function exportarEventosCSV() {
  const eventos = (typeof obtenerTodosEventos === 'function') ? obtenerTodosEventos() : [];

  const cabeceras = ['ID','Nombre','Categoría','Fecha','Hora','Lugar',
                     'Organizador','Cupos Total','Cupos Ocupados','Destacado','Activo'];

  const filas = eventos.map(e => [
    e.id,
    `"${(e.nombre || '').replace(/"/g, '""')}"`,
    e.categoria,
    e.fecha,
    e.hora,
    `"${(e.lugar || '').replace(/"/g, '""')}"`,
    `"${(e.organizador || '').replace(/"/g, '""')}"`,
    e.cuposTotal,
    e.cuposOcupados || 0,
    e.destacado ? 'Sí' : 'No',
    e.activo ? 'Sí' : 'No'
  ].join(','));

  const csv      = [cabeceras.join(','), ...filas].join('\n');
  const blob     = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url      = URL.createObjectURL(blob);
  const enlace   = document.createElement('a');
  const fecha    = new Date().toISOString().split('T')[0];

  enlace.href     = url;
  enlace.download = `jouslynia-eventos-${fecha}.csv`;
  enlace.click();

  URL.revokeObjectURL(url);

  if (typeof mostrarToastAuth === 'function') {
    mostrarToastAuth('Archivo CSV descargado exitosamente.', 'exito');
  }
}

/**
 * Genera y descarga un CSV de usuarios.
 */
function exportarUsuariosCSV() {
  const usuarios = JSON.parse(localStorage.getItem('jouslynia_usuarios') || '[]');

  const cabeceras = ['ID','Nombre','Apellido','Correo','Rol','Activo','Fecha Registro'];

  const filas = usuarios.map(u => [
    u.id,
    `"${(u.nombre || '').replace(/"/g, '""')}"`,
    `"${(u.apellido || '').replace(/"/g, '""')}"`,
    u.correo,
    u.rol,
    u.activo !== false ? 'Sí' : 'No',
    u.fechaRegistro || '—'
  ].join(','));

  const csv    = [cabeceras.join(','), ...filas].join('\n');
  const blob   = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  const fecha  = new Date().toISOString().split('T')[0];

  enlace.href     = url;
  enlace.download = `jouslynia-usuarios-${fecha}.csv`;
  enlace.click();

  URL.revokeObjectURL(url);

  if (typeof mostrarToastAuth === 'function') {
    mostrarToastAuth('Archivo CSV de usuarios descargado.', 'exito');
  }
}

/* ================================================================
   9. FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
   ================================================================ */

/**
 * Punto de entrada de la página de reportes.
 * Calcula métricas y renderiza todos los componentes.
 */
function inicializarReportes() {
  const metricas = calcularMetricas();

  renderizarKPIs(metricas);
  renderizarBarrasCategorias(metricas.porCategoria);
  renderizarBarrasOcupacion(metricas.topEventos);
  renderizarDonutOcupacion(
    metricas.pctOcupacion,
    metricas.cuposOcupados,
    metricas.cuposLibres
  );
  renderizarDonutRoles(metricas.admins, metricas.asistentes);
  renderizarDistribucionMeses(metricas.porMes);
  renderizarTopEventos(metricas.topEventos);

  /* Actualizar timestamp del reporte */
  const elFecha = document.getElementById('reporte-timestamp');
  if (elFecha) {
    elFecha.textContent = new Date().toLocaleString('es-CR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}

/* ================================================================
   EXPONER GLOBALMENTE
   ================================================================ */
window.inicializarReportes  = inicializarReportes;
window.exportarEventosCSV   = exportarEventosCSV;
window.exportarUsuariosCSV  = exportarUsuariosCSV;
window.calcularMetricas     = calcularMetricas;
