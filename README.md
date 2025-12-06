# Proyecto: InnovCircuit

Plataforma de venta de diseños electrónicos con un frontend en React (Vite) y un backend en Spring Boot, utilizando PostgreSQL y pgAdmin administrados por Docker Compose.

## 🚀 Stack Tecnológico
- Backend: Spring Boot (Java 17), Spring Security (JWT).
- Frontend: React 19 (Vite), Tailwind CSS + shadcn/ui.
- Base de Datos: PostgreSQL.
- Despliegue: Docker (Nginx, Tomcat).

## 🏛️ Arquitectura
- Proyecto Monorepo con separación `backend/` y `frontend/`.
- Backend implementa una Arquitectura en Capas (N-Capas): Controller, Service, Repository.
- Frontend es una SPA (Single Page Application) que consume la API.
- La pila completa se orquesta con `docker-compose.yml`.

## 🗂️ Estructura del Proyecto

```
innovcircuit/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/  (Spring Boot: controllers, services, repositories, config)
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Footer.jsx
│       │   ├── Layout.jsx
│       │   ├── DisenoCard.jsx
│       │   ├── DesignCard.jsx
│       │   └── ui/ (avatar, badge, button, card, dialog, input, select, textarea)
│       ├── context/ (AuthContext, CartContext, etc.)
│       ├── pages/ (HomePage, LoginPage, DashboardPage, StorePage, etc.)
│       ├── services/ (cliente/usuario/categoria/diseno/... APIs)
│       ├── theme/ (tokens y utilidades de tema si aplica)
│       ├── utils/ (helpers: cn, currency, imageUtils, etc.)
│       ├── index.css
│       └── main.jsx
├── bruno_tests/ (colecciones de pruebas de API)
├── scripts/ (PowerShell para pruebas y utilidades)
├── docker-compose.yml
└── README.md
```

## Entorno de Desarrollo
- Backend (Spring Boot): http://localhost:8080
- Frontend (React/Nginx): http://localhost:5173
- PostgreSQL (Docker): localhost:5433
- pgAdmin (Docker): http://localhost:8081

## Datos de Prueba (Sembrados Automáticamente)
La base de datos se siembra automáticamente al iniciar. La contraseña para todos los usuarios es: `password123`.
- ADMINISTRADOR: `admin@innovcircuit.com`
- PROVEEDOR: `proveedor@innovcircuit.com`
- CLIENTE: `cliente@innovcircuit.com`

Estados de Usuario:
- `ACTIVO`: usuario habilitado para operar.
- `BLOQUEADO`: usuario deshabilitado; el backend puede restringir operaciones futuras.

## Pruebas de API (Ejemplos con cURL)

### 1. Obtener Token (Login)
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@innovcircuit.com", "password": "password123"}'
```
(Guarda el "token" de la respuesta para las siguientes peticiones)

Consejo: Puedes usar los archivos Bruno en `bruno_tests/` para ejecutar estas peticiones de forma más cómoda. Reemplaza los valores `REEMPLAZAR_CON_TOKEN_ADMIN` o `REEMPLAZAR_CON_TOKEN_PROVEEDOR` por el token obtenido en la petición de login correspondiente.

### 2. Listar Categorías (Autenticado)
```bash
curl -X GET http://localhost:8080/api/v1/categorias \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 3. Crear Categoría (Rol ADMIN)
```bash
curl -X POST http://localhost:8080/api/v1/categorias \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"nombre": "Categoría Ñu", "descripcion": "Prueba con tildes y UTF-8"}'
```

### 4. Crear Categoría (Fallo de Rol)
```bash
curl -X POST http://localhost:8080/api/v1/categorias \
  -H "Authorization: Bearer TOKEN_DE_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test Fallido", "descripcion": "..."}'
```
Resultado esperado: 403 Forbidden

### 5. Crear Categoría (Fallo de Validación)
```bash
curl -X POST http://localhost:8080/api/v1/categorias \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "", "descripcion": "..."}'
```
Resultado esperado: 400 Bad Request `{"nombre":"El nombre no puede estar vacío"}`

### 6. Gestión de Usuarios (ADMINISTRADOR)

