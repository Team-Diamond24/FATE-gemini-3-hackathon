import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Listen on all addresses
    // Configure HMR to work over HTTPS via ngrok
    hmr: {
      protocol: 'wss', // Use 'wss' for https tunnels
      clientPort: 443, // Use port 443 for https
    },
    // Allow ngrok and external connections
    cors: true,
    proxy: {
      // Add ngrok bypass header
      '/': {
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('ngrok-skip-browser-warning', 'true')
          })
        }
      }
    }
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  }
})
