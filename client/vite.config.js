import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tailwind CSS runs through the standard PostCSS pipeline (see
// postcss.config.js) instead of the @tailwindcss/vite plugin.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
