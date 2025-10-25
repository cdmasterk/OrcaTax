import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: { devSourcemap: true },
  server: { open: true, host: true, port: 5173 },
})
