# 🛡️  Bulletproof Nuxt

This app is the canonical Nuxt full-stack business application. It uses
shadcn-vue / Reka UI open-code primitives for the UI foundation while keeping
Regle as the app-owned form validation library.

## 🛠️  Tech Stack

- **Framework**: Nuxt 4
- **Architecture**: Nuxt Layers for modular features
- **Form Validation**: Regle + Zod v4
- **Database**: NuxtHub SQLite + Drizzle ORM, with an optional PostgreSQL path
- **Auth**: nuxt-auth-utils
- **Styling**: Tailwind CSS + shadcn-vue / Reka UI primitives
- **Testing**: Vitest + Playwright

## 🚀 Get Started

Prerequisites:

- Node 22+
- pnpm

To set up the app execute the following commands.

```bash
git clone https://github.com/hirotaka/pragmatic-nuxt.git
cd pragmatic-nuxt
cd apps/bulletproof-nuxt
cp .env.example .env
pnpm install
```

### Database Architecture

The app-owned Drizzle schema is defined in `server/db/schema.sqlite.ts`, with an
optional PostgreSQL schema in `server/db/schema.postgresql.ts`. Dialect-specific
migration sources are stored under `server/db/migrations/{sqlite,postgresql}`.
NuxtHub discovers the selected sources and generates the `@nuxthub/db` runtime
and `@nuxthub/db/schema` exports. Feature repositories retain ownership of
domain queries, mapping, pagination, and domain errors.

### Development and Builds

Apply Local migrations with `pnpm db:migrate`, then start the app with
`pnpm dev`. Local demo data is an explicit `db:seed` Nitro Task, available from
Nuxt DevTools after migration. Use `pnpm build` for the production or Preview
Cloudflare build selected by the environment.

See [Testing](./docs/testing.md), [Deployment](./docs/deployment.md), and the
[NuxtHub DB Practices](../../docs/practices/nuxt-hub-db/index.md) for the
environment-specific lifecycle boundaries and reusable guidance.

## 📚 Documentation

- [💻 Application Overview](./docs/application-overview.md)
- [⚙️ Project Standards](./docs/project-standards.md)
- [🗄️ Project Structure](./docs/project-structure.md)
- [🧱 Components And Styling](./docs/components-and-styling.md)
- [📡 API Layer](./docs/api-layer.md)
- [🗃️ State Management](./docs/state-management.md)
- [🧪 Testing](./docs/testing.md)
- [⚠️ Error Handling](./docs/error-handling.md)
- [🔐 Security](./docs/security.md)
- [🚄 Performance](./docs/performance.md)
- [🌐 Deployment](./docs/deployment.md)
- [📚 Additional Resources](./docs/additional-resources.md)
