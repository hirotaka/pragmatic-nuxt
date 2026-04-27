import { defineConfig, devices } from "@playwright/test";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";
import { fileURLToPath } from "url";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
//
const PORT = process.env.NUXT_PORT ? Number(process.env.NUXT_PORT) : 3000;

/**
 * Playwright configuration for development mode.
 * Uses external Nuxt server running via `pnpm dev`.
 *
 * Usage:
 *   pnpm test:e2e
 *   NUXT_PORT=3001 pnpm test:e2e
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<ConfigOptions>({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests simultaneously on a single worker */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: "playwright/playwright-report" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  /* Output directory for test results */
  outputDir: "./playwright/test-results",
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL(".", import.meta.url)),
      host: `http://localhost:${PORT}`,
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts$/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
