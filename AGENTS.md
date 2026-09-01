# AGENTS.md

## Scope and boundaries

- pnpm workspace packages are only `apps/*`, `apps/reference/*`, and `apps/sandboxes/*` (`pnpm-workspace.yaml`).
- Default target for changes: `apps/bulletproof-nuxt`.
- `apps/sandboxes/*` are verifiable candidate implementations awaiting human review; do not treat them as settled decisions.
- `apps/reference/*` are comparison/legacy variants; do not assume they follow the default app's conventions.

## OSS respect rule

- Treat external OSS as work to learn from with respect and gratitude to its authors and community; this repo records Pragmatic Nuxt-specific fit, role, and integration decisions, not OSS rankings.
- Apply this rule to docs, branch names, commit messages, PR titles/bodies, issues, review comments, agent summaries, and lifecycle decision logs.
- Describe lifecycle outcomes through the repo-specific app shape, constraints, and lessons rather than ranking external OSS projects.
- Short public labels need extra care: prefer wording like `record Nuxt UI fit decision` or `describe Regle fit for the app` over `reject <OSS>` or `<OSS> failed`.

## Commands agents guess wrong

- Root `package.json` has no workspace lint/test/typecheck scripts; run checks inside each app directory.
- Default Nuxt app (`apps/bulletproof-nuxt`) verified local lifecycle and structural checks:
  - `pnpm test:unit`
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm exec nuxt prepare`
  - `pnpm db:generate` (must produce no migration delta)
  - `NITRO_PRESET=cloudflare_module pnpm build`
  - `pnpm test:e2e:prepare` (fresh local migration characterization)
  - `pnpm test:e2e:ci` (fresh local migration/build/preview/Playwright lifecycle)
- Hosted CI uses disposable SQLite verification. Cloudflare D1 lifecycle checks are a separate, explicitly scoped integration surface.
- Remote reset and deploy commands require explicit operational authorization and are not part of local verification.
- Vue+Vite reference app (`apps/reference/bulletproof-vue-vite`) uses `pnpm run type-check` and `pnpm run test:e2e`.

## Environment and test quirks

- Copy per-app env file before local runs (`.env.example` -> `.env`).
- Nuxt apps rely on committed `.env.test` for the isolated E2E lifecycle.
- Vue+Vite app uses different env files by context:
  - local/CLI: `.env.example`
  - E2E/CI: `.env.example-e2e`

## CI and commit hooks to mirror locally

- Nuxt CI (`.github/workflows/nuxt-ci.yml`) runs, per Nuxt app: `build` -> `test:unit` -> `lint` -> `nuxi typecheck`, plus a separate `test:e2e:ci` job. Local SQLite, hosted SQLite, and Cloudflare D1 evidence must remain distinct claims.
- Vue+Vite CI (`.github/workflows/vue-vite-ci.yml`) runs: `build` -> `test:unit` -> `lint` -> `type-check`, plus E2E.
- Pre-commit (`.husky/pre-commit`) runs `pnpm lint-staged` in every listed app, so commits can fail due to another app.
- Commit messages are enforced by commitlint conventional config (`.husky/commit-msg`, `commitlint.config.js`).

## Architecture facts that affect edits

- The default Nuxt app is layer-based; root `nuxt.config.ts` extends `base`, `auth`, `discussions`, `comments`, `users`, `teams`.
- Cross-feature changes may require edits in both root `nuxt.config.ts` and `layers/*/nuxt.config.ts`.
- The default app's DB runtime and schema are owned by NuxtHub-generated packages; feature repositories retain domain queries.
- Reference apps may retain historical custom DB adapters; do not assume they follow the default app's DB architecture.

## Documentation ownership

- Bulletproof Nuxt family docs: `docs/bulletproof-nuxt`. Keep these focused on family structure, domain and responsibility composition, invariants, placement, wiring, and code entry-point navigation.
- Repo-wide detailed Practices: `docs/practices/*`. These own reusable Apply／Do Not Apply conditions, rationale, decision criteria, implementation guidance, trade-offs, limitations, and evidence ceilings. Family docs link to Practices instead of copying that guidance.
- App READMEs own checkout identity, setup and operation, variant-specific differences, and maintenance or guarantee ceilings.
- Permanent family docs must not carry temporary workflow or publication state. Existing commands, implementation paths, snippets, and versions converge incrementally when the relevant topic document is otherwise changed; the initial ownership move does not rewrite them wholesale.
- Review family docs when family responsibility, domain relations, invariants, Practice composition, deployment responsibility, or data-safety invariants change. When a linked example moves, is deleted, or changes meaning, review its family-doc link and surrounding description in the same change.
- Nuxt reference apps (`apps/reference/bulletproof-nuxt-*`) should link to root family docs for shared guidance and keep only variant-specific README deltas; do not copy the family topic pages into each Reference.
- App moves and reference publication work must verify docs ownership without assuming that all apps share the same conventions.
