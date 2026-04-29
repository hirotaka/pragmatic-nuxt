# ⚙️ Project Standards

Enforcing project standards is crucial for maintaining code quality, consistency, and scalability in a Nuxt application. By establishing and adhering to a set of best practices, developers can ensure that the codebase remains clean, organized, and easy to maintain.

#### ESLint

ESLint serves as a valuable linting tool for JavaScript and TypeScript, helping developers in maintaining code quality and adhering to coding standards. This project uses `@nuxt/eslint` which provides Vue and Nuxt-specific rules out of the box. By configuring rules in the `eslint.config.mjs` file, ESLint helps identify and prevent common errors, ensuring code correctness and promoting consistency throughout the codebase. This approach not only helps in catching mistakes early but also enforces uniformity in coding practices, thereby enhancing the overall quality and readability of the code.

[ESLint Configuration Example Code](../eslint.config.mjs)

#### Prettier

Prettier is a useful tool for maintaining consistent code formatting in your project. By enabling the "format on save" feature in your IDE, code is automatically formatted according to the rules set in the `.prettierrc` configuration file. This practice ensures a uniform code style across your codebase and provides helpful feedback on code issues. If the auto-formatting fails, it signals potential syntax error. Furthermore, Prettier can be integrated with ESLint to handle code formatting tasks alongside enforcing coding standards effectively throughout the development process.

[Prettier Configuration Example Code](../.prettierrc)

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

// Root imports
import { discussions } from '~~/db/schema'
```

Available aliases in this project:

| Alias | Path |
|-------|------|
| `~` | `app/` directory |
| `~~` | Root directory |
| `~auth` | `layers/auth/` |
| `~discussions` | `layers/discussions/` |
| `~comments` | `layers/comments/` |
| `~users` | `layers/users/` |
| `~base` | `layers/base/` |

These aliases are defined in `nuxt.config.ts` and work seamlessly with TypeScript and IDE autocompletion.

#### File naming conventions

We can also enforce the file naming conventions and folder naming conventions in the project. In this project, we follow these conventions:

| Type | Convention | Example |
|------|------------|---------|
| Vue Components | PascalCase | `CreateDiscussionForm.vue` |
| Composables | camelCase with `use` prefix | `useDiscussions.ts` |
| Types | PascalCase | `Discussion`, `User` |
| API Routes | kebab-case with method suffix | `index.get.ts`, `[id].delete.ts` |
| Schemas | camelCase with suffix | `createDiscussionInputSchema` |

This helps keep the codebase consistent and easier to navigate.
