---
title: Import Layer Dependencies Explicitly from the App
semanticId: import-layer-dependencies-explicitly-from-the-app
category: import-organization
status: confirmed
---

# Import Layer Dependencies Explicitly from the App

## Practice

Nuxt's default auto-imports include Nuxt and Vue APIs and registered helpers from local Layers. Code within a layer can use its generated helpers without importing them. When application code outside `layers/` directly uses a layer's composable or type, an explicit `#layers/<name>` import shows that dependency without changing Nuxt's auto-import configuration.

## Apply When

- A Nuxt application uses local Layers, and code outside `layers/` directly uses a composable or type supplied by one of those layers.
- Code within a local Layer uses that layer's helpers registered in Nuxt's generated imports.

## Do Not Apply When

- Code runs outside Nuxt's import transformation, such as a standalone package that does not use the application's generated imports.
- A Nuxt application has no local Layers and therefore no root-to-layer dependency to make explicit.

## Why

Nuxt scans application directories and local Layers to generate imports. A helper used within its own layer can use a generated name when that name resolves unambiguously. In application code outside `layers/`, a generated name does not show which domain layer provides a directly used composable or type. Importing that dependency through a named-layer alias makes the direction from the application to the layer visible in the source file.

## Implementation Guidance

- Keep Nuxt's default auto-import behavior for Nuxt and Vue APIs and registered helpers in the app and local Layers.
- Use a generated name within its owning layer when the installed Nuxt setup resolves it unambiguously.
- Import a layer's composable or type through `#layers/<name>` when application code outside `layers/` directly depends on it.
- Let application code provide integration between separate domain Layers rather than importing one domain Layer's internals into another.
- Check the generated imports after `nuxt prepare`, then run type-checking and affected tests when changing the import form.

## Minimal Nuxt Example

```vue
<!-- app/pages/register.vue -->
<script setup lang="ts">
import { useTeams } from "#layers/teams/app/composables/useTeams";

useHead({ title: "Register your account" });
const { data: teamsData } = await useTeams();
</script>

<template>
  <RegisterForm :teams="teamsData" />
</template>
```

Nuxt generates an import for `useTeams`, but the application page uses the named-layer path to show its direct dependency on Teams. The Nuxt API `useHead` remains auto-imported. A page inside the Discussions layer can use its generated `useDiscussionList` without an explicit import.

## App Examples

- [`register.vue`](../../../apps/bulletproof-nuxt/app/pages/register.vue) imports the generated `useTeams` composable through the Teams layer alias from application code.
- [`RegisterForm.vue`](../../../apps/bulletproof-nuxt/app/components/RegisterForm.vue) imports a generated `Team` type from the Teams layer in a root-app component.
- [`index.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/index.vue) uses its own layer's generated `useDiscussionList` without a source import.
- [`DataTable.vue`](../../../apps/bulletproof-nuxt/app/components/DataTable.vue) uses the Vue API `useSlots` through Nuxt's default auto-imports.

## Trade-offs and Limitations

A named-layer import makes an application-to-layer dependency visible, but its path must be updated if the source moves. Auto-imported names shorten code within a layer; which names Nuxt generates and how they resolve depend on the installed setup.

## Sources

- [Nuxt: Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)
- [Nuxt: Named Layer Aliases](https://nuxt.com/docs/4.x/guide/going-further/layers#named-layer-aliases)
- [Nuxt: Composables Directory](https://nuxt.com/docs/4.x/directory-structure/app/composables)

## Related Practices

- [Organize Local Nuxt Layers by Application Responsibility](organize-local-nuxt-layers-by-application-responsibility.md)
