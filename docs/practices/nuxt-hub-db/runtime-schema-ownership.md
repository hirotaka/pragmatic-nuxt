---
title: Use NuxtHub's Drizzle-Powered Database Integration
semanticId: nuxthub-runtime-schema-ownership
category: database-foundations
prerequisites: []
status: confirmed
---

# Use NuxtHub's Drizzle-Powered Database Integration

## Practice

NuxtHub Database is powered by Drizzle ORM.

Define the application schema with Drizzle ORM, configure the database dialect through NuxtHub's `hub.db` option, generate migrations with NuxtHub's database CLI, and use the generated Drizzle database instance from `@nuxthub/db`.

NuxtHub owns the Nuxt-side database setup: schema discovery, Drizzle configuration generation, database runtime setup, and driver integration. The application owns its schema definition and database-specific domain decisions.

## Apply When

- Building a NuxtHub v0.10.8 application with SQLite.
- Defining tables, relations, columns, and type-safe models with Drizzle ORM.
- Using NuxtHub's generated `@nuxthub/db` and `@nuxthub/db/schema` packages.
- Generating migration files through `nuxt db generate`.
- Using NuxtHub's default local SQLite database at `.data/db/sqlite.db`.
- Moving from a standalone Drizzle setup to NuxtHub's database integration.

## Use Another Practice When

- Remote D1 migration and production/preview database identity are the main concern. Use the D1 deployment Practice.
- Fresh Local/E2E database allocation, migration, startup, and cleanup are the main concern. Use the database lifecycle Practice.
- PostgreSQL, PGlite, Neon, or cross-dialect portability is the main concern. Use the portability Practice.
- Seed, reset, or demo-data operations are the main concern. Use the seed and operations Practice.
- A different NuxtHub version has a different database contract. Revalidate the version-specific documentation and source first.

## Why

NuxtHub Database uses Drizzle ORM as the foundation for its type-safe SQL database support.

Drizzle ORM provides schema definitions, tables and columns, relations, type-safe query APIs, database dialect integrations, and migration generation.

NuxtHub adds the Nuxt-specific integration around that Drizzle foundation:

- Database dialect configuration through `hub.db`.
- Schema discovery under `server/db`.
- Generated Drizzle configuration.
- Generated `@nuxthub/db` runtime.
- Generated `@nuxthub/db/schema` exports.
- Nuxt preparation and build integration.
- Environment-specific driver setup.

This gives the application one clear database setup path: the application defines its schema with Drizzle, and NuxtHub prepares the Drizzle runtime used by the application.

## Implementation Guidance

- Install `drizzle-orm`, `drizzle-kit`, and the driver dependencies required by the selected database.
- Set the database dialect through NuxtHub's `hub.db` configuration.
- Define SQLite tables with Drizzle's `sqliteTable`.
- Place schema files under NuxtHub's documented `server/db` discovery boundary.
- Use NuxtHub's default local SQLite directory, `.data`, unless a specific environment requires an explicit `hub.dir` override.
- Generate migrations with `nuxt db generate` after schema changes.
- Use the generated `db` instance from `@nuxthub/db` for database queries.
- Use generated schema exports from `@nuxthub/db/schema`.
- Let NuxtHub generate the Drizzle configuration used by its database CLI.
- Run Nuxt preparation before type-aware tooling that depends on generated database packages.
- Keep database lifecycle, deployment, seed, reset, and portability decisions in their respective Practices.

## Minimal Nuxt Example

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxthub/core"],
  hub: {
    db: "sqlite",
  },
});
```

```ts
// server/db/schema.sqlite.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("User", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
```

```bash
pnpm exec nuxt db generate
```

```ts
// Application database access
import { db } from "@nuxthub/db";
import { users } from "@nuxthub/db/schema";
```

The example demonstrates the Drizzle and NuxtHub integration boundary. Deployment, migration rollout, seed, reset, and test database operations are defined by separate Practices.

## Verified App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) enables `@nuxthub/core` and configures the SQLite database path.
- [`server/db/schema.sqlite.ts`](../../../apps/bulletproof-nuxt/server/db/schema.sqlite.ts) defines the application's SQLite schema with Drizzle ORM.
- [`server/db/migrations/sqlite/`](../../../apps/bulletproof-nuxt/server/db/migrations/sqlite/) contains the generated SQLite migration output.
- [`package.json`](../../../apps/bulletproof-nuxt/package.json) exposes `db:generate` through NuxtHub's database CLI.
- The application imports the generated `@nuxthub/db` and `@nuxthub/db/schema` surfaces for database access.

## Trade-offs and Limitations

NuxtHub's Drizzle integration reduces application-owned database configuration and runtime setup. The trade-off is coupling to NuxtHub's versioned database contract and the Nuxt preparation lifecycle that generates the database packages.

The default SQLite path keeps local setup simple. Environments that require another database directory, dialect, or driver need explicit NuxtHub configuration and separate validation.

This Practice covers the application's SQLite baseline. PostgreSQL, PGlite, Neon, remote migration, database lifecycle, seed, reset, and data continuity require separate Practices and evidence.

## Sources

- [NuxtHub database](https://hub.nuxt.com/docs/database)
- [NuxtHub database schema](https://hub.nuxt.com/docs/database/schema)
- [NuxtHub database queries](https://hub.nuxt.com/docs/database/query)
- [NuxtHub database migrations](https://hub.nuxt.com/docs/database/migrations)
- [NuxtHub database CLI](https://hub.nuxt.com/docs/database/cli)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Drizzle schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration)

## Related Practices

- [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](local-e2e-database-lifecycle.md)
- [Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle](hosted-ci-database-lifecycle.md)
- [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
- [Deploy Nuxt Applications with Cloudflare Workers Builds](cloudflare-workers-deployment.md)
- [Seed a NuxtHub Database with a Nitro Task](database-seed-task.md)
- [Use PostgreSQL with NuxtHub](postgresql-dialect-portability.md)
