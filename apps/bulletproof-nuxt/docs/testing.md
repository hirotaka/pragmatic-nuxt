# 🧪 Testing

Run testing commands from `apps/bulletproof-nuxt`.

## Prerequisites

- Install dependencies with pnpm.

## Test Directories

- Durable Vitest tests stay beside their Production owners in `app/**/__tests__/*.test.ts` and `layers/**/__tests__/*.test.ts`.
- Browser tests live in `e2e/*.spec.ts`. Product journeys use feature files, while direct HTTP and wire contracts live in `e2e/api-contracts.spec.ts`.
- Temporary Exploration and Characterization tests live beside their owners under `__evidence__/exploration/` and `__evidence__/characterization/`.
- Shared render helpers and data factories live under `test/`; the configured Vitest setup entry is `vitest.setup.ts`.

Temporary evidence is excluded from the default durable unit suite. An empty temporary-evidence inventory is valid; the dedicated evidence command exits nonzero when no matching files exist, so run it only while that lifecycle has an active inventory.

## Vitest Commands

| Command | Purpose |
| --- | --- |
| `pnpm test:unit` | Run the durable Vitest suite once. |
| `pnpm test` | Run Vitest in its default development mode. |
| `pnpm test:watch` | Run the durable suite in watch mode. |
| `pnpm test:ui` | Open the Vitest UI. |
| `pnpm test:evidence:exploration` | Run a non-empty Exploration inventory explicitly. |
| `pnpm test:evidence:characterization` | Run a non-empty Characterization inventory explicitly. |

## Database-Backed E2E

The documented local and E2E lifecycle uses NuxtHub's committed migrations. E2E preparation removes only the dedicated `.data/e2e` database, lets NuxtHub apply migrations during the build, then uses `start-server-and-test` to manage preview and Playwright.

Prepare a fresh migration-only database characterization:

```bash
pnpm test:e2e:prepare
```

Run the production-like local E2E lifecycle:

```bash
pnpm test:e2e:ci
```

The lifecycle does not use the developer's default `.data/db/sqlite.db`, does not create `db/test.db`, and does not use schema push. Do not run overlapping Nuxt generation or E2E lifecycles in the same checkout.

Local demo data is an explicit operation. Run `pnpm db:migrate` first, then choose one of these invocation paths:

- Run the `db:seed` task from Nuxt DevTools.
- Run `pnpm db:seed`. It prepares the generated Local database runtime and calls the app-owned seed implementation directly.

Both paths invoke the same task through the generated Local package. The task is not added to E2E preparation, CI, or dev startup:

The task seeds only the Engineering and Product teams with the Admin and Regular demo users. Re-running it is safe for compatible records. Unexpected Team names, User emails, or stable identities cause the task to fail without partial writes. The task must not be run against Preview, Production, or another remote database. The demo password is disposable Local-only data and must never be used for shared or deployed environments.

For a disposable Local database cycle, remove only the database storage and rebuild it from committed migrations:

```bash
pnpm db:reset
```

Hosted CI validates this same Local SQLite lifecycle on a fresh GitHub runner. Cloudflare D1, remote reset, and deployment lifecycle evidence are tracked separately and are not established by these local commands.

See the [NuxtHub DB Practices](../../../docs/practices/nuxt-hub-db/index.md) for
the separate Local SQLite, hosted CI, D1, deployment, PostgreSQL, and seed
evidence boundaries.

## Support Files

- [Shared render helpers](../test/test-utils.ts)
- [Data generators](../test/data-generators.ts)
- [Vitest configuration](../vitest.config.ts)
- [Temporary evidence configuration](../vitest.evidence.config.ts)
- [Playwright configuration](../playwright.config.ts)

## Detailed Practices

- Use [Test Data-Fetching Claims at Their Owning Boundaries](../../../docs/practices/use-fetch/data-fetching-test-evidence.md) for data-fetching-specific claim, owner, and fidelity guidance.
- See the [Nuxt Data Fetching Practices](../../../docs/practices/use-fetch/index.md) for related confirmed contracts.
