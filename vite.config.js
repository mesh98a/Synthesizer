import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Aktiviert die Verarbeitung von Vue-Komponenten in Vite
export default defineConfig({
  plugins: [vue()],
})
