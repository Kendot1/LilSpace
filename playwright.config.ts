import { defineConfig } from '@playwright/test'
const port = 4191
const baseURL = `http://127.0.0.1:${port}`
export default defineConfig({ testDir: './tests/e2e', workers: 1, use: { baseURL, channel: 'chrome' }, webServer: { command: `npm run preview -- --port ${port} --strictPort`, url: baseURL, reuseExistingServer: false } })
