---
title: Organize Local Nuxt Layers by Application Responsibility
semanticId: organize-local-nuxt-layers-by-application-responsibility
category: application-composition
prerequisites: []
status: confirmed
---

# Organize Local Nuxt Layers by Application Responsibility

## Practice

Grouping each domain's pages and server routes in a local Nuxt Layer keeps related code together within one application. Application code outside `layers/` owns integration across those layers; each layer owns its domain behavior. Layers for separate domains use capabilities supplied by that application code instead of depending on one another's internal code.

## Apply When

- A growing Nuxt application has several domains whose pages or server routes are easier to navigate when grouped in local Layers.
- The code for a domain is intended to be shared across Nuxt applications.

## Do Not Apply When

- A small application has no distinct domains to separate into layers, and its top-level directories already make ownership clear.
- The layer is a theme or configuration preset used across projects, where composition and override priority matter more than domain ownership.
- The domains run as independently deployed services rather than as parts of one Nuxt application.

## Why

Nuxt Layers can contribute application pages, components, server routes, utilities, and configuration from separate directories. This makes a domain a useful unit for organizing a larger application.

Keeping interfaces used by more than one domain in application code outside `layers/` gives the composed app an owner for integration that no single domain represents. A layer can then provide its domain behavior while using an application-wide capability. This keeps the direction of dependencies visible as new features join the app.

## Implementation Guidance

- Register local layers in the application's `nuxt.config.ts` when their order needs to be explicit. Give each layer a `nuxt.config.ts` file.
- Place pages, components, composables, and server routes with the feature that owns their behavior.
- Place integration used across domains in the application's top-level `app/` or `server/` directory according to its runtime.
- Place types and utilities used by both the Vue app and Nitro server in the application's top-level `shared/` directory.
- Define an interface in a layer when a capability needs application-wide integration, and provide its implementation in the application's top-level `app/` or `server/` directory.
- Check that pages and server routes resolve at their intended URLs, and review dependencies between application code and layer code.

## Minimal Nuxt Example

A composable in the application's top-level `app/` directory supplies an application-wide label, while the layer at `layers/discussions` owns its page. The page uses that composable.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ["./layers/discussions"],
});
```

```ts
// app/composables/useApplicationLabel.ts
export function useApplicationLabel() {
  return "Community";
}
```

```ts
// layers/discussions/nuxt.config.ts
export default defineNuxtConfig({});
```

```vue
<!-- layers/discussions/app/pages/discussions/index.vue -->
<script setup lang="ts">
const applicationLabel = useApplicationLabel();
</script>

<template>
  <h1>{{ applicationLabel }} discussions</h1>
</template>
```

The layer contributes the `/discussions` page, where the application's composable is available.

## App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) registers the application's local layers.
- [`authApplication.ts`](../../../apps/bulletproof-nuxt/server/middleware/authApplication.ts) implements the credential lookup interface defined by the auth layer.
- [`authApplication.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/utils/authApplication.ts) declares `AuthApplicationPort` for credential lookup.
- [`index.get.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.get.ts) uses the application's `defineAuthenticatedEventHandler` to protect a discussions API route.

## Trade-offs and Limitations

When a layer defines an interface for behavior supplied by its application, the application must implement it. Another Nuxt application that shares the layer must supply its own implementation. Navigation and layouts tied to the original application may also need adaptation.

Splitting too small a codebase into layers adds configuration and ownership decisions without clarifying its behavior.

The order of Nuxt Layers also determines which resource wins when layers define the same path or component. Explicit ownership reduces accidental overlap, but matching paths or component names still require checking which file Nuxt uses.

## Sources

- [Nuxt Layers and Layer Priority](https://nuxt.com/docs/4.x/getting-started/layers)
- [Nuxt layers/ Directory](https://nuxt.com/docs/4.x/directory-structure/layers)
- [Nuxt Directory Structure](https://nuxt.com/docs/4.x/directory-structure)
- [Nuxt shared/ Directory](https://nuxt.com/docs/4.x/directory-structure/shared)

## Related Practices

- [Load the Current User Record Before Processing a Protected Request](../nuxt-auth-utils/load-current-user-before-protected-request.md)
