---
title: Use Nuxt Icon to Supplement Lucide
semanticId: use-nuxt-icon-to-supplement-lucide
category: icons
status: confirmed
---

# Use Nuxt Icon to Supplement Lucide

## Practice

When a Nuxt page or component needs an icon that Lucide does not provide, adding the Nuxt Icon module and an Iconify collection containing that icon lets the page or component render it with `<Icon>`.

## Apply When

- A Nuxt application already uses Lucide, and a page or component needs an icon that Lucide does not provide.

## Do Not Apply When

- A Lucide icon already meets the UI need.
- The selected icon's license or, for a brand icon, the represented brand's mark rules do not permit the intended use.

## Why

Using Lucide where it fits helps keep icon imports, usage, and appearance consistent with the configured shadcn-vue UI while limiting the icon sources and license terms to manage. For icons that Lucide does not provide, the official Nuxt Icon module provides `<Icon>` and access to installed Iconify collections in a Nuxt application.

## Implementation Guidance

1. From the Nuxt application directory, run `npx nuxi module add icon` to install and register `@nuxt/icon`. Install the Iconify collection containing the missing icon as a separate package, such as `@iconify-json/uil` for `uil:github`.
2. Disable runtime icon fetching: list each required icon in `icon.clientBundle.icons`, then set `icon.provider` to `"none"`, `icon.serverBundle` to `false`, and `icon.fallbackToApi` to `false`. Add new icon names to the bundle before using them.
3. Render the missing icon with `<Icon>` in the page or component that needs it. If the icon is decorative beside a visible link label, set `aria-hidden="true"` so the link text supplies the accessible name.

## Minimal Nuxt Example

```ts
/* nuxt.config.ts */
export default defineNuxtConfig({
  modules: ["@nuxt/icon"],
  icon: {
    provider: "none",
    serverBundle: false,
    fallbackToApi: false,
    clientBundle: {
      icons: ["uil:github"],
      scan: false,
    },
  },
})
```

The Nuxt app includes `@nuxt/icon` and `@iconify-json/uil`. Only the named icon enters the client bundle, and runtime icon fetching is disabled in this configuration.

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
import { Home } from "@lucide/vue"
</script>

<template>
  <nav>
    <a href="/">
      <Home aria-hidden="true" />
      Home
    </a>
    <a href="https://github.com/example/project">
      <Icon name="uil:github" mode="svg" aria-hidden="true" />
      GitHub repository
    </a>
  </nav>
</template>
```

The `uil:github` icon demonstrates how to add an icon unavailable from Lucide. The `Home` link still uses Lucide, and the GitHub link keeps its visible label.

## App Examples

- [`components.json`](../../../apps/bulletproof-nuxt/components.json) selects Lucide for shadcn-vue component generation.
- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) bundles the one `uil:github` icon and disables runtime icon fetching.
- [`index.vue`](../../../apps/bulletproof-nuxt/app/pages/index.vue) uses the bundled icon beside the GitHub link's visible label.
- [`index.test.ts`](../../../apps/bulletproof-nuxt/app/pages/__tests__/index.test.ts) checks the primary action's SVG and the labeled GitHub link's icon.

## Trade-offs and Limitations

Nuxt Icon is MIT-licensed, but Iconify collections have separate licenses. Adding a collection expands the terms to check beyond Lucide; a brand icon may also have trademark conditions.

An icon from another collection may differ from Lucide in stroke weight or proportions, so check its appearance alongside nearby icons.

Disabling runtime fetching avoids icon API requests, but adding another Iconify icon also requires listing its name in the Nuxt config.

## Sources

- [Lucide: Vue v1 migration](https://lucide.dev/guide/vue/migration)
- [Nuxt: Nuxt Icon module](https://nuxt.com/modules/icon)
- [Nuxt: Official Modules](https://nuxt.com/modules?category=Official)
- [Nuxt Icon: License](https://github.com/nuxt/icon/blob/main/LICENSE)
- [Lucide: License](https://lucide.dev/license)
- [Lucide: What is Lucide?](https://lucide.dev/guide/)
- [shadcn-vue: Manual Installation](https://www.shadcn-vue.com/docs/installation/manual)
- [Iconify: Icon Sets](https://iconify.design/docs/icons/icon-set-basics.html)
- [Iconify: Unicons GitHub icon](https://icon-sets.iconify.design/uil/github/)
- [IconScout: Unicons license](https://github.com/Iconscout/unicons/blob/master/LICENSE)
- [GitHub: Logo Policy](https://docs.github.com/en/site-policy/other-site-policies/github-logo-policy)

## Related Practices

- [Keep Installed shadcn-vue Components Unmodified](keep-installed-shadcn-vue-components-unmodified.md)
