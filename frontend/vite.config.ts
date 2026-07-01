import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Um único .env compartilhado na raiz do projeto (backend e frontend usam o mesmo arquivo,
  // tanto local quanto em produção) — sem isso o Vite só olharia dentro de frontend/.
  envDir: '../',
})
