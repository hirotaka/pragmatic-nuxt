# 🗄️ Project Structure

This project uses Nuxt 4's **Layers architecture** for feature-based modular organization. Most of the code lives in the `app` and `layers` folders:

```sh
apps/nuxt
|
+-- app                    # Nuxt 4 application layer
|   +-- assets             # CSS, images, fonts
|   +-- components         # shared Vue components
|   +-- composables        # shared composables (hooks)
|   +-- lib                # shadcn-vue utilities used through explicit imports
|   +-- pages              # file-based routing
|   +-- stores             # Pinia stores
|   +-- utils              # shared utility functions
|
+-- layers                 # feature-based layers
|   +-- base               # base layer (shared server utilities)
|   +-- auth               # authentication feature
|   +-- discussions        # discussions feature
|   +-- comments           # comments feature
|   +-- users              # users management feature
|   +-- teams              # teams feature
|
+-- server                 # root Nitro and database infrastructure
|   +-- db
|       +-- schema.ts      # app-owned Drizzle schema discovered by NuxtHub
|       +-- migrations
|           +-- sqlite     # SQLite migration SQL and Drizzle metadata
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
    "./layers/teams",
  ],
});
```

## Benefits of Layers Architecture

1. **Modularity**: Each feature is self-contained and can be developed independently.

2. **Scalability**: Easy to add new features by creating new layers.

3. **Maintainability**: Clear separation of concerns makes code easier to understand.

4. **Reusability**: Layers can potentially be shared across projects.

5. **Team Collaboration**: Different team members can work on different layers.

### Repository Pattern

Each feature uses the Repository pattern for domain data access. NuxtHub owns
database connection and driver integration through generated packages, while
feature repositories own queries, result mapping, pagination, and domain
errors:

```typescript
// layers/discussions/server/repository/discussionRepository.ts
import { db } from '@nuxthub/db'
import { discussions } from '@nuxthub/db/schema'

export const createDiscussionRepository = () => {
  const findById = async (id: string, teamId: string) => {
    // ...
  }

  return {
    findById,
    // ...
  }
}
```

## Database Layer

The root app defines its Drizzle schema in `server/db/schema.ts` and keeps
SQLite migration SQL and metadata in `server/db/migrations/sqlite`. NuxtHub
discovers these sources and generates the database runtime at `@nuxthub/db`
and schema exports at `@nuxthub/db/schema`. Application code imports those
generated package surfaces rather than constructing a database connection or
selecting a driver.

## Import Aliases

Nuxt provides convenient import aliases for layers:

```typescript
// Import an app-owned shared component
import { Button } from '@/components/ui/button';

// Import from a layer's shared types
import type { Discussion } from '~discussions/shared/types';

// Import an app-owned shared component from a feature layer
import FormDrawer from '~~/app/components/app/FormDrawer.vue';

// Import generated database schema
import { discussions } from '@nuxthub/db/schema';

// Auto-imported from layers
const discussionRepository = createDiscussionRepository();
```

## Best Practices

1. **Keep feature internals independent**: Avoid importing between feature components or composables. Treat Pages as application composition boundaries that may import public APIs from multiple feature layers.

2. **Use the Repository pattern**: All database access should go through repositories.

3. **Validate at boundaries**: Use Zod schemas to validate API inputs.

4. **Type everything**: Leverage TypeScript for type safety across layers.

5. **Co-locate related code**: Keep components, composables, and types close to where they're used.
