// @ts-check
import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

const AUTH_FILE = '.auth/admin-auth.json';

if (!fs.existsSync(AUTH_FILE)) {
  console.warn(
    '\n.auth/admin-auth.json not found. Run: npm run save:session\n'
  );
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
  ['html', {
      open: 'never',
      outputFolder: 'playwright-report'
  }], 
  ['json', {
      outputFile: 'test-results/results.json'
  }]
],
  use: {
    trace: 'on-first-retry',
    headless: true,
    // No storageState here; sessionStorage is injected via fixtures.
  },

  projects: [
    {
      name: 'chrome-persistent',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});

