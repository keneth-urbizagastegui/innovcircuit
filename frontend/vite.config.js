import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcssPostcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcssPostcss()],
    },
  },
  // --- Desarrollo local: proxy de /api hacia backend en localhost:8080 ---
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Proxy de archivos subidos para que las imágenes funcionen en dev
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
