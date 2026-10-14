---
title: Provide an SSR Width for shadcn-vue
semanticId: provide-ssr-width-for-shadcn-vue
category: component-integration
status: confirmed
---

# Provide an SSR Width for shadcn-vue

## Practice

Some shadcn-vue components select different markup at mobile widths through VueUse media queries. Providing a VueUse SSR width in a Nuxt plugin keeps the server and hydration renders on the same initial branch, avoiding hydration mismatches caused by that viewport-dependent markup.

## Apply When

- A Nuxt application server-renders a shadcn-vue component that selects different markup for mobile and desktop widths through VueUse `useMediaQuery`.

## Do Not Apply When

- A responsive component changes only its CSS presentation without switching markup.
- A component uses a viewport mechanism that does not read VueUse's SSR width.
- A component is intentionally client-only and its content does not need server rendering.

## Why

The server cannot read the browser's viewport width. Without an assumed width, a VueUse media query can select desktop markup on the server and mobile markup during hydration. Vue then compares different initial structures. VueUse's `provideSSRWidth` gives those queries an assumed width for the server and the initial client render; the browser can use its actual width after hydration.

## Implementation Guidance

- Identify installed components whose markup changes with a VueUse viewport media query, and choose an SSR width that selects the intended initial branch.
- Provide that width from a Nuxt plugin with `provideSSRWidth(width, nuxtApp.vueApp)`.
- Open affected pages directly at mobile and desktop widths. Confirm that their initial markup hydrates without a mismatch and that the component responds to the actual viewport after hydration.
- When an installed Sidebar persists its open state in a cookie, read the initial value with Nuxt `useCookie` and pass it to `SidebarProvider` as `defaultOpen`. Match the cookie name and fallback value used by the installed Sidebar.

## Minimal Nuxt Example

```ts
// app/plugins/ssr-width.ts
import { provideSSRWidth } from "@vueuse/core";

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp);
});
```

For a component that uses `(max-width: 768px)`, the example assumes the desktop branch during server rendering and hydration. A mobile browser can switch to its mobile branch after hydration. The value is an initial rendering assumption, not a change to the browser's viewport or CSS.

If an installed Sidebar also persists its open state in a cookie, the layout can read that separate initial value on the server and client:

```vue
<!-- app/layouts/default.vue -->
<script setup lang="ts">
const sidebarOpen = useCookie<boolean>("sidebar_state", { default: () => true });
</script>

<template>
  <SidebarProvider :default-open="sidebarOpen">
    <AppSidebar />
    <main><slot /></main>
  </SidebarProvider>
</template>
```

The plugin aligns the viewport-dependent branch, while the cookie read aligns this Sidebar's initial open state. The cookie name and fallback value match this installed Sidebar; other implementations may use different values.

## App Examples

- [`ssr-width.ts`](../../../apps/bulletproof-nuxt/app/plugins/ssr-width.ts) provides a VueUse SSR width for the Nuxt app.
- [`SidebarProvider.vue`](../../../apps/bulletproof-nuxt/app/components/ui/sidebar/SidebarProvider.vue) uses a VueUse media query for its mobile breakpoint.
- [`Sidebar.vue`](../../../apps/bulletproof-nuxt/app/components/ui/sidebar/Sidebar.vue) selects the mobile Sheet or desktop markup from that breakpoint.
- [`default.vue`](../../../apps/bulletproof-nuxt/app/layouts/default.vue) supplies this installed Sidebar's cookie-based initial open state separately.
- [`discussions.spec.ts`](../../../apps/bulletproof-nuxt/e2e/discussions.spec.ts) checks direct-entry SSR and hydration at mobile and desktop widths with both cookie values.

## Trade-offs and Limitations

An SSR width can address a viewport-driven hydration mismatch, but a Sidebar that saves its open state in a cookie still needs a separate SSR-safe initial value.

## Sources

- [shadcn-vue: Nuxt Installation](https://www.shadcn-vue.com/docs/installation/nuxt)
- [VueUse: useMediaQuery](https://vueuse.org/core/useMediaQuery/)
- [VueUse: useSSRWidth](https://vueuse.org/core/useSSRWidth/)
- [shadcn-vue: Sidebar](https://www.shadcn-vue.com/docs/components/sidebar)
- [Nuxt: useCookie](https://nuxt.com/docs/4.x/api/composables/use-cookie)

## Related Practices

- [Integrate shadcn-vue with Nuxt and Cover Needed Styles](integrate-shadcn-vue-with-nuxt-and-cover-needed-styles.md)
- [Keep Installed shadcn-vue Components Unmodified](keep-installed-shadcn-vue-components-unmodified.md)
