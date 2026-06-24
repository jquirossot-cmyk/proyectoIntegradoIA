/**
 * JOUSLYNIA — /js/init-reportes.js
 * Inicializa el sidebar y los reportes de la página reportes.html.
 * Depende de: auth.js + admin.js + reportes.js + sidebar.js
 */
'use strict';

/* Protección de ruta: solo administradores */
protegerRutaAdmin();

inyectarSidebar('reportes');
inyectarTopbar('Reportes y Estadísticas', 'reportes');

document.addEventListener('DOMContentLoaded', inicializarReportes);
if (document.readyState !== 'loading') inicializarReportes();