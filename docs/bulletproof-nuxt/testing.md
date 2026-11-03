# 🧪 Testing

See the [app README](../../apps/bulletproof-nuxt/README.md#testing) for setup and commands.

## Types of tests:

### Unit Tests

Vitest covers utilities, composables, and components in Node or the Nuxt runtime.

### Integration Tests

The [request fixture](../../apps/bulletproof-nuxt/test/support/request.ts) builds Nitro and dispatches in-process requests against a disposable SQLite database initialized from migrations. Vue rendering is covered by E2E tests.

### E2E

Playwright tests the composed app using `.data/e2e`, separate from the development database in `.data/db`.

Fixtures require `localhost:3100`; remote targets and development databases are not supported. Do not overlap Nuxt generation, request-suite builds, or E2E lifecycles in one checkout. SQLite checks do not verify Cloudflare D1 behavior.

See [Local and E2E Database Lifecycles](../practices/nuxt-hub-db/local-e2e-database-lifecycle.md) for database preparation and cleanup.

## Test Collection

App-wide tests live at the root; feature tests live in their owning layer.

| Directories | Runner / project | Environment |
| --- | --- | --- |
| `test/unit/`, `layers/*/test/unit/` | Vitest / `unit` | Node |
| `test/nuxt/`, `layers/*/test/nuxt/` | Vitest / `nuxt` | Nuxt runtime (happy-dom) |
| `test/e2e/`, `layers/*/test/e2e/` | Playwright Test / `chromium` | Running app (browser / HTTP) |

Collection rules are in the [Vitest](../../apps/bulletproof-nuxt/vitest.config.ts) and [Playwright](../../apps/bulletproof-nuxt/playwright.config.ts) configurations.

## Recommended Tooling:

The app uses Vitest, Vue Testing Library / Vue Test Utils, and Playwright. See [Testing Practices](../practices/testing/index.md) for test design guidance.
