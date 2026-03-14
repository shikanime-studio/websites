import { cloudflareTest } from '@cloudflare/vitest-pool-workers'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: './wrangler.jsonc' },
          }),
        ],
        test: {
          name: 'workers',
          include: [
            'src/**/*.{test,spec}.{ts,tsx}',
            'tests/**/*.{test,spec}.{ts,tsx}',
          ],
          exclude: [
            'src/**/*.chromium.{test,spec}.{ts,tsx}',
            'tests/**/*.chromium.{test,spec}.{ts,tsx}',
          ],
        },
      },
      {
        plugins: [react()],
        test: {
          name: 'chromium',
          include: [
            'src/**/*.chromium.{test,spec}.{ts,tsx}',
            'tests/**/*.chromium.{test,spec}.{ts,tsx}',
          ],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
