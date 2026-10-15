---
title: Use Nuxt ESLint for Application Linting
semanticId: use-nuxt-eslint-for-application-linting
category: tooling-and-verification
prerequisites: []
status: confirmed
---

# Use Nuxt ESLint for Application Linting

## Practice

The Nuxt ESLint module provides the base configuration for checking a Nuxt application's code, so lint rules account for its source directories and auto-imports. Application-specific rules extend that generated base instead of duplicating Nuxt's setup. With ESLint Stylistic enabled, the same setup also handles code formatting without a separate formatter.

## Apply When

- A Nuxt application uses ESLint to check its code.
- Lint configuration needs to account for Nuxt source directories and auto-imports.
- Application-specific rules need to coexist with Nuxt-specific configuration.

## Do Not Apply When

- An alternative linter, such as Biome or Oxlint, already provides the checks the application needs without relying on ESLint.
- For the optional formatting setup, Prettier or Biome already handles formatting.

## Why

Nuxt source directories and registered auto-imports depend on the application's configuration and modules. Maintaining them separately in a hand-written lint configuration adds another place to update when the application changes.

The Nuxt ESLint module generates configuration from the project and supports source directories in Nuxt Layers. Its default setup includes recommended JavaScript, TypeScript, and Vue rules. Extending that configuration keeps application-specific choices separate from the Nuxt settings generated for the project.

ESLint Stylistic lets formatting share the lint configuration and automatic-fix command. This avoids maintaining a separate formatter configuration when ESLint is also responsible for formatting.

## Implementation Guidance

- Enable `@nuxt/eslint` in the application's Nuxt configuration.
- Use the generated `withNuxt()` helper as the base of `eslint.config.mjs`.
- Append application-specific flat config objects through `withNuxt()` when additional rules are needed.
- Generate Nuxt's files before running ESLint on a fresh checkout.
- Enable `eslint.config.stylistic` when ESLint also owns code formatting.
- Run ESLint through the application's lint command.
- Use ESLint's `--fix` option to apply automatic fixes, including formatting changes.

## Minimal Nuxt Example

This example uses Nuxt's generated lint configuration and enables ESLint Stylistic so ESLint also handles formatting. It assumes that `@nuxt/eslint`, `eslint`, and `typescript` are installed.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
```

The module generates project-aware lint configuration when Nuxt prepares the application. The `stylistic` setting adds formatting rules to that configuration.

```js
// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```

The root ESLint configuration imports the generated helper. Application-specific flat config objects can be passed to `withNuxt()` after the generated base. On a fresh checkout, `pnpm exec nuxt prepare` generates the required files before `pnpm exec eslint .` runs the checks. Running `pnpm exec eslint . --fix` applies automatic fixes, including formatting changes from ESLint Stylistic.

## App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) enables the Nuxt ESLint module.
- [`eslint.config.mjs`](../../../apps/bulletproof-nuxt/eslint.config.mjs) uses `withNuxt()` as the application's lint configuration entry point.

## Trade-offs and Limitations

The root ESLint configuration depends on a generated file under `.nuxt/`, so linting a fresh checkout requires Nuxt preparation first.

Formatting rules are not enabled by default. ESLint Stylistic is an opt-in module setting; an application can also use Prettier for formatting. When another preset already supplies JavaScript, TypeScript, and Vue rules, `eslint.config.standalone: false` lets the module supply only the Nuxt-specific configuration.

## Sources

- [Nuxt ESLint Module](https://eslint.nuxt.com/packages/module)

## Related Practices

- [Organize Local Nuxt Layers by Application Responsibility](organize-local-nuxt-layers-by-application-responsibility.md)
