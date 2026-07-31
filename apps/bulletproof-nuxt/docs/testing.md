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

## Database-Backed E2E and CI

Database-backed E2E and CI instructions are unavailable pending database
lifecycle verification.

## Support Files

- [Shared render helpers](../test/test-utils.ts)
- [Data generators](../test/data-generators.ts)
- [Vitest configuration](../vitest.config.ts)
- [Temporary evidence configuration](../vitest.evidence.config.ts)
- [Playwright configuration](../playwright.config.ts)

## Detailed Practices

- Use [Test Data-Fetching Claims at Their Owning Boundaries](../../../docs/practices/use-fetch/data-fetching-test-evidence.md) for data-fetching-specific claim, owner, and fidelity guidance.
- See the [Nuxt Data Fetching Practices](../../../docs/practices/use-fetch/index.md) for related confirmed contracts.
