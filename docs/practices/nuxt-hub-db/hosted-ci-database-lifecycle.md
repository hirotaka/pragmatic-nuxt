---
title: Run CI E2E Tests Through the Real Nuxt Application
semanticId: nuxthub-hosted-ci-database-lifecycle
category: database-lifecycle
prerequisites:
  - nuxthub-runtime-schema-ownership
  - nuxthub-local-e2e-database-lifecycle
status: confirmed
---

# Run CI E2E Tests Through the Real Nuxt Application

## Practice

Run CI E2E tests through the built Nuxt application's real UI, API routes, and database. Exercise the operations being tested without replacing their responses with mocks.

Use a disposable NuxtHub SQLite database initialized from committed migrations, then start the built application and run Playwright against it.

## Apply When

- A Nuxt application uses NuxtHub, and CI needs to exercise its built UI, API routes, and database together.
- Those checks can run with a disposable SQLite database in the CI job.

## Do Not Apply When

- Unit or API integration tests provide the required confidence without running the application in a browser.
- The required checks depend on a deployed environment or database behavior that SQLite cannot reproduce.

## Why

A browser interacting with the built application exercises the UI, request handlers, and persistence together. Mocked responses can hide failures in the connections between those parts.

Mocking a journey with several data changes requires responses that stay consistent across creation, updates, and reloads. The test then has to reproduce and maintain state changes that the application already implements.

## Implementation Guidance

- Build and start the full Nuxt application, including its API routes.
- Initialize a disposable SQLite database from committed migrations and connect both the application and test-data helpers to it.
- Run Playwright against the running application and perform the tested operations through the UI without mocking their API responses.

## Minimal Nuxt Example

The Nuxt application uses a dedicated SQLite database for E2E tests. Playwright tests the built application through its real UI and API routes. The following code excerpts show the relevant settings.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  hub: {
    db: "sqlite",
    dir: process.env.NUXT_HUB_DIR || ".data",
  },
});
```

`@nuxthub/core` adds NuxtHub's database integration. `db: "sqlite"` selects SQLite. `dir` reads `NUXT_HUB_DIR`, with `.data` as the fallback directory.

```dotenv
# .env.test
NUXT_HUB_DIR=".data/e2e"
```

`NUXT_HUB_DIR=".data/e2e"` puts the test database in a separate directory. Use an empty directory for each run. Build with `pnpm exec nuxt build --dotenv .env.test`, then start the built application with `pnpm exec nuxt preview --dotenv .env.test -p 3100`. Both commands load the test environment file. NuxtHub applies the committed migrations during the build.

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";
import { fileURLToPath } from "node:url";

export default defineConfig<ConfigOptions>({
  use: {
    nuxt: {
      rootDir: fileURLToPath(new URL(".", import.meta.url)),
      host: "http://localhost:3100",
    },
  },
});
```

`rootDir` identifies the Nuxt application directory. `host` sets the application URL to `http://localhost:3100`, matching the port used by the start command. Start the application before running Playwright.

## App Examples

- [Nuxt CI workflow](../../../.github/workflows/nuxt-ci.yml) runs the database-backed E2E job on a GitHub-hosted runner.
- [E2E lifecycle scripts](../../../apps/bulletproof-nuxt/package.json) build and start the application for Playwright.
- [Nuxt configuration](../../../apps/bulletproof-nuxt/nuxt.config.ts) selects SQLite for the Node build and reads the database directory from the environment.
- [Playwright configuration](../../../apps/bulletproof-nuxt/playwright.config.ts) connects browser tests to the running Nuxt application.
- [Discussion and comment journey](../../../apps/bulletproof-nuxt/test/e2e/smoke.spec.ts) verifies saved changes across reloads.

## Trade-offs and Limitations

The Node server and local SQLite database do not reproduce Cloudflare Workers or D1 bindings. Passing these E2E tests therefore does not establish behavior that depends on those runtimes or on PostgreSQL-specific SQL.

## Sources

- [NuxtHub database migrations](https://hub.nuxt.com/docs/database/migrations)
- [Nuxt `preview` command](https://nuxt.com/docs/4.x/api/commands/preview)
- [Nuxt testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [Playwright continuous integration](https://playwright.dev/docs/ci)

## Related Practices

- [Use NuxtHub's Drizzle-Powered Database Integration](runtime-schema-ownership.md)
- [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](local-e2e-database-lifecycle.md)
- [Use Playwright Test for Nuxt E2E Testing](../testing/use-playwright-test-for-nuxt-e2e-testing.md)
- [Isolated Test Databases Initialized from Migrations](../testing/isolate-test-databases-and-initialize-them-from-migrations.md)
- [E2E Tests for Important User Journeys](../testing/center-e2e-tests-on-important-user-journeys.md)
- [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
