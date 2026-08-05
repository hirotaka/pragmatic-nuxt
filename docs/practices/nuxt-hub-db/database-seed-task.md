---
title: Seed a NuxtHub Database with a Nitro Task
semanticId: nuxthub-database-seed-task
category: database-operations
prerequisites:
  - nuxthub-runtime-schema-ownership
status: confirmed
---

# Seed a NuxtHub Database with a Nitro Task

## Practice

When a NuxtHub database needs development demo data, a dataset for behavior checks, or initial data required by the application, define the seed operation as a Nitro Task.

With a Nitro Task, developers can discover the seed operation through Nuxt DevTools or another supported task surface and run it explicitly whenever the data is needed.

## Apply When

- An application needs a repeatable dataset for a selected database environment.
- Developers need to invoke seed data manually through Nuxt's supported task surface.
- Seed records have stable identities, unique business keys, or other compatibility requirements.
- Seed behavior must remain separate from migrations and application startup.
- Repeat execution should avoid duplicate managed records.

## Use Another Practice When

- The main concern is applying schema migrations or isolating Local and E2E database lifecycles. Use the [Local and E2E database lifecycle Practice](local-e2e-database-lifecycle.md).
- The main concern is provisioning, credentials, or the execution channel for Hosted CI, Cloudflare D1, deployment, or remote database operations. Use the corresponding lifecycle or deployment Practice. This Practice still describes the seed behavior itself.
- The main concern is production data continuity, backup, recovery, concurrent seed execution, or rollback after writes begin. Use a database reliability Practice.

## Why

Seed operations create records using the same database configuration and schema as the application. Implementing the operation as a Nitro Task lets it use NuxtHub's database integration from the same runtime context as the Nuxt server, without creating a separate seed-only connection or execution environment.

Nitro Tasks can be discovered and executed through Nuxt DevTools or another supported task surface. This makes it possible to explicitly prepare a development environment, create demo data, or rebuild a dataset for behavior checks whenever the data is needed.

## Implementation Guidance

- Enable Nitro Tasks and define the seed task under `server/tasks/`. A file such as `server/tasks/db/seed.ts` produces the callable name `db:seed`; keep its metadata name aligned for display.
- Use the application’s NuxtHub database integration and schema, and apply the required migrations before running the task. Seed tasks must not create or repair schema.
- Define the target environment, dataset, credentials, and rerun behavior as application policy.
- Check stable identities and unique business keys before writes. Report incompatible collisions explicitly, and use the selected driver’s transaction or batch mechanism when changing multiple records.
- Invoke the task explicitly through a supported task surface rather than from migrations or startup. E2E, CI, Preview, Production, and remote execution require separately defined conditions and an authenticated execution channel.
- Nitro Tasks are experimental; verify task discovery and the available execution surface when upgrading Nuxt or Nitro.

## Minimal Nuxt Example

For Local development, enable Nitro Tasks in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  nitro: {
    experimental: {
      tasks: true,
    },
  },
});
```

Define the task in `server/tasks/db/seed.ts`. The path produces the callable name `db:seed`; keep the metadata name aligned for display:

```ts
export default defineTask({
  meta: {
    name: "db:seed",
    description: "Seed the selected database with managed records",
  },
  async run() {
    return { result: await seedDatabase() };
  },
});
```

For Local development, the manual sequence is:

1. Apply the committed database migrations to the selected database.
2. Start the development server.
3. Discover the available task through the Nuxt DevTools or Nitro task surface.
4. Invoke `db:seed` manually.
5. Review the task result.

## Verified App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) enables Nitro Tasks in the application.
- [`server/tasks/db/seed.ts`](../../../apps/bulletproof-nuxt/server/tasks/db/seed.ts) exposes the `db:seed` task and calls the database seed implementation.
- [`server/db/seed.ts`](../../../apps/bulletproof-nuxt/server/db/seed.ts) uses NuxtHub's generated database integration and schema to create the dataset, check existing records, and handle collisions.

This application seeds Team/User demo data for Local development. It uses stable identities, preserves compatible records on rerun, and returns a failure for incompatible collisions. These are application-specific choices rather than general NuxtHub requirements.

## Trade-offs and Limitations

Seed tasks are not a replacement for database migrations or database provisioning. Define the data to insert and the target environment for each application as part of an operation that adds records to an existing database.

Rerun behavior can skip, insert, update, recreate, or fail for existing records. When using stable identities or unique business keys, define how compatible existing records and incompatible collisions are handled.

For seed tasks that change multiple records, use the transaction or batch mechanism provided by the selected database driver to prevent partial writes. A preflight collision failure alone does not establish rollback after writes begin or concurrent execution safety.

The verified app's Local-only policy, Team/User dataset, stable identities, and predictable login credentials are application-specific choices. The experimental Nitro Task execution surface and database-driver capabilities must also be checked for the versions and environments being used.

## Sources

- [NuxtHub database seed](https://hub.nuxt.com/docs/database/schema#database-seed)
- [NuxtHub database](https://hub.nuxt.com/docs/database)
- [Nitro tasks](https://nitro.build/guide/tasks)

## Related Practices

- [Use NuxtHub's Drizzle-Powered Database Integration](runtime-schema-ownership.md)
- [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](local-e2e-database-lifecycle.md)
- [Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle](hosted-ci-database-lifecycle.md)
- [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
- [Deploy Nuxt Applications with Cloudflare Workers Builds](cloudflare-workers-deployment.md)
- [Use PostgreSQL with NuxtHub](postgresql-dialect-portability.md)
