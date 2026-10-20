import { defineConfig } from '@playwright/test';

const port = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  // Baselines are not suffixed by OS: CI (Linux) is the single source of truth for screenshots.
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}{ext}',
  use: {
    baseURL: `http://localhost:${port}`,
    // Lets local runs use a system Chromium instead of downloading Playwright's.
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  projects: [
    { name: 'mobile-360', use: { viewport: { width: 360, height: 800 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `pnpm preview --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
  },
});
