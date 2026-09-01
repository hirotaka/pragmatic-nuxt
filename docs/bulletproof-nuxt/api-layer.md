# 📡 API Layer

### Use Nuxt's Built-in Server (Nitro)

Nuxt provides a built-in server powered by Nitro with file-based API routing. API routes are defined in `server/api` directories within each layer. This approach allows you to build full-stack applications without setting up a separate backend.

[API Route Example Code](../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.get.ts)

### Use the Repository Pattern for Data Access

Rather than putting database queries directly in API routes, use the Repository pattern. Repositories keep domain data access separate from request validation, authorization, and response serialization.

Each repository should:

- Import the generated runtime from `@nuxthub/db`
- Import generated schema exports from `@nuxthub/db/schema`
- Own its feature's domain queries, mapping, pagination, and domain errors
- Expose typed methods to API routes without wrapping connection or driver selection

[Repository Example Code](../../apps/bulletproof-nuxt/layers/discussions/server/repository/discussionRepository.ts)

The app-owned schema sources are `server/db/schema.sqlite.ts` and the optional
`server/db/schema.postgresql.ts`; their migrations live under
`server/db/migrations/sqlite` and `server/db/migrations/postgresql`. NuxtHub
discovers the selected dialect sources and owns generation of the runtime and
schema package surfaces. API routes create the relevant feature repository and
retain responsibility for validation, authorization, and serialization.

See the [NuxtHub DB Practices](../practices/nuxt-hub-db/index.md) for
the reusable ownership and environment guidance.

### Keep the JSON Wire Boundary Explicit

Repository records may use runtime types such as `Date`, but HTTP response types must describe the JSON values received by clients. In this app, API routes serialize date-time fields to ISO strings before returning response DTOs. Shared client-facing types, defaults, and test fixtures therefore use `string` for those fields rather than `Date` or broad unions.

Keeping repository records and response DTOs distinct prevents TypeScript types from promising values that cannot cross the JSON wire unchanged.

App-owned `$api` callers use the shared request-aware transport for same-origin internal API requests. Existing explicit response types remain valid at the Query and Mutation boundaries. This transport ownership does not replace runtime serialization: API routes still explicitly convert runtime values and allowlist public fields where those transformations define the wire contract.

Session state uses the response contract owned by `nuxt-auth-utils`. Auth routes set the server session and return no duplicate user payload; client actions refresh that state through `useUserSession().fetch()`.

[Response Serializer Example Code](../../apps/bulletproof-nuxt/layers/discussions/server/utils/serializeDiscussion.ts)

### Feature-Owned API Operations

Feature Query and Mutation factories own endpoint identity, parameters, request bodies, response types, invalidation, and completion behavior. They use the base layer's request-aware `$api` transport for app-owned same-origin `/api/**` requests.

The transport forwards the current SSR request cookie and configures transport retry to 0 by default. It does not own notifications, redirects, session operations, error classification, or domain workflow behavior. Shared Pinia Colada options own bounded retry for client Queries, while server Queries remain single-attempt.

See [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](../practices/pinia-colada/shared-custom-fetch.md) for the reusable transport guidance and [Disable `$fetch` Retry When Using Pinia Colada Query Retry](../practices/pinia-colada/use-pinia-colada-query-retry-without-transport-retry.md) for the Query retry boundary.

Nuxt Auth Utils manages the cookie-backed authentication session, logged-in state, and current user. App-owned auth and profile writes refresh that state through `useUserSession().fetch()` after the write succeeds; they do not call the session endpoint through `$api`.

See [Use Nuxt Auth Utils for Authentication Session Management with Pinia Colada](../practices/pinia-colada/keep-authentication-session-state-in-nuxt-auth-utils.md) for the reusable session-management boundary.

### Page Rendering Reads

Page reads are defined in feature-owned Pinia Colada Query factories. The discussion list, discussion detail, users list, comments pagination, and registration Teams owners preserve their Query identity and SSR/hydration behavior while using the shared transport.

### Shared Query Placement

The discussion detail page owns route composition and initial loading. The view and update form receive the discussion ID and use the same Pinia Colada query identity; query failures flow through the shared Colada error owner. API-independent presentation components continue to receive IDs through props.

### Current Query Identity

Current fixed URLs, reactive queries, and reactive detail URLs use feature-owned Pinia Colada keys. Query factories preserve request inputs as identity and expose the native Query lifecycle to their owning views.

The app shell owns the global route loading indicator. Feature components own their local mutation and refresh feedback.

[Validation Schema Example Code](../../apps/bulletproof-nuxt/layers/discussions/shared/schemas.ts)
[Discussion Query and Mutation Definitions](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)
