# 🛡️  Bulletproof Nuxt

A Nuxt full-stack business application built with local layers.

## 🛠️  Tech Stack

- Nuxt 4 + Nuxt Layers
- Tailwind CSS + shadcn-vue / Reka UI
- Regle + Zod v4
- NuxtHub SQLite + Drizzle ORM, with optional PostgreSQL
- Nuxt Auth Utils
- Vitest + Playwright

## 🚀 Get Started

Requires Node.js 22+ and pnpm.

```bash
git clone https://github.com/hirotaka/pragmatic-nuxt.git
cd pragmatic-nuxt/apps/bulletproof-nuxt
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

### Development and Builds

Use `pnpm db:seed` for optional local demo data. `pnpm build` builds the Cloudflare Production or Preview target; see [Deployment](../../docs/bulletproof-nuxt/deployment.md).

### Testing

- `pnpm test:unit`: Node and Nuxt-runtime tests.
- `pnpm test:e2e:ci`: Build and run the isolated Playwright lifecycle.

Database-backed tests use isolated SQLite, not the development database or D1. Do not overlap tests with Nuxt build or prepare commands. See [Testing](../../docs/bulletproof-nuxt/testing.md) for test placement and database constraints.

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
