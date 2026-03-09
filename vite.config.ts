import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path/win32'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Esto inyecta 'process.env' directamente en el bundle de JS
    'process.env': {
      LMS_NO_FANCY_ERRORS: 'true'
    },
    'process.browser': true,
  },
})
