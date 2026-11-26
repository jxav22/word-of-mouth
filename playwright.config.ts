import { defineConfig } from '@playwright/test'

const port = Number(process.env.PORT || 3000)

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run start',
    url: `http://127.0.0.1:${port}/api/health`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
