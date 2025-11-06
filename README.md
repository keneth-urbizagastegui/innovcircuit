# Proyecto: InnovCircuit

Plataforma de venta de diseños electrónicos con un frontend en React (Vite) y un backend en Spring Boot, utilizando PostgreSQL y pgAdmin administrados por Docker Compose.

## 🚀 Stack Tecnológico
- Backend: Spring Boot (Java 17), Spring Security (JWT).
- Frontend: React 19 (Vite), MUI.
- Base de Datos: PostgreSQL.
- Despliegue: Docker (Nginx, Tomcat).

## 🏛️ Arquitectura
- Proyecto Monorepo con separación `backend/` y `frontend/`.
- Backend implementa una Arquitectura en Capas (N-Capas): Controller, Service, Repository.
- Frontend es una SPA (Single Page Application) que consume la API.
- La pila completa se orquesta con `docker-compose.yml`.

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

## Despliegue Completo (Docker Compose)

1. Asegúrate de que el backend tenga un JAR construido:
   - En la carpeta `backend/` ejecuta: `mvn clean package`
   - Se generará el archivo `backend/target/innovcircuit-backend-0.0.1-SNAPSHOT.jar`
2. Desde la carpeta raíz (`/innovcircuit`), ejecuta:
   - `docker compose up --build`
3. La aplicación estará accesible en:
   - Frontend: `http://localhost:5173`
   - Backend (API): `http://localhost:8080`
   - pgAdmin: `http://localhost:8081`
4. Para apagar los contenedores:
   - `docker compose down`