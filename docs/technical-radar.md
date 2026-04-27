# Technical Radar

## Purpose

The Technical Radar defines default technology choices for new and actively maintained applications in this repository.

It distinguishes Canonical Apps from Reference Apps and provides a clear path for promoting experimental decisions into adopted standards.

## Rings

### Adopt

Technologies and patterns that should be used by Canonical Apps.

### Trial

Technologies and patterns that are promising but need more validation before becoming default choices.

### Assess

Technologies and patterns worth tracking or evaluating, but not ready for product implementation.

### Hold

Technologies and patterns that should not be used for new implementation work.

## Scopes

### Default

Use by default unless a clear reason exists not to.

### Contextual

Adopted, but only for specific application or feature contexts.

### App-specific

Adopted for one app archetype, not universally across all apps.

### Reference

Kept for comparison or historical learning, not for new default implementation.

## Application Roles

### Canonical Apps

Canonical Apps are actively maintained applications that reflect current Adopt ring decisions.

In this repository, Canonical Apps live at the top level of `apps/`.

Examples:

- `apps/bulletproof-nuxt`
- `apps/chat`
- `apps/dashboard`

### Reference Apps

Reference Apps preserve alternative implementations, past experiments, and comparison targets.

They are not required to receive every architecture or product update.

In this repository, Reference Apps live under `apps/reference/`.

Examples:

- `apps/reference/bulletproof-nuxt-formwerk`
- `apps/reference/bulletproof-nuxt-tanstack-form`
- `apps/reference/bulletproof-nuxt-pinia-colada`

### Experimental Apps

Experimental Apps are temporary or focused implementations used to evaluate Trial or Assess technologies before promoting them to Adopt.

### Archived Apps

Archived Apps are kept for historical context only and are not actively maintained.

## Current Adopted Decisions

| Area | Technology | Ring | Scope | Notes |
| --- | --- | --- | --- | --- |
| Framework | Nuxt | Adopt | Default | Default framework for full-stack Vue applications |
| UI Foundation | shadcn-vue / Reka UI | Adopt | Default | Default UI component foundation |
| Styling | Tailwind CSS v4 | Adopt | Default | Default styling system |
| Forms | Regle | Adopt | Default | Default form validation library |
| Validation | Zod v4 | Adopt | Default | Default schema validation library |
| Authentication | nuxt-auth-utils | Adopt | Default | Default authentication foundation |
| Database | Drizzle ORM | Adopt | Default | Default ORM for persistence |
| Testing | Vitest / Playwright | Adopt | Default | Default unit and E2E testing stack |
| Data Fetching | `useFetch` | Adopt | Default | Default Nuxt data fetching primitive |
| Server State | Pinia Colada | Adopt | Contextual | Use for dashboard-like and mutation-heavy flows |

## Data Fetching Policy

`useFetch` is the default data fetching primitive for Nuxt applications.

Pinia Colada is adopted for applications or features that require richer client-side server-state management, such as dashboards, complex forms, optimistic updates, cache invalidation, or repeated API interactions.

Prefer `useFetch` when:

- data is page-scoped;
- SSR-friendly fetching is sufficient;
- there is no complex cache invalidation;
- server state is not shared broadly across components.

Use Pinia Colada when:

- server-state cache is shared across components;
- explicit cache invalidation is required;
- there are multiple related mutations;
- optimistic updates improve UX;
- dashboard-style filtering, pagination, or refresh flows are present.

## Application Defaults

| App | Role | Forms | Data Fetching | Server State | Notes |
| --- | --- | --- | --- | --- | --- |
| `apps/bulletproof-nuxt` | Canonical App | Regle | `useFetch` | Pinia Colada when needed | Canonical Nuxt business application reference |
| `apps/chat` | Canonical App | Regle when needed | `useFetch` | Assess | Streaming chat primarily follows AI SDK patterns |
| `apps/dashboard` | Canonical App | Regle | `useFetch` | Pinia Colada | API-heavy screens, tables, filters, and forms |

## Current Applications

| App | Role | Status |
| --- | --- | --- |
| `apps/bulletproof-nuxt` | Canonical App | Actively maintained with current Adopted decisions |
| `apps/chat` | Canonical App | Planned |
| `apps/dashboard` | Canonical App | Planned |
| `apps/reference/bulletproof-vue-vite` | Reference App | Preserves Vue + Vite reference implementation |
| `apps/reference/bulletproof-nuxt-regle` | Reference App | Regle comparison/reference implementation |
| `apps/reference/bulletproof-nuxt-formwerk` | Reference App | Preserves Formwerk implementation |
| `apps/reference/bulletproof-nuxt-tanstack-form` | Reference App | Preserves TanStack Form implementation |
| `apps/reference/bulletproof-nuxt-pinia-colada` | Reference App | Preserves Pinia Colada implementation |

## Decision Process

Trial and Assess technologies should be evaluated in Experimental Apps or focused branches first.

When a technology is promoted to Adopt, Canonical Apps should be updated to reflect that decision.

Reference Apps may preserve non-adopted implementations for comparison and learning.
