---
title: Isolated Test Databases Initialized from Migrations
semanticId: isolate-test-databases-and-initialize-them-from-migrations
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Isolated Test Databases Initialized from Migrations

## Practice

Database-backed API test suites use temporary SQLite databases separate from development data. E2E runs use a dedicated SQLite database shared by the preview and test-data helpers.

The database schema is initialized once during API test suite setup or E2E preparation, using SQL migration files version-controlled alongside the application source.

## Apply When

- A Nuxt application uses NuxtHub with SQLite for local database-backed API or E2E testing.

## Do Not Apply When

- The tests exercise isolated logic or component behavior without a real database.

## Why

Separate database locations keep test migrations and resets away from developer data. The application under test and its data-preparation helpers also need to connect to the same test database; otherwise they can read and change different data.

Applying version-controlled SQL migrations to a fresh database exposes missing or invalid migration steps that creating tables directly from ORM schema definitions would bypass.

## Implementation Guidance

- Each API test suite has a temporary database location. E2E uses a dedicated storage root, with the preview and data helpers configured for the same database file.
- SQL migrations initialize the database once during suite setup or E2E preparation. Cleanup leaves migration bookkeeping intact.
- API suite teardown closes its database connection and removes temporary files. In shared E2E storage, run-end teardown clears business rows after the dependent tests finish.
- Preparations run sequentially when generated output, database files, or preview ports are shared.

## Minimal Nuxt Example

With commands run from the application directory, NuxtHub uses an explicit local SQLite connection under a configurable storage root and applies migrations during the test build.

```ts
// nuxt.config.ts
import { resolve } from "node:path";

const storageRoot = resolve(process.env.NUXT_HUB_DIR || ".data");

export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  nitro: { preset: "node-server" },
  hub: {
    dir: storageRoot,
    db: {
      dialect: "sqlite",
      driver: "libsql",
      connection: { url: `file:${resolve(storageRoot, "db/sqlite.db")}` },
      applyMigrationsDuringBuild: true,
    },
  },
});
```

The database URL is an explicit local file, so it follows the selected storage root rather than an unrelated database connection from the environment. The application's version-controlled SQL migration files provide the initial schema.

The E2E environment selects a storage root separate from the default development root.

```dotenv
# .env.test
NUXT_HUB_DIR=".data/e2e"
```

E2E preparation discards this test storage root before running `pnpm exec nuxt build --dotenv .env.test`. The preview uses the same environment. A process runner stops the preview after testing; the database files remain until the next preparation discards them.

## App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) resolves NuxtHub storage from the selected environment.
- [`request.ts`](../../../apps/bulletproof-nuxt/test/support/request.ts) owns the temporary database lifecycle for API test suites.
- [`requestRuntime.ts`](../../../apps/bulletproof-nuxt/test/support/requestRuntime.ts) closes the generated database client's connection.
- [`package.json`](../../../apps/bulletproof-nuxt/package.json) owns fresh E2E preparation and preview process cleanup.
- [`.env.test`](../../../apps/bulletproof-nuxt/.env.test) selects the dedicated E2E storage root.
- [`factories.ts`](../../../apps/bulletproof-nuxt/test/e2e/support/factories.ts) creates the records used by E2E cases.
- [`database.ts`](../../../apps/bulletproof-nuxt/test/e2e/support/database.ts) provides connection checks and run-end E2E cleanup.

## Trade-offs and Limitations

Fresh databases and migrations add setup time. Reusing a migrated database reduces setup cost. API tests reset business rows between cases; E2E teardown clears them after the dependent tests finish.

Shared generated output and a fixed E2E storage root or preview port limit parallel preparation. Isolating database files alone does not isolate those other resources.

## Sources

- [NuxtHub: Database Migrations](https://hub.nuxt.com/docs/database/migrations)
- [NuxtHub: SQL Database](https://hub.nuxt.com/docs/database)
- [Nuxt: Testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [Playwright: Test Fixtures](https://playwright.dev/docs/test-fixtures)

## Related Practices

- [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](../nuxt-hub-db/local-e2e-database-lifecycle.md)
- [API Integration Tests Through the Nuxt Server](test-api-routes-through-the-nuxt-server.md)
