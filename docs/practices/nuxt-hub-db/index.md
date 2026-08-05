---
title: NuxtHub Database Practices
---

# NuxtHub Database Practices

This collection documents the database practices used by the Pragmatic Nuxt application baseline. The collection uses Drizzle ORM through NuxtHub's database integration and keeps environment-specific lifecycle decisions in separate Practices.

## Environment Baseline

The current Pragmatic Nuxt application baseline selects SQLite from local development through production.

- Local development uses NuxtHub's local SQLite/libSQL database at `.data/db/sqlite.db`.
- Cloudflare Preview and Production use SQLite through D1.
- This is the application's selected environment policy, not a universal NuxtHub requirement.
- PostgreSQL, PGlite, and Neon are outside this baseline and are covered by separate portability Practices.

## Database Integration

1. [Use NuxtHub's Drizzle-Powered Database Integration](runtime-schema-ownership.md)
2. [Use Separate NuxtHub SQLite Lifecycles for Local and E2E](local-e2e-database-lifecycle.md)
3. [Seed a NuxtHub Database with a Nitro Task](database-seed-task.md)
4. [Run Real Full-Stack E2E on a Minimal Hosted Database Lifecycle](hosted-ci-database-lifecycle.md)
5. [Verify a Nuxt Application Through Cloudflare Local D1 Emulation](cloudflare-local-d1-emulation.md)
6. [Deploy Nuxt Applications with Cloudflare Workers Builds](cloudflare-workers-deployment.md)
7. [Use PostgreSQL with NuxtHub](postgresql-dialect-portability.md)
