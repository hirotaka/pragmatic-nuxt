# AGENTS.md

## Scope and boundaries

- pnpm workspace packages are only `apps/*` and `apps/reference/*` (`pnpm-workspace.yaml`).
- Canonical app (default target for changes): `apps/bulletproof-nuxt`.
- `apps/reference/*` are comparison/legacy variants; do not assume they follow canonical conventions.
- `apps/chat` and `apps/dashboard` are listed in docs as planned, but they do not exist in this repo yet.

## Commands agents guess wrong

- Root `package.json` has no workspace lint/test/typecheck scripts; run checks inside each app directory.
- Canonical Nuxt app (`apps/bulletproof-nuxt`) main checks:
  - `pnpm build`
  - `pnpm test:unit`
  - `pnpm lint`
  - `pnpm type-check`
- Canonical Nuxt focused E2E loop:
  - `pnpm test:e2e:prepare`
  - `pnpm test:e2e:dev`
  - `NUXT_PORT=3100 pnpm test:e2e`
- Canonical Nuxt CI-style E2E: `pnpm test:e2e:ci` (prepare DB, build, preview on `:3100`, then Playwright).
- Vue+Vite reference app (`apps/reference/bulletproof-vue-vite`) uses `pnpm run type-check` and `pnpm run test:e2e`.

## Environment and test quirks

- Copy per-app env file before local runs (`.env.example` -> `.env`).
- Nuxt apps rely on committed `.env.test` for E2E/test DB scripts (`db:push:test`, `test:e2e:prepare`).
- Vue+Vite app uses different env files by context:
  - local/CLI: `.env.example`
  - E2E/CI: `.env.example-e2e`

## CI and commit hooks to mirror locally

- Nuxt CI (`.github/workflows/nuxt-ci.yml`) runs, per Nuxt app: `build` -> `test:unit` -> `lint` -> `nuxi typecheck`, plus separate `test:e2e:ci` job.
- Vue+Vite CI (`.github/workflows/vue-vite-ci.yml`) runs: `build` -> `test:unit` -> `lint` -> `type-check`, plus E2E.
- Pre-commit (`.husky/pre-commit`) runs `pnpm lint-staged` in every listed app, so commits can fail due to another app.
- Commit messages are enforced by commitlint conventional config (`.husky/commit-msg`, `commitlint.config.js`).

## Architecture facts that affect edits

- Canonical Nuxt app is layer-based; root `nuxt.config.ts` extends `base`, `auth`, `discussions`, `comments`, `users`, `teams`.
- Cross-feature changes may require edits in both root `nuxt.config.ts` and `layers/*/nuxt.config.ts`.
- Server data access follows repository + `useDb(event)` pattern under each layer's `server/repository`.
- DB adapter is runtime-switched by `DATABASE_SQLITE_ADAPTER`: default uses `DATABASE_URL`, `d1` uses Cloudflare D1 binding.

## Documentation ownership

- Canonical implementation docs: `apps/bulletproof-nuxt/docs`.
- Repo-level technology decisions: `docs/technical-radar.md`.
