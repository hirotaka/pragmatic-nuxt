# 🧪 Testing

Choose tests by the behavior they exercise. Passing isolated tests does not establish that the full application works.

See [Center Nuxt Application Testing on Integration Tests](../practices/testing/center-nuxt-application-testing-on-integration-tests.md) for the overall testing approach.

Implementation verification and test-suite design guidance is in [Separate Implementation Verification from Test Suite Design](../practices/testing/separate-implementation-verification-from-test-suite-design.md).

## Types of tests:

### Unit Tests

Test isolated logic and components with Vitest. Tests live in their owner's `test/unit/` or `test/nuxt/`, depending on whether they need the Nuxt runtime. App-wide tests belong to the app root; feature tests belong to the corresponding layer.

Utility testing guidance is in [Direct Tests for All Application Utilities](../practices/testing/test-all-application-utilities-directly.md).

### Integration Tests

Test cooperating components, composables, or server handlers at their actual boundary. Mocks limit what these tests establish.

API integration testing guidance is in [API Integration Tests Through the Nuxt Server](../practices/testing/test-api-routes-through-the-nuxt-server.md).

Direct repository testing guidance is in [Direct Repository Tests Against a Real Database](../practices/testing/test-repository-data-rules-against-a-real-database.md).

Test database isolation and migration guidance is in [Isolated Test Databases Initialized from Migrations](../practices/testing/isolate-test-databases-and-initialize-them-from-migrations.md).

The default app's [register](../../apps/bulletproof-nuxt/test/unit/server/api/register.post.test.ts) and [login](../../apps/bulletproof-nuxt/layers/auth/test/unit/server/api/auth/login.post.test.ts) request specs run in the Node `unit` project. Their [shared fixture](../../apps/bulletproof-nuxt/test/support/request.ts) initializes the app's layers and modules, skips Vue bundling, builds the composed Nitro app once per file, and dispatches requests through Nitro's `localFetch` in-process without opening an HTTP server. They use a disposable SQLite database initialized from migrations, reset business rows between cases, and close the runtime and database after the suite. This is integration scope, not transaction rollback or a Nuxt DOM test. The app owns both its database schema and the factories in [test/factories/](../../apps/bulletproof-nuxt/test/factories/). Layer tests reuse those factories; behavior-specific tests stay in their owning layers.

Test data preparation guidance is in [Use Database Record Factories for Test Data Setup](../practices/testing/use-database-record-factories-for-test-data-setup.md).

The fixture overrides the Vue builder with an empty `bundle` function and enables `experimental.noVueServer` for request tests only. It still builds Nitro; it does not start `nuxt dev` or provide a build-free runtime. Vue rendering and HTML error pages are outside this fixture's scope and remain covered by the separate E2E lifecycle. Recheck this boundary when upgrading Nuxt because `noVueServer` is experimental.

See [Match Data-Fetching Tests to the Behavior They Exercise](../practices/nuxt-use-fetch/data-fetching-test-boundaries.md).

See [Test Composable Logic and Its Use in Components](../practices/testing/test-composable-logic-and-its-use-in-components.md) for composable testing guidance.

Application UI testing guidance is in [Application UI Testing Through Real Nuxt Page Components](../practices/testing/test-application-ui-through-real-nuxt-page-components.md).

### E2E

See [Use Playwright Test for Nuxt E2E Testing](../practices/testing/use-playwright-test-for-nuxt-e2e-testing.md).

CI E2E guidance is in [Run CI E2E Tests Through the Real Nuxt Application](../practices/nuxt-hub-db/hosted-ci-database-lifecycle.md).

Playwright Test runs `*.spec.ts` files under the app's [test/e2e/](../../apps/bulletproof-nuxt/test/e2e/) and each feature's `layers/<feature>/test/e2e/`. App-wide journeys stay at the app root; feature journeys stay in their layer. Detailed API contracts are checked by the owning Node request specs. All run against the composed app, not a separately started app per layer.

Playwright database setup and teardown live in `test/e2e/database.setup.ts` and `test/e2e/database.teardown.ts`. The setup project runs `*.setup.ts` before the Chromium project. Each case explicitly creates its required data and prepares an authenticated session through the real login API when needed. Login and registration under test still run through their UI. The teardown project runs `*.teardown.ts` after dependent projects and clears the dedicated database's business rows, retaining the database file and migration history. There is no shared authentication storage state. Fixtures shared with Vitest remain in [test/](../../apps/bulletproof-nuxt/test/).

