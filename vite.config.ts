import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/coffee-route-tracker/' : '/',
  test: {
    environment: 'node',
  },
})
