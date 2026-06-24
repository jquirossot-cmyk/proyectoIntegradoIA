# Jouslynia — Sistema de Gestión de Eventos

**Proyecto:** Sistema de gestión de eventos para la Universidad CENFOTEC
**Tecnologías:** HTML5, CSS3 y JavaScript puro (sin frameworks ni librerías)
**Idioma:** Todo el código y comentarios en español

---

## Estructura del proyecto

```
jouslynia-final/
├── index.html                        Landing page pública
├── tests.html                        Suite de 20 pruebas automatizadas
│
├── pages/                            Páginas internas
│   ├── login.html
│   ├── registro.html
│   ├── panel-admin.html              Dashboard principal
│   ├── gestion-eventos.html
│   ├── gestion-actividades.html
│   ├── gestion-usuarios.html
│   └── reportes.html
│
├── css/                              Hojas de estilo
│   ├── styles.css                    Variables, tokens, componentes globales
│   ├── admin.css                     Layout sidebar/topbar/tablas
│   ├── auth.css                      Login y registro
│   ├── gestion-eventos.css
│   ├── gestion-actividades.css
│   ├── gestion-usuarios.css
│   └── reportes.css
│
├── js/                               Scripts
│   ├── auth.js                       Autenticación + rutas dinámicas
│   ├── admin.js                      CRUD de eventos y actividades
│   ├── app.js                        Lógica de la landing
│   ├── sidebar.js                    Sidebar/topbar de admin
│   ├── login.js                      Controlador del login
│   ├── registro.js                   Controlador del registro
│   ├── panel-admin.js                Controlador del dashboard
│   ├── gestion-eventos.js            Controlador CRUD eventos
│   ├── gestion-actividades.js        Controlador CRUD actividades
│   ├── usuarios.js                   Funciones de datos de usuarios
│   ├── gestion-usuarios.js           Controlador CRUD usuarios
│   ├── reportes.js                   Cálculo de métricas
│   └── init-reportes.js              Inicialización de reportes
│
└── img/                              Recursos (logos, imágenes)
```

---

## Cómo ejecutar el proyecto

El proyecto **requiere un servidor HTTP local** para funcionar (los navegadores bloquean los scripts cuando se abre con `file://`).

### Opción 1: Live Server (VS Code, recomendado)

1. Instala la extensión **Live Server**
2. Abre la carpeta `jouslynia-final` en VS Code
3. Clic derecho sobre `index.html` → *Open with Live Server*

### Opción 2: Python

```bash
cd jouslynia-final
python -m http.server 5500
# Abre: http://localhost:5500
```

### Opción 3: Node.js

```bash
cd jouslynia-final
npx serve .
```

---

## Credenciales

**Administrador por defecto:**
- Correo: `admin@cenfotec.ac.cr`
- Contraseña: `admin123`

El admin se inicializa automáticamente en `localStorage` la primera vez que se abre la página.

---

## Modo de acceso libre

El proyecto está configurado en **modo de acceso libre**: cualquiera puede navegar al panel de administración sin necesidad de iniciar sesión. El login y registro siguen funcionando pero no son obligatorios.

Para activar la protección de rutas (modo producción), descomenta la llamada `protegerRutaAdmin();` al inicio de:
- `js/panel-admin.js`
- `js/gestion-eventos.js`
- `js/gestion-actividades.js`
- `js/gestion-usuarios.js`
- `js/init-reportes.js`

Y en `js/login.js` y `js/registro.js`, añade al inicio:
```js
redirigirSiYaTieneSesion();
```

---

## Suite de pruebas

Abre `tests.html` (puede ser con doble clic, es autónomo) y presiona **"Ejecutar todas las pruebas"**.

Incluye 20 casos divididos en:
- **Suite A** — Inicio de Sesión (10 casos)
- **Suite B** — Registro de Usuarios (10 casos)

---

## Paleta de colores

El proyecto usa una paleta fija de 8 colores definidos como variables CSS:

| Variable | Hex |
|---|---|
| `--color-AzulOscuro` | #164a98 |
| `--color-AzulClaro` | #006AEA |
| `--color-celesteClaro` | #9CC8FF |
| `--color-grisClaro` | #d2d2d2 |
| `--color-grisOscuro` | #7c7b75 |
| `--color-amarilloClaro` | #fff200 |
| `--color-amarilloOscuro` | #ffc63e |
| `--color-Morado` | #712c86 |

---

## Si algo no funciona

1. **Limpia el localStorage del navegador**: F12 → Application → Storage → Clear site data
2. **Recarga con Ctrl+Shift+R** para limpiar caché de scripts
3. Asegúrate de estar usando un servidor (no `file://`)

---

**Universidad CENFOTEC · Proyecto Jouslynia · 2026**
