import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: '.', testMatch: 'memory-book.spec.ts', workers: 1, use: { baseURL:'http://127.0.0.1:4296', channel:'chrome' }, webServer: { command:'npm run preview -- --port 4296 --strictPort', url:'http://127.0.0.1:4296', reuseExistingServer:false } })
