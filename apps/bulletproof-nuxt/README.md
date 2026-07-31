# 🛡️  Bulletproof Nuxt

This app is the canonical Nuxt full-stack business application. It uses
shadcn-vue / Reka UI open-code primitives for the UI foundation while keeping
Regle as the app-owned form validation library.

## 🛠️  Tech Stack

- **Framework**: Nuxt 4
- **Architecture**: Nuxt Layers for modular features
- **Form Validation**: Regle + Zod v4
- **Database**: NuxtHub SQLite + Drizzle ORM
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

The app-owned Drizzle schema is defined in `server/db/schema.ts`, and SQLite
migration sources are stored in `server/db/migrations/sqlite`. NuxtHub
discovers these files and generates the `@nuxthub/db` runtime and
`@nuxthub/db/schema` exports. Feature repositories retain ownership of domain
queries, mapping, pagination, and domain errors.

### Development and Builds

Database-backed development and production build instructions are unavailable
pending database lifecycle verification.

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
