---
title: Use Playwright Test for Nuxt E2E Testing
semanticId: use-playwright-test-for-nuxt-e2e-testing
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Use Playwright Test for Nuxt E2E Testing

## Practice

Nuxt Test Utils supports testing a running Nuxt application in a browser with Playwright. Playwright can be used from runners such as Vitest, or through the Playwright Test runner.

Browser-based E2E tests use Playwright Test with Nuxt integration. The integration supports application setup and page navigation, including waiting for hydration.

## Apply When

- A Nuxt application needs browser-based E2E tests.
- The tests need Nuxt integration for application setup and page navigation.

## Do Not Apply When

- An existing E2E suite must retain Vitest or another test runner.
- The tests only need to mount components in Vitest Browser Mode.

## Why

Nuxt's Playwright integration provides application setup and navigation helpers. E2E tests can use these helpers instead of implementing Nuxt startup and hydration checks themselves. The same E2E tests can also be run and debugged interactively in Playwright UI Mode, with DOM snapshots for inspecting each action.

## Implementation Guidance

- Install `@playwright/test` and `@nuxt/test-utils`, and install the browsers used by the suite.
- Configure the E2E suite in `playwright.config.ts` using `ConfigOptions` from `@nuxt/test-utils/playwright`.
- Import `test` and `expect` from `@nuxt/test-utils/playwright` in Nuxt E2E specs.
- Run E2E tests with `playwright test`.
- Use `playwright test --ui` to run and debug the suite in UI Mode.
- When Vitest is also used, keep E2E specs outside its `include` globs.

## Minimal Nuxt Example

Install the runner, the Nuxt integration, and Chromium.

```bash
# terminal
pnpm add -D @playwright/test @nuxt/test-utils
pnpm exec playwright install chromium
```

Configure Playwright Test to collect E2E specs and let the Nuxt integration start the application.

```ts
// playwright.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";

export default defineConfig<ConfigOptions>({
  testDir: "./test/e2e",
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
```

The Nuxt integration uses the configured project root to prepare the application.

Write a spec using Nuxt's Playwright helpers.

```ts
// test/e2e/home.spec.ts
import { expect, test } from "@nuxt/test-utils/playwright";

test("opens the home page", async ({ page, goto }) => {
  await goto("/", { waitUntil: "hydration" });
  await expect(page).toHaveURL(/\/$/);
});
```

The `goto` helper waits for Nuxt hydration before the assertion.

Run the E2E suite.

```bash
# terminal
pnpm exec playwright test
```

Use UI Mode to inspect the same tests interactively.

```bash
# terminal
pnpm exec playwright test --ui
```

## App Examples

- [`playwright.config.ts`](../../../apps/bulletproof-nuxt/playwright.config.ts) configures the Playwright E2E suite with Nuxt integration.
- [`error.spec.ts`](../../../apps/bulletproof-nuxt/test/e2e/error.spec.ts) uses Nuxt's Playwright helpers to test error pages.
- [`package.json`](../../../apps/bulletproof-nuxt/package.json) defines the E2E CLI and UI Mode commands.

## Trade-offs and Limitations

Using Playwright Test alongside Vitest means maintaining separate runner configuration and commands. When tests connect to an existing server, its preparation, startup, readiness checks, and shutdown also need to be managed. Nuxt's testing helpers can build and start the application instead, so a separate server-management tool is not required by Playwright Test. For tests that use a database, database preparation and cleanup remain necessary with either runner. Nuxt also supports browser-based E2E tests through Vitest, so the benefits of Playwright Test's tooling and workflow should be weighed against the maintenance cost of the chosen setup.

## Sources

- [Nuxt Testing: End-to-End Testing](https://nuxt.com/docs/4.x/getting-started/testing#end-to-end-testing)
- [Nuxt Testing: Testing with Playwright Test Runner](https://nuxt.com/docs/4.x/getting-started/testing#end-to-end-testing-testing-in-a-browser-testing-with-playwright-test-runner)
- [Nuxt Testing: Test Environments](https://nuxt.com/docs/4.x/getting-started/testing#test-environments)
- [Playwright: Installation](https://playwright.dev/docs/intro)
- [Playwright: UI Mode](https://playwright.dev/docs/test-ui-mode)

## Related Practices

- [Use Vitest, happy-dom, and Playwright for Nuxt Testing](use-vitest-happy-dom-and-playwright-for-nuxt-testing.md)
