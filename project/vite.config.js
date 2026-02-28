import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devApiPlugin } from './server/dev-api-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
})
