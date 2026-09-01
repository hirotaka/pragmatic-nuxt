# 🛡️ Bulletproof Nuxt VeeValidate

A full-stack application using Nuxt with SSR capabilities,
Nuxt Layers architecture, and [VeeValidate](https://vee-validate.logaretm.com/v4/)
for form validation.

This app provides a VeeValidate implementation for comparison.

## 🛠️ Tech Stack

- **Framework**: Nuxt 4
- **Architecture**: Nuxt Layers for modular features
- **Form Validation**: VeeValidate + Zod v3
- **Database**: SQLite (libsql) + Drizzle ORM
- **Auth**: nuxt-auth-utils
- **Styling**: Tailwind CSS + Reka UI
- **Testing**: Vitest + Playwright

## 🚀 Get Started

Prerequisites:

- Node 22+
- pnpm

To set up the app execute the following commands.

```bash
git clone https://github.com/hirotaka/pragmatic-nuxt.git
cd pragmatic-nuxt
cd apps/reference/bulletproof-nuxt-veevalidate
cp .env.example .env
pnpm install
```

### 🗄️ Database Setup

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

See the [Bulletproof Nuxt family documentation](../../../docs/bulletproof-nuxt/application-overview.md) for shared structure and implementation guidance.
