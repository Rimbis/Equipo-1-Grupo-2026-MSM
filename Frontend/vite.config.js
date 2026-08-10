import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cualquier petición a /api se redirige al puerto 5000 del backend
      '/api': 'http://localhost:5000' 
    }
  }
})