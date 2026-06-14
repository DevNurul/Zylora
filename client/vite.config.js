import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        secure:       false,
        // Bearer-token auth has no cookie concerns.
        // This proxy exists only to forward /api/* to the backend in dev
        // so the frontend and API share the same origin (no CORS preflight).
      },
    },
  },
})
