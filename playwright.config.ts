import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'browser.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  outputDir: './artifacts/playwright',
  reporter: [['list'], ['json', { outputFile: './artifacts/browser-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4322',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
