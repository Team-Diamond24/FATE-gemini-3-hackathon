import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Listen on all addresses
    // Allow ngrok and external connections
    cors: true,
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  }
})
