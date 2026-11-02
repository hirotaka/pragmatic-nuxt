---
title: Organize Nuxt Tests by Application and Layer Responsibility
semanticId: organize-nuxt-tests-by-application-and-layer-responsibility
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Organize Nuxt Tests by Application and Layer Responsibility

## Practice

Place tests under `test/` at the application root. Use `test/unit/` for tests in the Node environment and `test/nuxt/` for tests in the Nuxt environment. Keep end-to-end tests run with Playwright Test in `test/e2e/`.

If the application uses local layers, place tests for each layer's behavior under that layer's `test/` directory. Keep application-wide tests in the root `test/` directory.

## Apply When

- The application follows Nuxt's standard test layout.
- Test setup uses Nuxt's defaults with minimal additional configuration.

## Do Not Apply When

- Tests are placed next to source files, using suffixes instead of separate test directories.

## Why

Nuxt's standard test layout gives tests a predictable location and avoids the need for a separate directory convention for each application.

Nuxt includes the root `test/nuxt/` directory in its app TypeScript context by default. TypeScript recognizes Nuxt aliases and auto-imports there without additional test-directory configuration.

If local layers own domain behavior, placing their tests in the same layer keeps the code and tests together. Shared test support and runner configuration can remain at the application root.

## Implementation Guidance

- Use `test/unit/`, `test/nuxt/`, and `test/e2e/` at the application root, according to the test environment and runner.
- If local layers are used, place each layer's tests under its own `test/` directory with the same structure. Keep application-wide tests and shared test support at the root.
- Configure Vitest and Playwright Test to collect tests from the root and any local layers.
- Check that test imports resolve and that the test directories are included in TypeScript checking.

## Minimal Nuxt Example

The application root and any local layers each contain a `test/` directory.

```text
# Test directory layout
.
├── test/
│   ├── unit/
│   │   ├── app/
│   │   │   └── utils/
│   │   ├── server/
│   │   │   ├── api/
│   │   │   └── utils/
│   │   └── shared/
│   │       └── utils/
│   ├── nuxt/
│   │   └── app/
│   │       ├── components/
│   │       ├── composables/
│   │       └── pages/
│   └── e2e/
└── layers/
    └── <name>/
        └── test/
            ├── unit/
            │   ├── server/
            │   │   ├── api/
            │   │   ├── repository/
            │   │   └── utils/
            │   └── shared/
            │       └── utils/
            ├── nuxt/
            │   └── app/
            │       ├── composables/
            │       └── pages/
            └── e2e/
```

The `unit/` and `nuxt/` directories mirror the source paths under test.

Vitest collects Node and Nuxt tests from the application root and local layers.

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
          include: [
            "test/unit/**/*.{test,spec}.ts",
            "layers/*/test/unit/**/*.{test,spec}.ts",
          ],
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          environment: "nuxt",
          globals: true,
          include: [
            "test/nuxt/**/*.{test,spec}.ts",
            "layers/*/test/nuxt/**/*.{test,spec}.ts",
          ],
        },
      }),
    ],
  },
});
```

The `include` patterns assign files to the Node or Nuxt project.

Playwright Test collects E2E specs from the application root and local layers.

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "**/test/e2e/**/*.{test,spec}.ts",
});
```

`testDir` sets the search root, and `testMatch` matches E2E specs in the root and layer test directories.

Nuxt's TypeScript configuration includes additional test directories and the Playwright configuration file.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  typescript: {
    tsConfig: {
      include: [
        "../test/unit/**/*",
        "../test/e2e/**/*",
        "../layers/*/test/**/*",
      ],
    },
    nodeTsConfig: {
      include: ["../playwright.config.ts"],
    },
  },
});
```

Nuxt includes root `test/nuxt/` in the app TypeScript context by default. The `include` paths are relative to `.nuxt/`; they add the other test directories and `playwright.config.ts` to type checking without changing test execution environments.

## App Examples

- [`vitest.config.ts`](../../../apps/bulletproof-nuxt/vitest.config.ts) collects root and layer tests into the Node and Nuxt projects.
- [`playwright.config.ts`](../../../apps/bulletproof-nuxt/playwright.config.ts) collects root and layer E2E specs in the browser project.
- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) includes layer tests in the generated app TypeScript context.
- [`index.test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/nuxt/app/pages/app/discussions/index.test.ts) keeps a page test in the layer responsible for that page.

## Trade-offs and Limitations

A dedicated `test/` directory gives tests a predictable location, but places them farther from the source files than co-location does. Working on code and its tests involves moving between the source and test directories.

Keeping tests with their owner makes related tests easier to find, but spreads the suite across more directories. Changes that affect several domains may require visiting more than one owner's test directory.

## Sources

- [Nuxt Testing: Organizing Your Tests](https://nuxt.com/docs/4.x/getting-started/testing#organizing-your-tests)
- [Nuxt Testing: TypeScript Support in Tests](https://nuxt.com/docs/4.x/getting-started/testing#typescript-support-in-tests)
- [Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers)
- [Nuxt layers/ Directory](https://nuxt.com/docs/4.x/directory-structure/layers)
- [Playwright TestConfig: testMatch](https://playwright.dev/docs/api/class-testconfig#test-config-test-match)

## Related Practices

- [Organize Local Nuxt Layers by Application Responsibility](../nuxt/organize-local-nuxt-layers-by-application-responsibility.md)
- [Use Vitest, happy-dom, and Playwright for Nuxt Testing](use-vitest-happy-dom-and-playwright-for-nuxt-testing.md)
- [Use Playwright Test for Nuxt E2E Testing](use-playwright-test-for-nuxt-e2e-testing.md)
