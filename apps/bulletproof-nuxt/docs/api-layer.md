# 📡 API Layer

### Use Nuxt's Built-in Server (Nitro)

Nuxt provides a built-in server powered by Nitro with file-based API routing. API routes are defined in `server/api` directories within each layer. This approach allows you to build full-stack applications without setting up a separate backend.

[API Route Example Code](../layers/discussions/server/api/discussions/index.get.ts)

### Use the Repository Pattern for Data Access

Rather than putting database queries directly in API routes, it is recommended to use the Repository pattern. Repositories provide a clean abstraction layer between your API routes and data access logic, making the code more testable and maintainable.

Each repository should:

- Accept a database instance (obtained via `useDb`)
- Expose methods for CRUD operations
- Return typed data using TypeScript interfaces

[Repository Example Code](../layers/discussions/server/repository/discussionRepository.ts)

### Keep the JSON Wire Boundary Explicit

Repository records may use runtime types such as `Date`, but HTTP response types must describe the JSON values received by clients. In this app, API routes serialize date-time fields to ISO strings before returning response DTOs. Shared client-facing types, defaults, and test fixtures therefore use `string` for those fields rather than `Date` or broad unions.

Keeping repository records and response DTOs distinct prevents TypeScript types from promising values that cannot cross the JSON wire unchanged.

Internal `useFetch` and `$api` callers rely on Nitro's generated route declarations for request and serialized response inference instead of restating response generics. This inference does not replace runtime serialization: API routes still explicitly convert runtime values and allowlist public fields where those transformations define the wire contract.

Session state uses the response contract owned by `nuxt-auth-utils`. Auth routes set the server session and return no duplicate user payload; client actions refresh that state through `useUserSession().fetch()`.

[Response Serializer Example Code](../layers/discussions/server/utils/serializeDiscussion.ts)

### Colocate Request Validation and Composables

Rather than declaring API requests on the fly, it is recommended to define and export them separately.

Declaring API requests in a structured manner can help maintain a clean and organized codebase as everything is colocated. Every API request declaration should consist of:

- Types and validation schemas for request data (using Zod)
- A composable that uses `useFetch` or `$fetch` for data fetching

This approach simplifies the tracking of defined endpoints available in the application. Nitro's generated route declarations carry response inference to internal callers, while explicit shared response types remain useful at serialization and presentation boundaries.

### Configured API Fetchers

The base layer exposes two configured entry points for app-owned API requests: `useAPI`, created with Nuxt's [`createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch), and `$api`, created in the base API plugin and provided through NuxtApp.

[Configured Read Client](../layers/base/app/composables/useAPI.ts)

[API Plugin](../layers/base/app/plugins/api.ts)

See [Use Configured API Fetchers for App-Owned Requests](../../../docs/practices/use-fetch/custom-api-fetchers.md) for the shared boundary.

### Page Rendering Reads

Page reads are defined in feature-owned composables that return Nuxt's native AsyncData result. The discussion list, discussion detail, users list, and registration teams owners await those composables. Append-style comments pagination remains feature-local accumulated state.

See [Use `useFetch` Semantics for Page Rendering Data](../../../docs/practices/use-fetch/page-rendering-data.md) for the confirmed lifecycle guidance.

See [Give App-Owned API Operations an Explicit Owner](../../../docs/practices/use-fetch/api-operation-ownership.md) for operation ownership and application composition guidance.

### Imperative Request Client

Feature action composables call `$api` directly, while the interaction-owning component or form keeps its UI state and completion flow.

See [Use Imperative API Requests for Application Operations](../../../docs/practices/use-fetch/imperative-api-requests.md) for the confirmed request boundary.

### Shared AsyncData Placement

The discussion detail page, view, and update form call the same feature composable for their data-aware responsibilities. API-independent presentation components continue to receive data through props.

See [Share AsyncData Through Feature Composables](../../../docs/practices/use-fetch/shared-async-data.md) for the confirmed sharing guidance.

### Current AsyncData Identity

Current fixed URLs, reactive queries, and reactive detail URLs use Nuxt-generated keys. Read composables expose Nuxt's raw `refresh` function.

See [Let Request Inputs Define AsyncData Identity](../../../docs/practices/use-fetch/async-data-identity.md) for the confirmed key and reactive-input guidance.

The app shell owns the global route loading indicator. Feature components own their local mutation and refresh feedback.

[Validation Schema Example Code](../layers/discussions/shared/schemas.ts)
[Query Composable Example Code](../layers/discussions/app/composables/useDiscussions.ts)
[Mutation Composable Example Code](../layers/discussions/app/composables/useCreateDiscussion.ts)
