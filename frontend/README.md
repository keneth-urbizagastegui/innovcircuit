# Frontend (React + Vite)

Frontend del proyecto InnovCircuit con React 19, Vite y Tailwind CSS v4, utilizando componentes UI basados en shadcn.

## Desarrollo

- Servidor de desarrollo: `npm run dev` → `http://localhost:5173`
- Build de producción: `npm run build`
- Previsualizar build: `npm run preview`

## Tailwind CSS v4 (Migración y Uso)

Esta base está migrada a Tailwind v4. Cambios clave:

1) `src/index.css` debe importar una sola vez Tailwind v4:

```css
@import "tailwindcss";
```

2) `postcss.config.js` utiliza el preset oficial v4 (ya configurado):

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

3) No se usan los imports parciales antiguos como `@tailwind base/components/utilities` ni `@import "tailwindcss/base"`.

4) Tokens del tema (definidos en `tailwind.config.js`):
- Colores: `primary` (Tindie Green `#22c55e`), `secondary` (Tindie Orange `#f97316`), además de `muted`, `border`, `background`, `foreground`.
- Bordes: `radius` extendido (`lg`, `md`, `sm`).

## Componentes UI temáticos

Se aplicó un tema global estilo Tindie a los componentes base:

- `components/Layout.jsx`: fondo/foreground global, header primario, bordes y navegación.
- `components/ui/card.jsx`: fondo/foreground, borde, títulos y descripciones con `muted-foreground`.
- `components/ui/input.jsx`: borde, fondo y focus ring primario accesible.
- `components/ui/badge.jsx`: variantes `primary` y `secondary` más `outline`, usando tokens del tema.

Ejemplos de uso rápido:

```jsx
// Botón principal
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">Comprar</button>

// Card
<div className="bg-background text-foreground border rounded-lg shadow-sm">...</div>

// Input
<input className="border bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" />

// Badge
<span className="bg-secondary text-secondary-foreground border">Nuevo</span>
```

## Rutas y páginas

El enrutado está definido en `src/App.jsx` con rutas protegidas por rol. Páginas destacadas:
- `HomePage.jsx` y `LoginPage.jsx` usan utilidades de Tailwind y los componentes UI.

## Notas

- El servidor Vite se ha validado sin errores de PostCSS/Tailwind.
- Ante cambios de UI, verifica en el navegador y revisa la consola del terminal por errores.

## 🔑 Configurar Google Gemini para el Chatbot

El chatbot flotante puede usar **Google Gemini** si se define la variable de entorno `VITE_GOOGLE_API_KEY`. Si no está configurada, usará automáticamente la IA local del backend.

### Pasos:

1. **Obtén una API key** en [Google AI Studio](https://aistudio.google.com/app/apikey)

2. **Copia el archivo de ejemplo a `.env`**:
   ```bash
   cd frontend
   cp .env.example .env
   ```

3. **Edita `.env`** y coloca tu key:
   ```env
   VITE_GOOGLE_API_KEY=tu_api_key_aqui
   ```

4. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

### Comportamiento:

| `VITE_GOOGLE_API_KEY` | Comportamiento |
|-----------------------|----------------|
| Definida y válida | Chatbot usa Google Gemini |
| Vacía o no definida | Chatbot usa IA local (`/api/v1/ia`) |

> **Nota**: El archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio.