Listar todos los usuarios (clientes y proveedores):
```bash
curl -X GET http://localhost:8080/api/v1/admin/usuarios \
  -H "Authorization: Bearer TOKEN_DE_ADMIN"
```

Actualizar estado de un usuario (ACTIVO/BLOQUEADO):
```bash
curl -X PUT http://localhost:8080/api/v1/admin/usuarios/ID_USUARIO/estado \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"estado": "BLOQUEADO"}'
```

Eliminar un usuario:
```bash
curl -X DELETE http://localhost:8080/api/v1/admin/usuarios/ID_USUARIO \
  -H "Authorization: Bearer TOKEN_DE_ADMIN"
```

Notas:
- Requiere rol ADMINISTRADOR.
- ID_USUARIO debe ser un ID válido existente.

### 7. Configuración (ADMINISTRADOR)

Listar configuraciones:
```bash
curl -X GET http://localhost:8080/api/v1/admin/configuracion \
  -H "Authorization: Bearer TOKEN_DE_ADMIN"
```

Actualizar/crear una configuración (por clave):
```bash
curl -X PUT http://localhost:8080/api/v1/admin/configuracion/TASA_COMISION \
  -H "Authorization: Bearer TOKEN_DE_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"valor":"0.25"}'
```

Notas:
- La clave `TASA_COMISION` controla la tasa de comisión de la plataforma (por ejemplo, `0.20` para 20%).
- Las compras realizadas después del cambio utilizarán la nueva tasa.

### 8. Reportes (ADMINISTRADOR y CLIENTE)

Reporte de Ventas (Admin):
```bash
curl -X GET http://localhost:8080/api/v1/admin/reporte/ventas \
  -H "Authorization: Bearer TOKEN_DE_ADMIN"
```
Respuesta: `ReporteVentasDTO` con totales y lista de ventas detalladas.

Reporte de Mis Compras (Cliente):
```bash
curl -X GET http://localhost:8080/api/v1/usuario/reporte/mis-compras \
  -H "Authorization: Bearer TOKEN_DE_CLIENTE"
```
Respuesta: `List<VentaResponseDTO>` con detalle por compra (líneas, comisiones y montos proveedor).

## UI/UX – Diálogos y Modales (Frontend)
- Confirmaciones: Se reemplazó `window.confirm` por un componente reutilizable `ConfirmDialog` (componente propio con Tailwind + shadcn/ui).
  - Uso: `import ConfirmDialog from './src/components/ConfirmDialog';`
  - Props: `open`, `title`, `message`, `confirmText`, `cancelText`, `onConfirm`, `onCancel`.
  - Implementado en: `frontend/src/pages/AdminUsuariosPage.jsx` (Eliminar Usuario) y `frontend/src/pages/DashboardPage.jsx` (Eliminar Diseño).
- Reportes JSON: Se reemplazó `window.alert(JSON.stringify(...))` por modales que muestran el JSON formateado con `<pre>` usando componentes shadcn/ui.
  - Implementado en: `frontend/src/pages/AdminDashboardPage.jsx` (Reporte de Ventas) y `frontend/src/pages/DashboardPage.jsx` (Reporte de Mis Compras).
  - Beneficios: Mejor legibilidad, accesibilidad y consistencia visual con Tailwind/shadcn.

### 7. Gestión de Diseños (PROVEEDOR)

Editar un diseño propio:
```bash
curl -X PUT http://localhost:8080/api/v1/disenos/ID_DISENO \
  -H "Authorization: Bearer TOKEN_DE_PROVEEDOR" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo título",
    "categoriaId": 1,
    "precio": 25.5,
    "gratuito": false,
    "descripcion": "Descripción actualizada"
  }'
```

Eliminar un diseño propio:
```bash
curl -X DELETE http://localhost:8080/api/v1/disenos/ID_DISENO \
  -H "Authorization: Bearer TOKEN_DE_PROVEEDOR"
```

Notas:
- Requiere rol PROVEEDOR y propiedad del diseño. Si el diseño no pertenece al proveedor autenticado, la API devuelve 403 Forbidden.
- ID_DISENO debe referirse a un diseño existente del proveedor.

## Frontend – Tema global Tindie y Tailwind v4

