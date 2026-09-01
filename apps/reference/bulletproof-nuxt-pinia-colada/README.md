# 🛡️ Bulletproof Nuxt Pinia Colada

This Reference App preserves the reviewed Pinia Colada server-state variant of
the Bulletproof Nuxt family. It keeps the same layered business-app shape while
using Pinia Colada Query and Mutation definitions for server reads and writes.

The app was forked from [`apps/bulletproof-nuxt`](../../bulletproof-nuxt) for a
bounded comparison. It is not the default showcase and is not automatically
synchronized with later canonical app changes.

## 🛠️ Tech Stack

- **Framework**: Nuxt 4
- **Architecture**: Nuxt Layers for modular features
- **Server State**: Pinia Colada Queries, Mutations, Infinite Queries, and plugins
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
cd apps/reference/bulletproof-nuxt-pinia-colada
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
checking, migration generation without a tracked delta, a production
Cloudflare Module build, and the disposable SQLite E2E lifecycle.

That baseline does not promise feature or architecture parity with the default
app, automatic synchronization, remote deployment support, or qualification of
Cloudflare D1 and other hosted databases.

## 📚 Documentation

- [Bulletproof Nuxt family documentation](../../../docs/bulletproof-nuxt/application-overview.md)
- [Pinia Colada Practices](../../../docs/practices/pinia-colada/index.md)
- [NuxtHub DB Practices](../../../docs/practices/nuxt-hub-db/index.md)

Family docs describe shared domain, responsibility composition, and invariants.
Pinia Colada-specific examples link back to this Reference, while reusable
adoption guidance and limitations remain in the Practice collection.
