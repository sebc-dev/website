import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Global setup: Initialize D1 database before tests */
  globalSetup: './tests/global-setup',
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://127.0.0.1:8788',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    /**
     * E2E Tests with Cloudflare Workers runtime (Phase 1)
     *
     * Configuration for running tests against wrangler dev (workerd runtime).
     * IPv4 (127.0.0.1) is forced to avoid Node.js 20+ localhost resolution race conditions
     * where the system may resolve localhost to IPv6 (::1) instead of IPv4 (127.0.0.1),
     * causing connection failures.
     *
     * Server: wrangler dev with OpenNext adapter
     * URL: http://127.0.0.1:8788 (IPv4, not localhost or ::1)
     * Timeout: 240 seconds to account for OpenNext cold start + wrangler dev startup
     *          (empirically determined: build + server startup takes ~120-140 seconds)
     *
     * See: /docs/specs/epics/epic_1/refactoring_e2e/STORY_E2E_CLOUDFLARE_REFACTOR.md
     */
    command: 'pnpm preview',
    url: 'http://127.0.0.1:8788',
    reuseExistingServer: false,
    timeout: 300 * 1000, // 300 seconds for OpenNext cold start + wrangler startup
  },
});
