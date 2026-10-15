# ⚙️ Project Standards

Use the app's existing linting, formatting, and naming conventions.

#### ESLint

The app uses Nuxt ESLint. Its [configuration](../../apps/bulletproof-nuxt/eslint.config.mjs) extends the generated Nuxt configuration.

See [Use Nuxt ESLint for Application Linting](../practices/nuxt/use-nuxt-eslint-for-application-linting.md).

#### Formatting

ESLint also handles formatting. The stylistic settings live in [nuxt.config.ts](../../apps/bulletproof-nuxt/nuxt.config.ts).

#### TypeScript

The app uses strict TypeScript checks. Static types do not replace runtime validation of external data.

#### Husky

Repository [Git hooks](../../.husky/) run staged-file checks and validate commit messages. They do not replace the full test suite.

#### Imports and Aliases

Use Nuxt's generated imports and aliases rather than maintaining a separate alias configuration. See [Import Layer Dependencies Explicitly from the App](../practices/nuxt/import-layer-dependencies-explicitly-from-the-app.md) for the boundary between generated names and explicit layer imports.

#### File naming conventions

- Vue components use PascalCase, such as `DiscussionCreateForm.vue`.
- Composables use a `use` prefix, such as `useDiscussionList.ts`.
- Server API files follow Nuxt's route and HTTP-method conventions, such as `index.get.ts` and `[id].delete.ts`.
