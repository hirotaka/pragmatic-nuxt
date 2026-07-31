# AGENTS.md

## Scope and boundaries

- pnpm workspace packages are only `apps/*`, `apps/reference/*`, and `apps/sandboxes/*` (`pnpm-workspace.yaml`).
- Canonical app (default target for changes): `apps/bulletproof-nuxt`.
- `apps/sandboxes/*` are verifiable candidate implementations awaiting human canonical/reference/continue/reject judgment; do not treat them as adopted canonical decisions.
- `apps/reference/*` are comparison/legacy variants; do not assume they follow canonical conventions.
- `apps/chat` and `apps/dashboard` are listed in docs as planned, but they do not exist in this repo yet.

## OSS respect rule

- Treat external OSS as work to learn from with respect and gratitude to its authors and community; this repo records Pragmatic Nuxt-specific fit, role, and integration decisions, not OSS rankings.
- Apply this rule to docs, branch names, commit messages, PR titles/bodies, issues, review comments, agent summaries, and lifecycle decision logs.
- Frame canonical/reference/sandbox/continue/reject as this repo's lifecycle roles. When a direction is not carried forward, describe the repo-specific app shape, constraints, and lessons rather than pairing OSS names with negative shorthand.
- Short public labels need extra care: prefer wording like `record Nuxt UI fit decision` or `adopt Regle for canonical form flow` over `reject <OSS>` or `<OSS> failed`.

## Commands agents guess wrong

- Root `package.json` has no workspace lint/test/typecheck scripts; run checks inside each app directory.
- Canonical Nuxt app (`apps/bulletproof-nuxt`) verified local lifecycle and structural checks:
  - `pnpm test:unit`
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm exec nuxt prepare`
  - `pnpm db:generate` (must produce no migration delta)
  - `NITRO_PRESET=cloudflare_module pnpm build`
  - `pnpm test:e2e:prepare` (fresh local migration characterization)
  - `pnpm test:e2e:ci` (fresh local migration/build/preview/Playwright lifecycle)
- Hosted CI lifecycle evidence is observed as expected for B-003-04; Cloudflare D1 lifecycle evidence remains deferred to B-003-05 and B-003-06.
- Do not run remote reset or deploy commands in this subitem.
- Vue+Vite reference app (`apps/reference/bulletproof-vue-vite`) uses `pnpm run type-check` and `pnpm run test:e2e`.

## Environment and test quirks

- Copy per-app env file before local runs (`.env.example` -> `.env`).
- Nuxt apps rely on committed `.env.test` for the isolated E2E lifecycle.
- Vue+Vite app uses different env files by context:
  - local/CLI: `.env.example`
  - E2E/CI: `.env.example-e2e`

## CI and commit hooks to mirror locally

- Nuxt CI (`.github/workflows/nuxt-ci.yml`) runs, per Nuxt app: `build` -> `test:unit` -> `lint` -> `nuxi typecheck`, plus separate `test:e2e:ci` job. Local／E2E and hosted CI lifecycle evidence is complete for B-003-03／B-003-04; Cloudflare D1 evidence remains separate.
- Vue+Vite CI (`.github/workflows/vue-vite-ci.yml`) runs: `build` -> `test:unit` -> `lint` -> `type-check`, plus E2E.
- Pre-commit (`.husky/pre-commit`) runs `pnpm lint-staged` in every listed app, so commits can fail due to another app.
- Commit messages are enforced by commitlint conventional config (`.husky/commit-msg`, `commitlint.config.js`).

## Architecture facts that affect edits

- Canonical Nuxt app is layer-based; root `nuxt.config.ts` extends `base`, `auth`, `discussions`, `comments`, `users`, `teams`.
- Cross-feature changes may require edits in both root `nuxt.config.ts` and `layers/*/nuxt.config.ts`.
- Canonical DB runtime and schema are owned by NuxtHub-generated packages; feature repositories retain domain queries.
- Reference apps may retain historical custom DB adapters; do not assume they follow the canonical DB architecture.

## Documentation ownership

- Canonical Nuxt structural implementation docs: `apps/bulletproof-nuxt/docs`. Keep these focused on app structure, responsibility boundaries, placement, wiring, and code entry points.
- Repo-wide detailed Practices: `docs/practices/*`. App docs should link to these Practices instead of copying rationale, decision criteria, trade-offs, or tutorial guidance.
- Nuxt reference apps (`apps/reference/bulletproof-nuxt-*`) should link to canonical docs for shared implementation guidance instead of carrying copied base docs; keep only reference-specific deltas when they add reader value.
- Phase4 canonicalization and Phase5 reference publication work must verify docs ownership when moving apps between canonical/reference/sandbox roles.
- Repo-level technology decisions: `docs/technical-radar.md`.
