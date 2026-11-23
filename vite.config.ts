import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: la app funciona igual en GitHub Pages (subcarpeta) que en la raíz de un dominio.
export default defineConfig({
  base: './',
  plugins: [react()],
})
