import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets VITE_BASE for that.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
