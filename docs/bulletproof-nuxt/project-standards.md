# ⚙️ Project Standards

Enforcing project standards is crucial for maintaining code quality, consistency, and scalability in a Nuxt application. By establishing and adhering to a set of best practices, developers can ensure that the codebase remains clean, organized, and easy to maintain.

#### ESLint

ESLint serves as a valuable linting tool for JavaScript and TypeScript, helping developers in maintaining code quality and adhering to coding standards. This project uses `@nuxt/eslint` which provides Vue and Nuxt-specific rules out of the box. By configuring rules in the `eslint.config.mjs` file, ESLint helps identify and prevent common errors, ensuring code correctness and promoting consistency throughout the codebase. This approach not only helps in catching mistakes early but also enforces uniformity in coding practices, thereby enhancing the overall quality and readability of the code.

[ESLint Configuration Example Code](../../apps/bulletproof-nuxt/eslint.config.mjs)

#### Formatting

This project uses ESLint stylistic rules for formatting consistency. By enabling the "format on save" feature in your IDE, code can be automatically formatted and validated according to the project ESLint configuration.

[Formatting Rules Example Code](../../apps/bulletproof-nuxt/eslint.config.mjs)

#### TypeScript

ESLint is effective for detecting language-related bugs in JavaScript. However, due to JavaScript's dynamic nature, ESLint may not catch all runtime data issues, especially in complex projects. To address this, TypeScript is recommended. TypeScript is valuable for identifying issues during large refactoring processes that may go unnoticed. When refactoring, prioritize updating type declarations first, then resolving TypeScript errors throughout the project. It's important to note that while TypeScript enhances development confidence by performing type checking at build time, it does not prevent runtime failures. Here is a [great resource on using TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html).

#### Husky

Husky is a valuable tool for implementing and executing git hooks in your workflow. By utilizing Husky to run code validations before each commit, you can ensure that your code maintains high standards and that no faulty commits are pushed to the repository. Husky enables you to perform various tasks such as linting, code formatting, and type checking before allowing code pushes. You can check how to configure it [here](https://typicode.github.io/husky/#/?id=usage).

#### Import Aliases

Import aliases should always be configured and used because it makes it easier to move files around and avoid messy import paths such as `../../../component`. Wherever you move the file, all the imports will remain intact. Nuxt provides auto-configured import aliases out of the box:

```typescript
// Layer imports
import type { User } from '~auth/shared/types'
import { useDiscussions } from '~discussions/app/composables/useDiscussions'

// App imports
import { Button } from '@/components/ui/button'

// App-owned shared components imported from a feature layer
import FormDrawer from '~~/app/components/app/FormDrawer.vue'

// NuxtHub-generated database schema
import { discussions } from '@nuxthub/db/schema'
```

Available aliases in this project:

| Alias | Path |
|-------|------|
| `@` | `app/` directory |
| `~` | `app/` directory |
| `~~` | Root directory |
| `~auth` | `layers/auth/` |
| `~discussions` | `layers/discussions/` |
| `~comments` | `layers/comments/` |
| `~users` | `layers/users/` |
| `~teams` | `layers/teams/` |
| `~base` | `layers/base/` |

Nuxt provides the `@`, `~`, and `~~` aliases. Named layer aliases are configured by each layer and work with TypeScript and IDE autocompletion.

App-owned shared components use explicit imports and are not globally scanned by Nuxt. `shadcn-nuxt` owns UI component registration from the generated `app/components/ui/**/index.ts` barrels, while feature layers retain Nuxt's default component auto-registration.

#### Database ownership

The root app owns the dialect-specific Drizzle schema sources at
`server/db/schema.sqlite.ts` and `server/db/schema.postgresql.ts`, plus the
corresponding migration sources under `server/db/migrations`. NuxtHub discovers
the selected sources and owns the generated database runtime and schema package
surfaces: `@nuxthub/db` and `@nuxthub/db/schema`.

Feature repositories import those generated packages directly. They remain
responsible for domain queries, mapping, pagination, and domain errors; API
routes remain responsible for validation, authorization, and serialization.
Operational root code, such as the explicit `server/tasks/db/seed.ts` task, may
use the generated runtime directly.
Keep connection, binding, and driver-selection setup within NuxtHub's database integration.

#### File naming conventions

We can also enforce the file naming conventions and folder naming conventions in the project. In this project, we follow these conventions:

| Type | Convention | Example |
|------|------------|---------|
| Vue Components | PascalCase | `CreateDiscussion.vue` |
| Composables | camelCase with `use` prefix | `useDiscussions.ts` |
| Types | PascalCase | `Discussion`, `User` |
| API Routes | kebab-case with method suffix | `index.get.ts`, `[id].delete.ts` |
| Schemas | camelCase with suffix | `createDiscussionInputSchema` |

This helps keep the codebase consistent and easier to navigate.
