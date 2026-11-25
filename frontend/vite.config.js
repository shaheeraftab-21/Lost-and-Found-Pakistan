import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const api = 'http://127.0.0.1:5000'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': api } },
})
