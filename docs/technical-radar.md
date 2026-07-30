# Technical Radar

## Purpose

The Technical Radar defines default technology choices for new and actively maintained applications in this repository.

It distinguishes Canonical Apps, Sandbox Apps, and Reference Apps so candidate implementations can be evaluated before adoption or preservation decisions are made.

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

For Nuxt reference apps, shared implementation documentation should live in the
canonical Nuxt app docs. Reference-specific docs should focus on differences,
maintenance expectations, known constraints, and comparison value.

In this repository, Reference Apps live under `apps/reference/`.

Examples:

- `apps/reference/bulletproof-nuxt-formwerk`
- `apps/reference/bulletproof-nuxt-tanstack-form`
- `apps/reference/bulletproof-nuxt-pinia-colada`

### Sandbox Apps

Sandbox Apps are verifiable implementations awaiting human judgment. They may
be adopted as canonical, preserved as references, continued as sandboxes, or
not carried forward after review.

In this repository, Sandbox Apps live under `apps/sandboxes/`.

Examples:

- None currently active

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
| Data Fetching | `useFetch` | Adopt | Default | Default Nuxt primitive for page-rendering reads |
| Server State | Pinia Colada | Adopt | Contextual | Use for dashboard-like and mutation-heavy flows |

## Forms Policy

Regle remains the adopted validation library for canonical Nuxt applications.
For shadcn-vue / Reka UI application surfaces, form UI should keep validation
state app-owned and avoid coupling visual controls directly to Regle.

Stackhacker UI `Form` and `FormField` are the adopted Regle-compatible form
wrapper for shadcn-vue / Reka UI application surfaces. Feature components own
Regle state, schemas, submission, notifications, and redirects while the form
components own validation triggering, submit/error events, field error
distribution, and accessibility props.

## Data Fetching Policy

Compatible consumers may share Nuxt AsyncData through the same feature composable when Nuxt's lifecycle and request identity are sufficient. See [Share AsyncData Through Feature Composables](./practices/use-fetch/shared-async-data.md).

Pinia Colada is adopted for applications or features that require explicit cache operations, optimistic updates, complex invalidation, or broader cross-view server-state coordination. Component sharing alone does not require Pinia Colada.

See the [Nuxt Data Fetching Practices](./practices/use-fetch/index.md) for the confirmed `useFetch` and imperative-request boundaries.

## Application Defaults

| App | Role | Forms | Data Fetching | Server State | Notes |
| --- | --- | --- | --- | --- | --- |
| `apps/bulletproof-nuxt` | Canonical App | Regle via Stackhacker UI form wrapper | `useFetch` | Pinia Colada when needed | Canonical Nuxt business application with shadcn-vue / Reka UI composition |
| `apps/chat` | Canonical App | Regle when needed | `useFetch` | Assess | Streaming chat primarily follows AI SDK patterns |
| `apps/dashboard` | Canonical App | Regle | `useFetch` | Pinia Colada | API-heavy screens, tables, filters, and forms |

## Current Applications

| App | Role | Status |
| --- | --- | --- |
| `apps/bulletproof-nuxt` | Canonical App | Actively maintained with current Adopted decisions |
| `apps/chat` | Canonical App | Planned |
| `apps/dashboard` | Canonical App | Planned |
| `apps/reference/bulletproof-vue-vite` | Reference App | Preserves Vue + Vite reference implementation |
| `apps/reference/bulletproof-nuxt-veevalidate` | Reference App | Preserves VeeValidate legacy implementation |
| `apps/reference/bulletproof-nuxt-formwerk` | Reference App | Preserves Formwerk implementation |
| `apps/reference/bulletproof-nuxt-tanstack-form` | Reference App | Preserves TanStack Form implementation |
| `apps/reference/bulletproof-nuxt-pinia-colada` | Reference App | Preserves Pinia Colada implementation |
| `apps/reference/bulletproof-nuxt-original-ui` | Reference App | Preserves the original Bulletproof React UI composition ported to Nuxt |

## Decision Process

Trial and Assess technologies should be evaluated in Sandbox Apps, Experimental Apps, or focused branches first.

When a technology is promoted to Adopt, Canonical Apps should be updated to reflect that decision.

Reference Apps may preserve non-adopted implementations for comparison and learning.

Sandbox Apps should not be treated as adopted decisions until human review resolves them into canonical, reference, continued sandbox, or not-carried-forward status.

Lifecycle roles in this document describe Pragmatic Nuxt fit and maintenance choices. They are not rankings of external OSS projects; record constraints, lessons, and repo-specific fit with respect for the projects and authors this repository learns from.