Se utiliza Tailwind v4 y una paleta oscura (lima/verde) aplicada actualmente solo al Encabezado y al Footer. El resto de componentes se mantienen con los estilos por defecto del tema para evitar cambios globales no deseados.

- Tailwind v4: `src/index.css` usa `@import "tailwindcss";` con `postcss.config.js` (tailwindcss + autoprefixer).
- Paleta Innov en `:root` (CSS variables HSL) para colores base; se evita `@apply` en estilos globales para compatibilidad.
- Encabezado y Footer: colores oscuros (`#1A202C`/`#2D3748`) con acentos lima/verde (`#C7F782`/`#48BB78`).
- Componentes base revertidos: `button`, `card`, `badge` usan los tokens originales (`primary`, `secondary`, `background`, etc.).
- Proxy Vite: `vite.config.js` enruta `/api` y `/uploads` al backend `http://localhost:8080`.
- Nota HMR: el aviso `net::ERR_ABORTED /src/index.css` puede aparecer durante recargas; es benigno.

Referencias prácticas:
- Desarrollo: `cd frontend && npm install && npm run dev` → `http://localhost:5173`
- Build: `npm run build` y preview con `npm run preview`

## 🔧 Guía de Inicio Rápido

Requisitos:
- Node.js 18+ y npm
- Java 17+ (JDK)
- Docker (opcional para despliegue completo)

Desarrollo local:
1) Backend
   - `cd backend`
   - Ejecuta: `mvn spring-boot:run`
   - Alternativa: `mvn clean package` y luego `java -jar target/innovcircuit-backend-0.0.1-SNAPSHOT.jar`
2) Frontend
   - `cd frontend`
   - `npm install`
   - `npm run dev` → abre `http://localhost:5173/`

Endpoints útiles:
- API base: `http://localhost:8080/api/v1`
- `vite.config.js` define proxy para `/api` y `/uploads`.

## 🧪 Pruebas y Scripts

- Bruno (API): Colecciones en `bruno_tests/` para login, categorías, reportes y compras. Útil para validar roles (ADMIN/PROVEEDOR/CLIENTE).
- Scripts PowerShell (`scripts/`):
  - `test_login_via_vite.ps1`, `test_list_disenos.ps1`, `test_upload_diseno_local.ps1`, etc.
  - Ejecutar desde Windows PowerShell dentro del proyecto raíz.

## 🔗 Rutas y Endpoints (Resumen)

- Autenticación
  - `POST /api/v1/auth/login` (público): inicia sesión y devuelve JWT.

- Categorías
  - `GET /api/v1/categorias` (autenticado): lista de categorías.
  - `POST /api/v1/categorias` (ADMIN): crea una nueva categoría.

- Usuarios (ADMIN)
  - `GET /api/v1/admin/usuarios` (ADMIN): lista usuarios (clientes y proveedores).
  - `POST /api/v1/admin/usuarios` (ADMIN): crea usuario CLIENTE o PROVEEDOR.
  - `PUT /api/v1/admin/usuarios/{id}` (ADMIN): actualiza nombre/email/estado de un usuario.
  - `PUT /api/v1/admin/usuarios/{id}/estado` (ADMIN): actualiza estado `ACTIVO`/`BLOQUEADO`.
  - `DELETE /api/v1/admin/usuarios/{id}` (ADMIN): elimina un usuario.

- Configuración (ADMIN)
  - `GET /api/v1/admin/configuracion` (ADMIN): lista configuraciones.
  - `PUT /api/v1/admin/configuracion/{clave}` (ADMIN): crea/actualiza configuración, p.ej. `TASA_COMISION`.

- Reportes
  - `GET /api/v1/admin/reporte/ventas` (ADMIN): totales y ventas detalladas.
  - `GET /api/v1/usuario/reporte/mis-compras` (CLIENTE): detalle de compras del usuario.

- Diseños (Proveedor)
  - `PUT /api/v1/disenos/{id}` (PROVEEDOR): edita un diseño propio.
  - `DELETE /api/v1/disenos/{id}` (PROVEEDOR): elimina un diseño propio.

- Diseños (Público/Autenticado)
  - `GET /api/v1/disenos` (autenticado vía proxy Vite): lista de diseños aprobados.
  - `GET /api/v1/disenos/{id}` (público): detalle de un diseño específico.

