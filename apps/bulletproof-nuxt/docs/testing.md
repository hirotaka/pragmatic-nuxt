# 🧪 Testing

Run testing commands from `apps/bulletproof-nuxt`.

## Prerequisites

- Install dependencies with pnpm.
- Copy `.env.example` to `.env` for local Nuxt commands.
- Keep the committed `.env.test` for the test database and E2E server configuration.
- Install the Playwright browser when it is not already available.

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

## E2E Commands

Prepare the dedicated test database before a local E2E run:

```bash
pnpm test:e2e:prepare
```

This removes and recreates `db/test.db` using `.env.test`. Do not point `.env.test` at a development or production database.

Start the Nuxt test server in one terminal:

```bash
pnpm test:e2e:dev
```

Run Playwright against the same port from another terminal:

```bash
NUXT_PORT=3100 pnpm test:e2e
```

The Playwright command expects an external Nuxt server. Keep `NUXT_PORT` aligned with the port used by `test:e2e:dev`, and check that the port belongs to the intended process before accepting a result.

Use the CI-style wrapper to prepare the database, build the app, start a production preview on port `3100`, and run Playwright:

```bash
pnpm test:e2e:ci
```

Additional Playwright entry points are available as `test:e2e:ui` and `test:e2e:debug`.

## Support Files

- [Shared render helpers](../test/test-utils.ts)
- [Data generators](../test/data-generators.ts)
- [Vitest configuration](../vitest.config.ts)
- [Temporary evidence configuration](../vitest.evidence.config.ts)
- [Playwright configuration](../playwright.config.ts)

## Detailed Practices

- Use [Test Data-Fetching Claims at Their Owning Boundaries](../../../docs/practices/use-fetch/data-fetching-test-evidence.md) for data-fetching-specific claim, owner, and fidelity guidance.
- See the [Nuxt Data Fetching Practices](../../../docs/practices/use-fetch/index.md) for related confirmed contracts.
