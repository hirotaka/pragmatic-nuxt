# 🧪 Testing

Choose tests by the behavior they exercise. Passing isolated tests does not establish that the full application works.

## Types of tests:

### Unit Tests

Test isolated logic and components with Vitest. Tests live beside their owners in `__tests__/` directories.

### Integration Tests

Test cooperating components, composables, or server handlers at their actual boundary. Mocks limit what these tests establish.

See [Match Data-Fetching Tests to the Behavior They Exercise](../practices/nuxt-use-fetch/data-fetching-test-boundaries.md).

### E2E

Playwright tests in [e2e/](../../apps/bulletproof-nuxt/e2e/) exercise user journeys and HTTP contracts against the running app.

The local E2E lifecycle rebuilds the dedicated `.data/e2e` database from migrations, not the developer's `.data/db` database. Do not overlap Nuxt generation or E2E lifecycles in one checkout. Local and hosted SQLite checks do not establish Cloudflare D1 behavior.

See [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](../practices/nuxt-hub-db/local-e2e-database-lifecycle.md) for setup and database-safety details.

## Recommended Tooling:

- **Vitest** runs unit and integration tests.
- **Vue Testing Library / Vue Test Utils** exercise component behavior.
- **Playwright** runs browser and HTTP contract tests.

Run `pnpm test:unit` or `pnpm test:e2e:ci` from `apps/bulletproof-nuxt`. See the [app README](../../apps/bulletproof-nuxt/README.md) for initial setup and [package.json](../../apps/bulletproof-nuxt/package.json) for the available scripts.
