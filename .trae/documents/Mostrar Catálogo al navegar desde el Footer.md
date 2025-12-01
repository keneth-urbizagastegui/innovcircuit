## Diagnóstico
- El enlace "Explorar Diseños" del footer apunta a `"/explorar"` (`frontend/src/components/Footer.jsx:26`), pero no existe una ruta para `"/explorar"` en el router (`frontend/src/App.jsx:29-36`).
- Al visitar `"/explorar"`, el `<Outlet>` del `Layout` no renderiza ninguna página y el catálogo no se muestra.

## Plan de Corrección
1. Añadir ruta alias `"/explorar"` que renderice el mismo catálogo de `HomePage`.
   - En `frontend/src/App.jsx`, crear `Route path="explorar" element={<HomePage />} />` junto al índice.
2. Opcional: Actualizar el enlace del footer para que apunte a `"/"` (home) o mantener `"/explorar"` con la nueva ruta.
   - En `frontend/src/components/Footer.jsx`, cambiar `Link to="/explorar"` por `Link to="/"` si se desea simplificar.
3. Añadir una página de "No Encontrado" para rutas inexistentes y redirigir a `"/"`.
   - Crear `NotFoundPage` simple y añadir `Route path="*" element={<NotFoundPage />} />`.

## Verificación
- Iniciar el frontend y navegar mediante el enlace del footer; comprobar que el catálogo se renderiza y las secciones (Destacados, Nuevos, Todos) aparecen.
- Validar que las llamadas a `/api/v1/disenos` funcionan o que se muestra el fallback cuando el backend no responde.

## Detalles de Implementación
- No modifica la lógica de catálogo; sólo añade rutas y (opcionalmente) ajusta el enlace.
- Mantiene la UX actual del `Layout` y la navegación por parámetros (`q`, `cat`, `group`).

¿Confirmas que proceda con esta corrección (añadir la ruta `/explorar` y opcionalmente ajustar el enlace)?