import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/alertas': 'http://localhost:3000',
      '/telemetria': 'http://localhost:3000',
      '/usina': 'http://localhost:3000',
    },
  },
})