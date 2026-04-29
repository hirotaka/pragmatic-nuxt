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

### Define and Export Request Declarations

Rather than declaring API requests on the fly, it is recommended to define and export them separately.

Declaring API requests in a structured manner can help maintain a clean and organized codebase as everything is colocated. Every API request declaration should consist of:

- Types and validation schemas for the request and response data (using Zod)
- A composable that uses `useFetch` or `$fetch` for data fetching

This approach simplifies the tracking of defined endpoints available in the application. Additionally, typing the responses and inferring them further down the application enhances application type safety.

[Validation Schema Example Code](../layers/discussions/shared/schemas.ts)
[Query Composable Example Code](../layers/discussions/app/composables/useDiscussions.ts)
[Mutation Composable Example Code](../layers/discussions/app/composables/useCreateDiscussion.ts)