- Ventas/Compras (Cliente)
  - `POST /api/v1/ventas/comprar` (CLIENTE): compra de uno o varios diseños.
    - Body: `{ "disenoIds": [ID, ...] }`
    - Nota: la API rechaza compras de diseños en estado `PENDIENTE`.

Notas:
- Este resumen no es exhaustivo; para más ejemplos consulta `bruno_tests/`.
- Todas las rutas protegidas requieren `Authorization: Bearer <TOKEN>`.

## 🧭 Arquitectura (Diagrama Texto)

```
           ┌───────────────────────────┐
           │        Frontend (SPA)     │
           │  React + Vite + Tailwind  │
           └─────────────┬─────────────┘
                         │ HTTP (Proxy /api, /uploads)
                 ┌───────▼────────┐
                 │   Nginx (Dev)  │
                 └───────┬────────┘
                         │
                 ┌───────▼──────────────┐
                 │   Backend (API)      │
                 │ Spring Boot + JWT    │
                 └───────┬──────────────┘
                         │ JDBC
         ┌───────────────▼──────────────┐
         │       PostgreSQL (DB)        │
         └───────────────┬──────────────┘
                         │
                ┌────────▼────────┐
                │    pgAdmin      │
                └─────────────────┘

Flujos clave:
- Login → `POST /api/v1/auth/login` → JWT.
- SPA consume API → headers `Authorization: Bearer <JWT>`.
- Roles (ADMIN/PROVEEDOR/CLIENTE) controlan acceso a endpoints.
```

## 📦 Ejemplos cURL – Diseños y Compras

### Listar Diseños (aprobados)
```bash
curl -X GET http://localhost:8080/api/v1/disenos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Obtener Diseño por ID (público)
```bash
curl -X GET http://localhost:8080/api/v1/disenos/ID_DISENO
```

### Comprar Diseños (éxito)
```bash
curl -X POST http://localhost:8080/api/v1/ventas/comprar \
  -H "Authorization: Bearer TOKEN_DE_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{
    "disenoIds": [2]
  }'
```

### Comprar Diseño en estado PENDIENTE (fallo esperado)
```bash
curl -X POST http://localhost:8080/api/v1/ventas/comprar \
  -H "Authorization: Bearer TOKEN_DE_CLIENTE" \
  -H "Content-Type: application/json" \
  -d '{
    "disenoIds": [1]
  }'
