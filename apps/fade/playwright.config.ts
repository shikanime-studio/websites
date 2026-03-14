import process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_MIXPANEL_TOKEN: 'test',
      VITE_MIXPANEL_API_HOST: 'https://api-eu.mixpanel.com',
    },
  },
})
