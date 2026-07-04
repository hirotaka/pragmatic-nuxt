# 🛡️  Bulletproof Nuxt

This app is the canonical Nuxt full-stack business application. It uses
shadcn-vue / Reka UI open-code primitives for the UI foundation while keeping
Regle as the app-owned form validation library.

## 🛠️  Tech Stack

- **Framework**: Nuxt 4
- **Architecture**: Nuxt Layers for modular features
- **Form Validation**: Regle + Zod v4
- **Database**: SQLite (libsql) + Drizzle ORM
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

### Database Setup

Initialize the database schema:

```bash
pnpm db:push
```

Optionally, seed the database with sample data:

```bash
pnpm db:seed
```

After seeding, you can login with:

| Email               | Password    | Role  |
|---------------------|-------------|-------|
| <admin@example.com> | password123 | ADMIN |
| <user@example.com>  | password123 | USER  |

### `pnpm dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `pnpm build`

Builds the app for production.\
It correctly bundles Nuxt in production mode and optimizes the build
for the best performance.

See the section about
[deployment](https://nuxt.com/docs/getting-started/deployment)
for more information.

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