The local E2E lifecycle rebuilds the dedicated `.data/e2e` database from migrations, not the developer's `.data/db` database. The [data helpers](../../apps/bulletproof-nuxt/test/e2e/support/factories.ts) use the root factories to prepare independent test records, while [database helpers](../../apps/bulletproof-nuxt/test/e2e/support/database.ts) own connection checks and teardown cleanup. Form input objects are not database fixtures. The registration, logout, and login journey is an explicit test in `test/e2e/registration.spec.ts`, not a prerequisite for unrelated browser tests. Its input does not pre-save the account being registered.

The setup enables WAL on the disposable database before browser tests so factory workers and the preview can read and write from separate processes. Factory connections use a busy timeout; this is not transaction rollback or a guarantee for arbitrary concurrency. These factories require the local E2E app on `localhost:3100` and an existing `.data/e2e/db/sqlite.db`; they do not support remote targets or arbitrary development databases. Do not overlap Nuxt generation or E2E lifecycles in one checkout. Local and hosted SQLite checks do not establish Cloudflare D1 behavior.

See [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](../practices/nuxt-hub-db/local-e2e-database-lifecycle.md) for setup and database-safety details.

## Test Collection

See [Organize Nuxt Tests by Application and Layer Responsibility](../practices/testing/organize-nuxt-tests-by-application-and-layer-responsibility.md) for test placement and configuration guidance.

The default app, `apps/bulletproof-nuxt`, uses the [Nuxt folder-based layout](https://nuxt.com/docs/4.x/getting-started/testing#unit-testing-organizing-your-tests) for its unit and Nuxt-runtime projects, with a separate Playwright collection:

| Directories | Runner / project | Environment |
| --- | --- | --- |
| `test/unit/`, `layers/*/test/unit/` | Vitest / `unit` | Node |
| `test/nuxt/`, `layers/*/test/nuxt/` | Vitest / `nuxt` | Nuxt runtime (happy-dom) |
| `test/e2e/`, `layers/*/test/e2e/` | Playwright Test / `chromium` | Running app (browser / HTTP) |

Within each owner's `test/unit/` and `test/nuxt/`, `app/` and `server/` paths mirror its source structure. Playwright specs live directly in each owner's `test/e2e/`, without reproducing source paths. The environment directory selects the runner and environment, not whether a test exercises isolated logic or cooperating components. Projects recursively collect `.test.ts` and `.spec.ts` files; environment suffixes are not needed. The database setup and teardown have their own collection rules.

Nuxt includes the root `test/nuxt/` in its app TypeScript context by default. The app configuration also includes root `test/unit/`, root `test/e2e/`, and `layers/*/test/` there so source aliases and generated application types remain checked. This does not change their execution environments. `playwright.config.ts` is checked in the Node TypeScript context. The request fixture's [test-only Nitro entry](../../apps/bulletproof-nuxt/test/support/requestRuntime.ts) is checked in the server TypeScript context.

`pnpm test:unit` runs both Vitest projects across the app and layers. The Node project runs files serially because request-suite builds regenerate NuxtHub packages shared within the checkout. To run one project, use `pnpm exec vitest run --project unit` or `pnpm exec vitest run --project nuxt`. Playwright uses `testDir: "."` and `**/test/e2e/**/*.{test,spec}.ts` to collect both root and layer E2E tests in the same Chromium project; they are not a Vitest project. The setup project is scoped to root `test/e2e/`. Use `NUXT_PORT=3100 pnpm test:e2e:ui` for Playwright UI Mode with the isolated app server running on port 3100. Database preparation also applies in UI Mode, which does not run setup projects by default. Run the setup and cleanup projects explicitly at the start and end of a session; see [Playwright's UI Mode setup guidance](https://playwright.dev/docs/auth#ui-mode).

See the default app's [Vitest configuration](../../apps/bulletproof-nuxt/vitest.config.ts) and [Playwright configuration](../../apps/bulletproof-nuxt/playwright.config.ts) for the collection rules. Reference apps retain their own configurations.

## Recommended Tooling:

See [Use Vitest, happy-dom, and Playwright for Nuxt Testing](../practices/testing/use-vitest-happy-dom-and-playwright-for-nuxt-testing.md).

- **Vitest** runs unit and integration tests.
- **Vue Testing Library / Vue Test Utils** exercise component behavior.
- **Playwright** runs browser and HTTP contract tests.

Run `pnpm test:unit` or `pnpm test:e2e:ci` from `apps/bulletproof-nuxt`. See the [app README](../../apps/bulletproof-nuxt/README.md) for initial setup and [package.json](../../apps/bulletproof-nuxt/package.json) for the available scripts.
