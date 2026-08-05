---
title: Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle
semanticId: nuxthub-hosted-ci-database-lifecycle
category: database-lifecycle
prerequisites:
  - nuxthub-runtime-schema-ownership
  - nuxthub-local-e2e-database-lifecycle
status: confirmed
---

# Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle

## Practice

Run full-stack E2E on a minimal, disposable hosted database lifecycle.

Do not reproduce every production dependency in every CI job. Instead, use a fresh hosted runner with NuxtHub's supported SQLite path, apply the committed migrations, start the real application server, and exercise the resulting database through real HTTP requests and Playwright.

This verifies the complete path:

```text
build → migration → application server → HTTP request → database → browser
```

This Hosted CI workflow targets the NuxtHub SQLite lifecycle.

## Apply When

- A database-backed feature or migration has changed and CI should verify it with the real application path.
- Local E2E passes, but the same committed migration and browser flow should also be checked on a pull request or branch.
- Each CI run should start with a fresh, disposable database instead of sharing state with another run.
- The database lifecycle should be tested without adding an external database service to CI.
- Failed runs should leave enough test reports and run metadata to diagnose what happened later.

## Use Another Practice When

- Local development or production-like E2E database isolation is the main concern. Use the Local and E2E database lifecycle Practice.
- Cloudflare D1 bindings, remote migration, or deployment identity are the main concern. Use the D1 or deployment Practice.
- Seed, reset, data continuity, backup, recovery, transactions, or portability are the main concern. Use the corresponding Practice.

## Why

Run this lifecycle on Hosted CI so the test starts outside a developer's existing environment. A fresh runner applies the committed migration, starts the real application, and checks the path from HTTP requests to the database and browser without relying on state left by a previous run.

NuxtHub SQLite provides the database lifecycle needed for this check without adding an external database service to CI. This keeps the environment small and disposable while preserving the real application path.

Some E2E tests may mock responses. That can be appropriate for focused UI behavior, but it bypasses the real migration and persistence path. For the full-stack E2E covered by this Practice, use the real database-backed path instead.

## Implementation Guidance

- Start each CI run with a fresh hosted runner.
- Install dependencies from the committed lockfile.
- Apply the committed migrations to a new disposable NuxtHub SQLite database before running E2E.
- Build and start the real application server used by the hosted E2E lifecycle.
- Run Playwright against that server.
- Use real database-backed requests for tests that verify the database lifecycle.
- Keep the database files, environment files, and generated output local to the CI job; do not share them between jobs.
- Upload the test report even when the test or setup stage fails, so the failure can be diagnosed later.
- Use response mocks only for focused UI or failure-state tests that do not verify persistence.
- Check migration, server startup, browser execution, and cleanup as separate lifecycle outcomes.

## Minimal CI Example

```yaml
name: Hosted database-backed E2E

on:
  pull_request:

jobs:
  e2e:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/bulletproof-nuxt
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:e2e:ci
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/bulletproof-nuxt/playwright/playwright-report/
          retention-days: 30
          if-no-files-found: ignore
```

This example shows a lifecycle that installs dependencies on a hosted runner, applies migrations to a disposable database, runs Playwright E2E against the real application server, and preserves the test report.

## Verified App Examples

- [Nuxt CI workflow](../../../.github/workflows/nuxt-ci.yml) triggers the Nuxt application checks, keeps matrix jobs independent, and uploads per-application Playwright reports.
- [`package.json`](../../../apps/bulletproof-nuxt/package.json) exposes the same `test:e2e:ci` lifecycle used by Local and hosted E2E.
- [`playwright.config.ts`](../../../apps/bulletproof-nuxt/playwright.config.ts) configures one CI worker, CI retries, HTML report output, and traces on first retry.
- [`server/db/migrations/sqlite/`](../../../apps/bulletproof-nuxt/server/db/migrations/sqlite/) contains the committed SQLite migration authority.

## Trade-offs and Limitations

This lifecycle favors a small and disposable CI environment over production-database parity. NuxtHub SQLite is sufficient for verifying the committed migration, application startup, HTTP requests, database writes, and browser behavior, but it does not establish compatibility with PostgreSQL or Cloudflare D1.

Because each run starts with a new database, this Practice verifies the initial migration and full-stack application path. It does not verify existing-data continuity, reset behavior, backup and recovery, transaction behavior across runs, or seed portability.

This Practice covers Hosted CI verification of the SQLite lifecycle. It does not establish deployment readiness, remote migration behavior, Cloudflare D1 behavior, or portability to PostgreSQL, PGlite, or Neon.

## Sources

- [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub matrix jobs](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [GitHub artifact storage](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [NuxtHub CI/CD](https://hub.nuxt.com/docs/guides/ci-cd)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Playwright retries](https://playwright.dev/docs/test-retries)
- [Playwright trace viewer](https://playwright.dev/docs/trace-viewer)

## Related Practices

- [Use NuxtHub's Drizzle-Powered Database Integration](runtime-schema-ownership.md)
- [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](local-e2e-database-lifecycle.md)
- [Seed a NuxtHub Database with a Nitro Task](database-seed-task.md)
- [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
- [Deploy Nuxt Applications with Cloudflare Workers Builds](cloudflare-workers-deployment.md)
- [Use PostgreSQL with NuxtHub](postgresql-dialect-portability.md)
