# 🛡️ Bulletproof Nuxt TanStack Query

This Reference App preserves the reviewed TanStack Query server-state variant of
the Bulletproof Nuxt family. It keeps the same layered business-app shape while
using Nuxt Query and TanStack Query for server reads, writes, retries, and
cache updates.

The app was forked from the reviewed
[`apps/bulletproof-nuxt`](../../bulletproof-nuxt) candidate at
`fa998d572a8f893845ba4106bfac1e7a1bf5f18a`. It is not the default showcase and
is not automatically synchronized with later canonical app changes.

## 🛠️ Tech Stack

- **Framework**: Nuxt 4
- **Architecture**: Nuxt Layers for modular features
- **Server State**: Nuxt Query + TanStack Query
- **Form Validation**: Regle + Zod v4
- **Database**: NuxtHub SQLite + Drizzle ORM, with an optional PostgreSQL path
- **Auth**: nuxt-auth-utils
- **Styling**: Tailwind CSS + shadcn-vue / Reka UI primitives
- **Testing**: Vitest + Playwright

## 🚀 Get Started

Prerequisites:

- Node 22+
- pnpm

```bash
git clone https://github.com/hirotaka/pragmatic-nuxt.git
cd pragmatic-nuxt
pnpm install
cd apps/reference/bulletproof-nuxt-tanstack-query
cp .env.example .env
pnpm db:migrate
pnpm dev
```

The app-owned Drizzle schema is defined in `server/db/schema.sqlite.ts`, with an
optional PostgreSQL schema in `server/db/schema.postgresql.ts`. NuxtHub owns the
generated database runtime while feature repositories retain domain queries,
mapping, pagination, and domain errors.

## Buildable Baseline

This Reference is maintained as a Buildable baseline. Its local qualification
covers dependency installation, Nuxt preparation, unit tests, linting, type
checking, migration generation without a tracked delta, a production Cloudflare
Module build, and the disposable SQLite E2E lifecycle.

That baseline does not promise feature or architecture parity with the default
app, automatic synchronization, remote deployment support, qualification of
Cloudflare D1 or other hosted databases, deployed Worker behavior, or controlled
concurrent SSR isolation.

## 📚 Documentation

- [Bulletproof Nuxt family documentation](../../../docs/bulletproof-nuxt/application-overview.md)
- [TanStack Query Practices](../../../docs/practices/tanstack-query/index.md)
- [NuxtHub DB Practices](../../../docs/practices/nuxt-hub-db/index.md)

Family docs describe shared domain, responsibility composition, and invariants.
TanStack Query-specific examples link back to this Reference, while reusable
adoption guidance and limitations remain in the Practice collection.
