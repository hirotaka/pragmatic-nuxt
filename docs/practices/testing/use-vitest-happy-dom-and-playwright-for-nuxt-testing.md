---
title: Use Vitest, happy-dom, and Playwright for Nuxt Testing
semanticId: use-vitest-happy-dom-and-playwright-for-nuxt-testing
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Use Vitest, happy-dom, and Playwright for Nuxt Testing

## Practice

Nuxt provides `@nuxt/test-utils` to support unit and end-to-end testing. It uses optional peer dependencies so the application can choose its DOM environment and test runners. The [installation guide](https://nuxt.com/docs/4.x/getting-started/testing#installation) lists happy-dom or jsdom for the DOM environment, and Vitest, Cucumber, Jest, or Playwright as E2E runners.

The selected tools are:

- **happy-dom** for the DOM environment in Nuxt runtime tests.
- **Vitest** for unit and integration tests.
- **Playwright** for E2E tests.

## Apply When

- A Nuxt application needs unit, integration, and E2E tests.
- The test setup uses `@nuxt/test-utils`.

## Do Not Apply When

- An existing test setup must retain a different DOM implementation or test runner.

## Why

Nuxt Test Utils provides Nuxt-specific setup for Vitest and integrates with Playwright. This keeps the test setup based on Nuxt's supported helpers instead of a separate, hand-written Nuxt integration.

## Implementation Guidance

- Install `@nuxt/test-utils` and the selected testing packages as development dependencies.
- Configure Nuxt runtime tests with `defineVitestProject` from `@nuxt/test-utils/config`.
- Use the Nuxt testing helpers from `@nuxt/test-utils/playwright` for Playwright E2E tests.

## Minimal Nuxt Example

Install the dependencies for Vitest and Nuxt runtime tests.

```bash
# terminal
pnpm add -D @nuxt/test-utils vitest @vue/test-utils happy-dom
```

Configure separate Vitest projects for Node and Nuxt runtime tests.

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts"],
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          environment: "nuxt",
          include: ["test/nuxt/**/*.test.ts"],
          environmentOptions: {
            nuxt: { domEnvironment: "happy-dom" },
          },
        },
      }),
    ],
  },
});
```

The `unit` project uses Node, while the `nuxt` project uses the Nuxt environment with happy-dom.

## App Examples

- [`package.json`](../../../apps/bulletproof-nuxt/package.json) declares the selected testing dependencies.
- [`vitest.config.ts`](../../../apps/bulletproof-nuxt/vitest.config.ts) configures Vitest's Node and Nuxt projects.
- [`playwright.config.ts`](../../../apps/bulletproof-nuxt/playwright.config.ts) configures Playwright E2E tests.

## Trade-offs and Limitations

happy-dom simulates a DOM rather than running tests in a real browser. happy-dom is the current default DOM environment in Nuxt Test Utils. Vitest Browser Mode offers an alternative to happy-dom, allowing component and UI tests to run in real browsers. This approach is likely to become more common as Nuxt's support develops.

## Sources

- [Nuxt Testing: Installation](https://nuxt.com/docs/4.x/getting-started/testing#installation)
- [Nuxt Testing: Nuxt Environment Options](https://nuxt.com/docs/4.x/getting-started/testing#nuxt-environment-options)
- [Nuxt Testing: Vitest Browser Mode](https://nuxt.com/docs/4.x/getting-started/testing#vitest-browser-mode)
- [Vitest: Why Browser Mode](https://vitest.dev/guide/browser/why)

## Related Practices

- [Match Data-Fetching Tests to the Behavior They Exercise](../nuxt-use-fetch/data-fetching-test-boundaries.md)
