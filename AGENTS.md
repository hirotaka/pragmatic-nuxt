# AGENTS.md

## Scope

- Monorepo managed by pnpm workspace (`pnpm-workspace.yaml`): packages are `apps/*` and `apps/reference/*`.

## Where to focus

- Canonical, actively maintained app: `apps/bulletproof-nuxt`.
- `apps/reference/*` are comparison/legacy implementations; do not assume conventions there match canonical Nuxt app.

## Product and learning flow

- `apps/bulletproof-nuxt` is the canonical Nuxt experimentation ground and knowledge base.
- Use it to evaluate architecture, libraries, and operational patterns before applying them to specialized showcases.
- Lessons learned in `apps/bulletproof-nuxt` should flow into `docs/technical-radar.md` and `apps/bulletproof-nuxt/docs`.
- Specialized showcases such as `apps/chat` and `apps/dashboard` should reuse adopted patterns from `apps/bulletproof-nuxt` rather than rediscovering common architecture.
- Reference apps under `apps/reference/*` preserve alternatives, experiments, and legacy implementations for comparison.

## Technology evaluation workflow

- Start with research and record candidates in `docs/technical-radar.md` as Assess or Trial.
- Use `apps/bulletproof-nuxt` for canonical experiments when the change may become a default pattern.
- Create `apps/reference/*` implementations when side-by-side comparison or legacy preservation is useful.
- Promote decisions to Adopt only after comparing trade-offs against current canonical choices.
- Once adopted, update `apps/bulletproof-nuxt`, `apps/bulletproof-nuxt/docs`, `docs/technical-radar.md`, root `README.md`, CI matrices, pre-commit app lists, lockfile, and Markdown links as needed.
- Apply adopted patterns from `apps/bulletproof-nuxt` to specialized showcases such as `apps/chat` and `apps/dashboard`.

## Documentation and decision ownership

- Canonical Nuxt documentation lives in `apps/bulletproof-nuxt/docs`.
- Nuxt reference apps should not carry duplicated `docs/` directories. Their README should link to `../../bulletproof-nuxt/README.md#documentation` for base documentation.
- `apps/reference/bulletproof-vue-vite/docs` is an exception because it documents the Vue+Vite reference app.
- App-specific reference differences should be documented briefly in that app's README, not by copying canonical docs.
- Do not create a separate ADR directory by default.
- Use `docs/technical-radar.md` for repository-level technology decisions.
- Use `apps/bulletproof-nuxt/docs` for canonical implementation guidance.
- Investigate warnings when noticed, but split unrelated dependency alignment into follow-up PRs when it is not part of the current change.

## Commands (easy to guess wrong)

- Root `package.json` has no workspace-wide lint/test/typecheck scripts. Run checks from each app directory.
- Canonical Nuxt app (`apps/bulletproof-nuxt`):
  - `pnpm lint`
  - `pnpm type-check` (wraps `nuxt typecheck`)
  - `pnpm test:unit`
  - `pnpm test:e2e:ci` (prepares test DB, builds, serves preview on `:3100`, then Playwright)
- Focused Nuxt E2E loop:
  - `pnpm test:e2e:prepare`
  - `pnpm test:e2e:dev`
  - `NUXT_PORT=3100 pnpm test:e2e`
- Vue+Vite reference app (`apps/reference/bulletproof-vue-vite`): use `pnpm run type-check` and `pnpm run test:e2e`.

## Env and test quirks

- For local startup, copy per-app env: `.env.example` -> `.env`.
- Nuxt apps commit `.env.test`; E2E/test DB scripts depend on it (`db:push:test`, `test:e2e:prepare`).
- Vue+Vite CI swaps env files explicitly:
  - CLI job: `.env.example` -> `.env`
  - E2E job: `.env.example-e2e` -> `.env`

## CI/pre-commit constraints to mirror

- Nuxt CI (`.github/workflows/nuxt-ci.yml`) runs per app: `build` -> `test:unit` -> `lint` -> `nuxi typecheck`, plus separate `test:e2e:ci` job.
- Vue+Vite CI (`.github/workflows/vue-vite-ci.yml`) runs: `build` -> `test:unit` -> `lint` -> `type-check`, plus E2E.
- Pre-commit hook runs `pnpm lint-staged` in every listed app (`.husky/pre-commit`), so staged changes can fail checks outside the app you edited.
- Commit messages must satisfy conventional commits (`.husky/commit-msg`, `commitlint.config.js`).

## Architecture notes that affect edits

- Nuxt apps are layer-based; root `nuxt.config.ts` extends feature layers (`base`, `auth`, `discussions`, `comments`, `users`, `teams`).
- When changing cross-feature behavior in Nuxt apps, check both root config and relevant layer config under `layers/*/nuxt.config.ts`.
