---
title: Use PostgreSQL with NuxtHub
semanticId: nuxthub-postgresql-dialect-portability
category: database-portability
prerequisites:
  - nuxthub-runtime-schema-ownership
status: confirmed
---

# Use PostgreSQL with NuxtHub

## Practice

SQLite is a practical choice across many environments, from Local development
through Production. PostgreSQL remains useful when an application needs
PostgreSQL-specific database behavior, an existing PostgreSQL ecosystem, or
managed database operations.

NuxtHub supports PostgreSQL in addition to SQLite and D1. This Practice covers
the PostgreSQL options considered for the application baseline: Local PGlite
and a supported-but-unverified Neon path.

## Apply When

- The application needs a database path distinct from SQLite or D1.
- PostgreSQL-specific transactions, constraints, indexes, or data types are
  material to the application.
- The organization operates PostgreSQL as a standard database service.
- Managed PostgreSQL operations such as backup, point-in-time recovery,
  replicas, or monitoring are required.
- Multiple runtimes or external services need to connect to the same
  PostgreSQL database.
- The application is evaluating schema and migration artifacts that differ
  from SQLite or D1.

## Use Another Practice When

- The primary concern is the SQLite or D1 lifecycle; use the corresponding
  lifecycle Practice.
- The primary concern is Local SQLite, isolated E2E, or Hosted CI behavior; use
  the relevant database lifecycle Practice.
- The primary concern is Cloudflare D1 binding, Production/Preview selection,
  or Workers release; use the Local D1 or Workers deployment Practice.

## Why

SQLite is a realistic default for applications that need a portable database
path from Local development through Production. PostgreSQL is a common
client/server RDBMS with a broad ecosystem, multi-runtime connectivity, and
managed operational capabilities.

NuxtHub can use PGlite for a Local PostgreSQL path and a provider such as Neon
for a remote PostgreSQL path. The application must still treat those paths as
separate environments with separate verification boundaries.

## Implementation Guidance

- Select the PostgreSQL dialect through NuxtHub's `hub.db` configuration.
- Use PGlite for Local development when the PostgreSQL dialect is selected
  without a remote connection.
- Configure the selected remote provider and driver explicitly for a remote
  environment.
- When using Neon, configure the `neon-http` driver and provide the connection
  URL through the environment.
- Keep dialect-specific schema files when SQLite and PostgreSQL types or table
  declarations differ.
- Generate and manage PostgreSQL migrations separately from SQLite migrations.
- Use NuxtHub-generated `@nuxthub/db` and `@nuxthub/db/schema` surfaces for
  application queries.
- Keep dialect, driver, and connection configuration outside domain logic.
- Store connection URLs and credentials as environment secrets, not in
  repositories.
- Recheck the version-specific database contract when upgrading NuxtHub,
  Drizzle, PGlite, or the PostgreSQL driver.

## Minimal Nuxt Example

### Local PGlite

Selecting the PostgreSQL dialect without a PostgreSQL connection URL allows
NuxtHub to use PGlite for Local development.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  hub: {
    db: "postgresql",
  },
});
```

### Remote Neon

For Neon, select the PostgreSQL dialect and `neon-http` driver explicitly. Set
the connection URL through the deployment environment.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  hub: {
    db: {
      dialect: "postgresql",
      driver: "neon-http",
    },
  },
});
```

### PostgreSQL Schema

When one application supports both SQLite and PostgreSQL, keep the PostgreSQL
schema in a dialect-specific source file.

```ts
// server/db/schema.postgresql.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
});
```

Generate and apply migrations with the PostgreSQL dialect selected:

```bash
pnpm exec nuxt db generate
pnpm exec nuxt db migrate
```

PGlite and Neon use different drivers and connection mechanisms. They can
share PostgreSQL schema and migration artifacts, but each runtime still needs
its own verification.

## Verified App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) selects the
  PostgreSQL path explicitly while preserving the SQLite/D1 baseline. The
  Cloudflare PostgreSQL configuration uses the `neon-http` driver.
- [`package.json`](../../../apps/bulletproof-nuxt/package.json) provides the
  selected-dialect `db:generate` and `db:migrate` scripts.
- [`server/db/schema.sqlite.ts`](../../../apps/bulletproof-nuxt/server/db/schema.sqlite.ts)
  and [`server/db/schema.postgresql.ts`](../../../apps/bulletproof-nuxt/server/db/schema.postgresql.ts)
  define dialect-specific schemas.
- [`server/db/migrations/sqlite/`](../../../apps/bulletproof-nuxt/server/db/migrations/sqlite/)
  and [`server/db/migrations/postgresql/`](../../../apps/bulletproof-nuxt/server/db/migrations/postgresql/)
  keep dialect-specific migration artifacts separate.

## Trade-offs and Limitations

Adding PostgreSQL broadens the available database paths, but SQLite/D1 and
PostgreSQL differ in SQL types, constraints, indexes, and migration behavior.
A shared application interface does not remove the need for dialect-specific
schema, migration, and validation work.

SQLite/D1 and PostgreSQL verification must use separate environment selection
and local state. This keeps each dialect independently observable, but it
increases the verification and maintenance surface.

PGlite and Neon can use the same PostgreSQL dialect, but their runtime and
connection mechanisms differ. A successful Local PGlite characterization does
not establish Neon connectivity or deployment behavior.

## Sources

- [NuxtHub database](https://hub.nuxt.com/docs/database)
- [NuxtHub database schema](https://hub.nuxt.com/docs/database/schema)
- [NuxtHub database migrations](https://hub.nuxt.com/docs/database/migrations)
- [NuxtHub database CLI](https://hub.nuxt.com/docs/database/cli)
- [NuxtHub v0.10.8 source](https://github.com/nuxt-hub/core/tree/v0.10.8)
- [Drizzle ORM with PGlite](https://orm.drizzle.team/docs/connect-pglite)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/connect-neon)
- [Neon Serverless Driver](https://neon.com/docs/serverless/serverless-driver)

## Related Practices

- [Use NuxtHub's Drizzle-Powered Database Integration](runtime-schema-ownership.md)
- [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](local-e2e-database-lifecycle.md)
- [Seed a NuxtHub Database with a Nitro Task](database-seed-task.md)
- [Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle](hosted-ci-database-lifecycle.md)
- [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
- [Deploy Nuxt Applications with Cloudflare Workers Builds](cloudflare-workers-deployment.md)
