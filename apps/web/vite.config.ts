import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { lingui } from '@lingui/vite-plugin'

const TAG_V1 = process.env.TAG_V1 ?? 'YYYY-MM-DD'
const API_PREFIX = `api/${TAG_V1}`

export default defineConfig({
  plugins: [react(), lingui()],
  server: {
    proxy: {
      [`/${API_PREFIX}/graphql`]: 'http://localhost:3000',
      [`/${API_PREFIX}/auth`]: 'http://localhost:3000',
    },
  },
})
