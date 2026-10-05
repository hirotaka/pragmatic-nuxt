---
title: Integrate shadcn-vue with Nuxt and Cover Needed Styles
semanticId: integrate-shadcn-vue-with-nuxt-and-cover-needed-styles
category: component-integration
status: confirmed
---

# Integrate shadcn-vue with Nuxt and Cover Needed Styles

## Practice

Nuxt applications using shadcn-vue follow its official [Nuxt installation guide](https://www.shadcn-vue.com/docs/installation/nuxt). Tailwind CSS uses `@tailwindcss/vite` instead of Nuxt Tailwind (`@nuxtjs/tailwindcss`), and Shadcn Nuxt (`shadcn-nuxt`) handles the Nuxt integration. The CSS entry imports `tw-animate-css` when installed components use its animation utilities. It includes Nuxt Layer files through `@source` when Tailwind misses utility classes used in those layers.

## Apply When

- A Nuxt application uses shadcn-vue with Tailwind CSS v4 and needs both installed components and their utility styles.
- An installed component uses animation utilities that the application's stylesheet does not already supply.
- A Nuxt Layer uses utility classes that are missing from the production stylesheet.

## Do Not Apply When

- Components are imported explicitly rather than auto-imported by Shadcn Nuxt.
- Animation styles are supplied by custom CSS rather than `tw-animate-css`.

## Why

Tailwind CSS's current Nuxt guide uses `@tailwindcss/vite` for styling, while Shadcn Nuxt, the official Nuxt module for shadcn-vue, enables component auto-imports. Components registered by Shadcn Nuxt can then be used in Nuxt templates without explicit imports. For components that use animation utilities, `tw-animate-css` provides a CSS-based option for Tailwind CSS v4.

## Implementation Guidance

- Follow the official shadcn-vue Nuxt guide for `@tailwindcss/vite` and Shadcn Nuxt. Keep the CSS entry and UI component directory in `components.json` consistent with the Nuxt configuration.
- After `nuxt prepare`, check the generated Nuxt declarations for auto-imported UI components.
- Import `tw-animate-css` when installed components use its animation utilities, unless application-owned CSS already supplies those styles.
- Check the production stylesheet for the utility classes used in Nuxt Layers. When Tailwind misses them, add an `@source` path relative to the CSS entry for the affected layer files, then rebuild and check the affected page.

## Minimal Nuxt Example

```ts
// nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: ["shadcn-nuxt"],
  css: ["~/assets/css/tailwind.css"],
  vite: { plugins: [tailwindcss()] },
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
});
```

The Nuxt configuration registers Shadcn Nuxt, Tailwind's Vite plugin, and the CSS entry. `componentDir` points to the installed UI components.

```jsonc
// components.json
{
  "tailwind": { "css": "app/assets/css/tailwind.css" },
  "aliases": { "ui": "@/components/ui" }
}
```

The CLI uses the same CSS entry and UI component directory. Other `components.json` fields are omitted here.

```css
/* app/assets/css/tailwind.css */
@import "tailwindcss";
@import "tw-animate-css";
@source "../../../layers/**/*.{vue,js,ts}";
```

The CSS entry imports Tailwind. It also imports `tw-animate-css` when installed components use that package's animation utilities. The `@source` path includes Nuxt Layer files when Tailwind misses their classes; adjust the relative path to the CSS entry's location.

## App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) configures Shadcn Nuxt, the Tailwind Vite plugin, and the CSS entry.
- [`components.json`](../../../apps/bulletproof-nuxt/components.json) points the CLI to the CSS entry and UI component directory.
- [`tailwind.css`](../../../apps/bulletproof-nuxt/app/assets/css/tailwind.css) owns the app's Tailwind imports and source declarations.
- [`UsersList.vue`](../../../apps/bulletproof-nuxt/layers/users/app/components/UsersList.vue) uses a responsive utility class from a layer that requires production CSS coverage.

## Trade-offs and Limitations

Auto-imports avoid repeated imports, but make component origins less visible and place UI and feature components in the same Nuxt component namespace. A prefix reduces name collisions, but shadcn-vue examples using unprefixed tags need to be adapted. An empty prefix keeps those examples usable as written but leaves short component names more likely to collide.

## Sources

- [shadcn-vue: Nuxt Installation](https://www.shadcn-vue.com/docs/installation/nuxt)
- [Shadcn Nuxt: Nuxt Module](https://nuxt.com/modules/shadcn)
- [Tailwind CSS: Install with Nuxt](https://tailwindcss.com/docs/installation/framework-guides/nuxt)
- [`@nuxtjs/tailwindcss` module](https://nuxt.com/modules/tailwindcss)
- [shadcn-vue: Manual Installation](https://www.shadcn-vue.com/docs/installation/manual)
- [Tailwind CSS: Detecting Classes in Source Files](https://tailwindcss.com/docs/detecting-classes-in-source-files)

## Related Practices

- [Use CSS Variables and the Default Theme CSS for shadcn-vue Theming](use-css-variables-and-the-default-theme-css-for-shadcn-vue-theming.md)
