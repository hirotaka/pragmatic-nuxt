# 🛡️  Bulletproof Nuxt

This app is a Nuxt full-stack business application. It uses
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

The app-owned Drizzle schema is defined in `server/db/schema/schema.sqlite.ts`, with an
optional PostgreSQL schema in `server/db/schema/schema.postgresql.ts`. Dialect-specific
migration sources are stored under `server/db/migrations/{sqlite,postgresql}`.
NuxtHub discovers the selected sources and generates the `@nuxthub/db` runtime
and `@nuxthub/db/schema` exports. Feature repositories retain ownership of
domain queries, mapping, pagination, and domain errors.

### Development and Builds

Apply Local migrations with `pnpm db:migrate`, then start the app with
`pnpm dev` when you want the app available. Local demo data is an explicit
`db:seed` operation. Run it from Nuxt DevTools or with `pnpm db:seed`; the
command prepares the generated Local database runtime and calls the app-owned
seed implementation directly. Use `pnpm build` for the production or Preview
Cloudflare build selected by the environment.

See [Testing](../../docs/bulletproof-nuxt/testing.md),
[Deployment](../../docs/bulletproof-nuxt/deployment.md), the
[NuxtHub DB Practices](../../docs/practices/nuxt-hub-db/index.md), and the
[Nuxt Auth Utils Practices](../../docs/practices/nuxt-auth-utils/index.md) for
environment-specific lifecycle boundaries and reusable guidance.

### Testing

Run `pnpm test:unit` for the Node and Nuxt-runtime tests. API request specs are
part of the Node project: they initialize this app, skip Vue bundling, build
Nitro, and call its listener in-process without starting an HTTP server.
Vue rendering is checked through the separate E2E lifecycle. They use a disposable SQLite
database initialized from committed migrations, not the development database.
These checks do not establish Cloudflare D1 behavior. Do not overlap them with
other Nuxt build or prepare commands.

Run `pnpm test:e2e:ci` for the separate Playwright lifecycle. E2E factories prepare
rows in the dedicated `.data/e2e` SQLite database and require the local app on
`localhost:3100`. For a manually started E2E server, use `pnpm test:e2e:dev` and
run `NUXT_PORT=3100 pnpm test:e2e`; do not point these tests at a remote app or
the development database.

E2E specs import `test` and `expect` directly from `@nuxt/test-utils/playwright`
and create their required records explicitly. The setup project prepares the
database, while the teardown project clears its business data after the browser
projects finish. Database files and migration history are retained. Cases that
need an existing session prepare it through the login API; login and registration
journeys exercise their own UI.

## 📚 Documentation

- [💻 Application Overview](../../docs/bulletproof-nuxt/application-overview.md)
- [⚙️ Project Standards](../../docs/bulletproof-nuxt/project-standards.md)
- [🗄️ Project Structure](../../docs/bulletproof-nuxt/project-structure.md)
- [🧱 Components And Styling](../../docs/bulletproof-nuxt/components-and-styling.md)
- [📡 API Layer](../../docs/bulletproof-nuxt/api-layer.md)
- [🗃️ State Management](../../docs/bulletproof-nuxt/state-management.md)
- [🧪 Testing](../../docs/bulletproof-nuxt/testing.md)
- [⚠️ Error Handling](../../docs/bulletproof-nuxt/error-handling.md)
- [🔐 Security](../../docs/bulletproof-nuxt/security.md)
- [🚄 Performance](../../docs/bulletproof-nuxt/performance.md)
- [🌐 Deployment](../../docs/bulletproof-nuxt/deployment.md)
- [📚 Additional Resources](../../docs/bulletproof-nuxt/additional-resources.md)
