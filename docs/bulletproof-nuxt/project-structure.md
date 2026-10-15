# 🗄️ Project Structure

The app follows Nuxt's directory conventions and groups domain code in local layers.

```sh
apps/bulletproof-nuxt
|
+-- app               # shared UI, layouts, pages, plugins, and composables
+-- layers            # auth, discussions (including comments), users, and teams
+-- server            # application-wide API, authentication, and database infrastructure
+-- shared            # contracts used by app and server
+-- e2e               # browser and HTTP contract tests
+-- test              # shared test helpers
+-- nuxt.config.ts    # application configuration and layer registration
```

Each layer contains only the directories it needs:

```sh
layers/discussions
|
+-- app
|   +-- components    # feature UI
|   +-- composables   # feature API calls and state
|   +-- pages         # feature routes
+-- server
|   +-- api           # HTTP endpoints
|   +-- repository    # domain database queries
|   +-- utils         # server-only helpers
+-- shared            # feature types and validation schemas
+-- nuxt.config.ts    # layer configuration
```

The root app composes the layers and owns cross-domain behavior, including registration and authorization. The auth layer owns login; the discussions layer owns comments as child resources. Layers are parts of one application, not separate deployments.

The root app owns database schemas and migrations. NuxtHub provides the generated database runtime and schema exports; domain queries stay in layer repositories.

See [Organize Local Nuxt Layers by Application Responsibility](../practices/nuxt/organize-local-nuxt-layers-by-application-responsibility.md), [Import Layer Dependencies Explicitly from the App](../practices/nuxt/import-layer-dependencies-explicitly-from-the-app.md), and [Use Server Repositories for Database Access](../practices/nuxt/use-server-repositories-for-database-access.md) for the placement and dependency decisions. Database integration is covered by the [NuxtHub DB Practices](../practices/nuxt-hub-db/index.md).