```
Resultado esperado: error por validación de estado (el diseño no está aprobado).

## 📦 Despliegue Completo con Docker Compose

### Pre-requisitos
- Docker y Docker Compose instalados
- No se requiere Java ni Node.js localmente (Docker los incluye)

### Pasos de Despliegue

1. **Construir el JAR del backend** (si no existe o hay cambios):
   ```bash
   cd backend
   mvn clean package -DskipTests
   cd ..
   ```

2. **Levantar todos los servicios**:
   ```bash
   docker compose up --build
   ```

3. **URLs de acceso**:
   | Servicio | URL |
   |----------|-----|
   | Frontend | http://localhost:5173 |
   | API Backend | http://localhost:8080 |
   | pgAdmin | http://localhost:8081 |
   | PostgreSQL | localhost:5433 |

4. **Apagar los contenedores**:
   ```bash
   docker compose down
   ```

> **Nota sobre credenciales**: El archivo `.env.docker.example` contiene las credenciales de demo. Para producción, copia a `.env` y ajusta los valores.

---

## 📚 Funcionalidades Clave

### Catálogo Público
- Navegación de diseños electrónicos con filtros por categoría
- Búsqueda por nombre y descripción
- Imágenes inteligentes: si no hay imagen subida, se muestra una imagen de stock coherente con la categoría/keywords
- Detalles de diseño con galería de imágenes y reseñas

### Carrito de Compras
- Visitantes pueden agregar diseños al carrito
- El carrito persiste en la sesión
- Se requiere login para completar la compra

### Perfil CLIENTE
- Ver y actualizar datos de perfil
- Historial de compras con reporte visual amigable
- Solicitar impresión física de diseños (PCB printing)
- Crear reclamos sobre pedidos
- Sistema de reseñas y calificaciones

### Perfil PROVEEDOR
- Dashboard con estadísticas de ventas y descargas
- **"Mis Diseños"** con paginación (10 por página)
- Subir nuevos diseños con múltiples imágenes
- Editar y eliminar diseños propios
- Solicitar retiros de saldo acumulado
- Responder a reseñas de clientes

### Perfil ADMINISTRADOR
- **Gestión de usuarios**: crear, editar, bloquear/activar, eliminar
- **Curaduría de diseños**: aprobar, rechazar, destacar
- **Lista de diseños aprobados** con paginación
- **Reportes de ventas** con resumen visual (totales, gráficos, no solo JSON)
- Configuración de tasas de comisión
- Gestión de solicitudes de retiro
- Gestión de reclamos

### UI/UX Mejorada
- Botones con alto contraste y bordes visibles
- Focus ring con color primario para accesibilidad
- Modales para confirmaciones (no `window.confirm`)
- Reportes en modales formateados (no `alert(JSON)`)
- Componentes shadcn/ui + Tailwind CSS v4

### 🖼️ Imágenes Sugeridas (Unsplash)

La funcionalidad **"Buscar imagen sugerida"** permite generar automáticamente imágenes para los diseños usando la API de Unsplash.

**Configuración:**

1. Obtén una Access Key gratuita en https://unsplash.com/developers
2. Exporta la variable de entorno antes de iniciar el backend:

   **En desarrollo (sin Docker):**
   ```bash
   export UNSPLASH_ACCESS_KEY=tu_access_key_aqui
   mvn spring-boot:run
   ```

   **Con Docker Compose:**
   ```bash
   export UNSPLASH_ACCESS_KEY=tu_access_key_aqui
   docker compose up --build
   ```

3. En Windows PowerShell:
   ```powershell
   $env:UNSPLASH_ACCESS_KEY="tu_access_key_aqui"
   mvn spring-boot:run
   ```

**Comportamiento:**
- Si la variable NO está configurada, el botón mostrará un mensaje de error amigable.
- Si está configurada, buscará imágenes relacionadas con el nombre y categoría del diseño.

---

## 🧪 Comprobación Rápida

### Login por Rol
1. Ir a http://localhost:5173
2. Click en "Iniciar Sesión"
3. Usar credenciales de prueba (password: `password123`):
   - Admin: `admin@innovcircuit.com`
   - Proveedor: `proveedor@innovcircuit.com`
   - Cliente: `cliente@innovcircuit.com`

### Compra de Prueba (Cliente)
1. Login como cliente
2. Navegar al catálogo y agregar un diseño al carrito
3. Ir al carrito y completar la compra
4. Ver el historial en Dashboard → Mis Compras

### Publicar Diseño (Proveedor)
1. Login como proveedor
2. Dashboard → "Subir Diseño"
3. Completar formulario con nombre, categoría, precio e imagen
4. El diseño queda en estado PENDIENTE hasta aprobación del admin

### Ver Reporte de Ventas (Admin)
1. Login como admin
2. Dashboard → "Ver Reporte de Ventas"
3. Modal muestra resumen con totales y detalles

---

## 🐳 Arquitectura Docker

```
┌─────────────────────────────────────────────────────────┐
│                   docker-compose.yml                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   frontend   │    │   backend    │    │    db     │ │
│  │   (Nginx)    │───▶│ (Spring Boot)│───▶│(Postgres) │ │
│  │  :5173→:80   │    │   :8080      │    │ :5433→5432│ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                   │                   │       │
│         └───────────────────┴───────────────────┘       │
│                    innovcircuit-net                      │
│                                                          │
│  ┌──────────────┐                                       │
│  │   pgadmin    │  (Administración DB)                  │
│  │   :8081→:80  │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### Servicios
| Servicio | Puerto Externo | Puerto Interno | Descripción |
|----------|----------------|----------------|-------------|
| frontend | 5173 | 80 | SPA React servida por Nginx |
| backend | 8080 | 8080 | API REST Spring Boot |
| db | 5433 | 5432 | PostgreSQL 15 |
| pgadmin | 8081 | 80 | Administrador web de PostgreSQL |

### Volúmenes
- `postgres_data`: Persistencia de la base de datos

### Red
- `innovcircuit-net`: Red bridge para comunicación entre servicios