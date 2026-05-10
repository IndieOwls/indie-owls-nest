import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TAG_V1 = process.env.TAG_V1 ?? 'YYYY-MM-DD'
const API_PREFIX = `api/${TAG_V1}`

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    proxy: {
      [`/api`]: {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
