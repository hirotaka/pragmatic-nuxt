# 🗄️ Project Structure

This project uses Nuxt 4's **Layers architecture** for feature-based modular organization. Most of the code lives in the `app` and `layers` folders:

```sh
apps/nuxt
|
+-- app                    # Nuxt 4 application layer
|   +-- assets             # CSS, images, fonts
|   +-- components         # shared Vue components
|   +-- composables        # shared composables (hooks)
|   +-- pages              # file-based routing
|   +-- stores             # Pinia stores
|   +-- utils              # shared utility functions
|
+-- db                     # database layer
|   +-- migrations         # Drizzle migration files
|   +-- schema.ts          # Drizzle ORM schema definitions
|   +-- seed.ts            # database seeding script
|
+-- layers                 # feature-based layers
|   +-- base               # base layer (shared server utilities)
|   +-- auth               # authentication feature
|   +-- discussions        # discussions feature
|   +-- comments           # comments feature
|   +-- users              # users management feature
|
+-- server                 # Nitro server (API routes, middleware)
|
+-- e2e                    # Playwright E2E tests
```

## Layers Architecture

Nuxt Layers allow you to organize code by feature domain. Each layer is a self-contained module with its own:

- Components
- Composables
- Pages
- Server API routes
- Repository patterns
- Types

A layer typically has the following structure:

```sh
layers/discussions
|
+-- app
|   +-- components         # Vue components for this feature
|   +-- composables        # feature-specific composables
|   +-- pages              # feature pages (nested under /app/discussions)
|
+-- server
|   +-- api                # API endpoints
|   |   +-- discussions
|   |       +-- index.get.ts      # GET /api/discussions
|   |       +-- index.post.ts     # POST /api/discussions
|   |       +-- [id].get.ts       # GET /api/discussions/:id
|   |       +-- [id].patch.ts     # PATCH /api/discussions/:id
|   |       +-- [id].delete.ts    # DELETE /api/discussions/:id
|   +-- repository         # data access layer
|       +-- discussionRepository.ts
|
+-- shared
|   +-- types              # TypeScript types
|   +-- schemas            # Zod validation schemas
|
+-- nuxt.config.ts         # layer configuration
```

## Layer Registration

Layers are registered in the main `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  extends: [
    "./layers/base",
    "./layers/auth",
    "./layers/discussions",
    "./layers/comments",
    "./layers/users",
  ],
});
```

## Benefits of Layers Architecture

1. **Modularity**: Each feature is self-contained and can be developed independently.

2. **Scalability**: Easy to add new features by creating new layers.

3. **Maintainability**: Clear separation of concerns makes code easier to understand.

4. **Reusability**: Layers can potentially be shared across projects.

5. **Team Collaboration**: Different team members can work on different layers.

## Server-Side Architecture

This project includes a full server-side implementation:

```sh
layers/base/server
|
+-- utils
|   +-- db.ts              # D1 database connection (Cloudflare)
|   +-- db-libsql.ts       # libSQL connection (local development)
```

### Repository Pattern

Each feature uses the Repository pattern for data access:

```typescript
// layers/auth/server/repository/userRepository.ts
export const createUserRepository = async (event: H3Event) => {
  const db = await useDb(event);

  const findByEmail = async (email: string) => {
    // ...
  };

  const create = async (data: CreateUserData) => {
    // ...
  };

  return {
    findByEmail,
    create,
    // ...
  };
};
```

## Database Layer

The project uses Drizzle ORM with SQLite:

- **Production**: Cloudflare D1
- **Development**: libSQL (local SQLite)

Schema is defined in `db/schema.ts` and migrations are managed with Drizzle Kit.

## Import Aliases

Nuxt provides convenient import aliases for layers:

```typescript
// Import from a layer's shared types
import type { Discussion } from '~discussions/shared/types';

// Import from root db
import { discussions } from '~~/db/schema';

// Auto-imported from layers
const discussionRepository = await createDiscussionRepository(event);
```

## Best Practices

1. **Keep layers independent**: Avoid importing between feature layers. Compose features at the page level.

2. **Use the Repository pattern**: All database access should go through repositories.

3. **Validate at boundaries**: Use Zod schemas to validate API inputs.

4. **Type everything**: Leverage TypeScript for type safety across layers.

5. **Co-locate related code**: Keep components, composables, and types close to where they're used.
