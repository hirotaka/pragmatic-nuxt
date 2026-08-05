---
title: Use Separate NuxtHub SQLite Lifecycles for Local and E2E
semanticId: nuxthub-local-e2e-database-lifecycle
category: database-lifecycle
prerequisites:
  - nuxthub-runtime-schema-ownership
status: confirmed
---

# Use Separate NuxtHub SQLite Lifecycles for Local and E2E

## Practice

Use fresh, identity-separated database lifecycles for Local development and production-like E2E tests.

Keep Local development on its normal NuxtHub SQLite directory and give E2E a dedicated disposable storage root. Let NuxtHub apply the committed migrations during the E2E build, then run the preview and Playwright suite against that migrated database.

Treat database preparation, application startup, browser execution, process cleanup, and storage discard as separate lifecycle outcomes. A passing browser suite is evidence for the database identity and migration path only when those stages are verified together.

## Apply When

- A Local development database should be rebuilt from committed SQLite migrations.
- E2E tests need a fresh database without changing Local developer data.
- A production-like preview should exercise the same migration authority as the Local application.
- The test harness can provide a dedicated disposable storage root and a controlled preview process.

## Use Another Practice When

- Hosted CI runner setup and artifact retention are the main concern. Use the hosted CI database lifecycle Practice.
- Cloudflare D1 binding or remote migration identity is the main concern. Use the Cloudflare D1 or deployment Practice.
- Seed data, reset commands, or demo operations are the main concern. Use the Local seed and operations Practice.
- Existing data continuity, backup, restore, recovery, transactions, or cross-dialect portability are the main concern. Use the corresponding database reliability or portability Practice.

## Why

Local and E2E need different state guarantees. Local development may retain developer data between sessions, while E2E needs a disposable database whose schema and data state are known before the suite starts.

Using separate NuxtHub storage identities prevents E2E preparation from deleting or migrating the Local database. Using the same committed migration authority for both environments keeps schema creation aligned without introducing a schema-push shortcut that the application runtime does not use.

The lifecycle also separates failures that need different responses: migration failure prevents a valid test run, preview failure prevents browser evidence, and process cleanup failure is operational evidence rather than a passing suite result.

## Implementation Guidance

- Keep Local SQLite in NuxtHub's default `.data/db` directory.
- Select a dedicated `.data/e2e` NuxtHub storage root for E2E preparation.
- Discard only the E2E storage root before each E2E preparation; do not remove the Local root as part of E2E setup.
- Keep committed files under `server/db/migrations/sqlite/` as the Local and E2E schema authority.
- Let NuxtHub apply migrations during the Local/libSQL build used for the E2E preview.
- Reuse one process lifecycle owner for preview readiness, Playwright execution, and post-run process cleanup.
- Keep Local reset scoped to the Local identity.
- Keep Local seed explicit and independent from migration, startup, and E2E preparation.
- Do not run overlapping lifecycle preparations in one checkout when generated output, the E2E root, or the preview port is shared.
- Record migration, startup, browser, process cleanup, and storage discard outcomes separately.

## Minimal Nuxt Example

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

```json
{
  "scripts": {
    "test:e2e:prepare": "rm -rf .data/e2e .nuxt && nuxt build --dotenv .env.test",
    "test:e2e:ci": "pnpm test:e2e:prepare && start-server-and-test test:e2e:preview http://localhost:3100 'NUXT_PORT=3100 pnpm test:e2e'"
  }
}
```

The example illustrates the lifecycle boundary. The exact preview command, environment selector, and process runner should follow the application and NuxtHub version being used.

## Verified App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) selects NuxtHub SQLite and resolves the database directory through `hub.dir`.
- [`package.json`](../../../apps/bulletproof-nuxt/package.json) discards `.data/e2e` before the E2E build, applies migrations through NuxtHub, and reuses `start-server-and-test` for preview and Playwright.
- [`server/db/migrations/sqlite/`](../../../apps/bulletproof-nuxt/server/db/migrations/sqlite/) is the committed SQLite migration source.
- [`e2e/`](../../../apps/bulletproof-nuxt/e2e/) contains the existing DB-backed browser journeys.

## Verified Lifecycle Evidence

| Stage | Environment and identity | Result | Boundary |
| --- | --- | --- | --- |
| Local reset | Local `.data/db` | Rebuilt from committed migrations | Does not reset E2E storage |
| E2E storage discard | Dedicated E2E `.data/e2e` | Discarded before the next E2E preparation | Separate from post-run process cleanup |
| Migration and build | E2E `.data/e2e` through NuxtHub Local/libSQL build | Committed SQLite migration applied successfully | Does not establish hosted CI or remote D1 behavior |
| Preview startup and process cleanup | Production-like preview on port 3100 | `start-server-and-test` started the preview and owned process cleanup | Process cleanup does not imply storage deletion |
| Browser suite | Same E2E preview and database identity | 26 Playwright tests passed | Does not establish data continuity or deployment readiness |

## Trade-offs and Limitations

The dedicated E2E root provides isolation, but generated Nuxt output, the fixed preview port, and the storage root are shared within a checkout. Run lifecycle preparation sequentially unless the application provides stronger isolation.

Discarding the E2E root before preparation gives each run a fresh starting point. It does not establish a policy for retaining or deleting the root after a run, and process cleanup does not imply storage cleanup.

This Practice covers fresh Local and isolated production-like E2E SQLite behavior. It does not establish hosted CI, Cloudflare D1, remote migration, deployment, old-data continuity, backup or recovery, transaction guarantees, seed portability, or PostgreSQL／PGlite／Neon behavior.

## Sources

- [NuxtHub database](https://hub.nuxt.com/docs/database)
- [NuxtHub database migrations](https://hub.nuxt.com/docs/database/migrations)
- [NuxtHub database CLI](https://hub.nuxt.com/docs/database/cli)
- [NuxtHub environments](https://hub.nuxt.com/docs/getting-started/environments)
- [Nuxt testing](https://nuxt.com/docs/getting-started/testing)
- [Playwright test runners](https://playwright.dev/docs/test-runners)

## Related Practices

- [Use NuxtHub's Drizzle-Powered Database Integration](runtime-schema-ownership.md)
- [Seed a NuxtHub Database with a Nitro Task](database-seed-task.md)
- [Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle](hosted-ci-database-lifecycle.md)
- [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
- [Deploy Nuxt Applications with Cloudflare Workers Builds](cloudflare-workers-deployment.md)
- [Use PostgreSQL with NuxtHub](postgresql-dialect-portability.md)
