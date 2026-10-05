---
title: Use CSS Variables and the Default Theme CSS for shadcn-vue Theming
semanticId: use-css-variables-and-the-default-theme-css-for-shadcn-vue-theming
category: component-styling
status: confirmed
---

# Use CSS Variables and the Default Theme CSS for shadcn-vue Theming

## Practice

The shadcn-vue project uses and recommends CSS variables for theming. Configuring shadcn-vue to use CSS variables and using the official Default Theme CSS establishes the default neutral theme as a base for customization.

## Apply When

- A Nuxt project uses shadcn-vue and needs a CSS-variable theme for its components.
- The official neutral theme is a suitable starting point for the project's colors and radius.

## Do Not Apply When

- A project uses inline color utilities instead of shadcn-vue's CSS-variable theme.
- An established theme already supplies the semantic tokens needed by shadcn-vue components, so the official Default Theme CSS is not needed as a starting point.

## Why

CSS variables let shadcn-vue components share semantic color tokens. Replacing the theme's CSS token definitions can switch the colors and radius used by those components without rewriting their classes. The official Default Theme CSS supplies neutral values for both light and dark modes and a radius scale, so the CSS scaffold need not be assembled from scratch.

## Implementation Guidance

- Set `tailwind.cssVariables` to `true` in `components.json` and use the official Default Theme CSS in the global stylesheet as the starting point.
- Adjust color tokens in `:root` and `.dark` and the base `--radius` as needed. Keep their `@theme inline` mappings aligned, and use `@custom-variant dark` for `.dark` descendants.
- Keep paired background and foreground tokens together when changing a surface. Check text and overlay contrast in both themes, including popovers and menus.
- Treat assigning the `.dark` class as a separate mode-selection concern.

## Minimal Nuxt Example

```jsonc
// components.json
{
  "tailwind": {
    "css": "app/assets/css/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

The CLI configuration selects CSS variables and records the base color used when generating the starting theme. Other `components.json` fields are omitted.

```css
/* app/assets/css/tailwind.css */
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --radius-lg: var(--radius);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
}
```

This example shows selected color and radius tokens from the neutral theme; the official Default Theme CSS contains the full scaffold.

## App Examples

- [`components.json`](../../../apps/bulletproof-nuxt/components.json) selects the neutral base color and CSS-variable configuration.
- [`tailwind.css`](../../../apps/bulletproof-nuxt/app/assets/css/tailwind.css) defines the light and dark tokens and maps them to Tailwind utilities.
- [`DropdownMenuContent.vue`](../../../apps/bulletproof-nuxt/app/components/ui/dropdown-menu/DropdownMenuContent.vue) uses semantic popover utilities for its surface and text.

## Trade-offs and Limitations

CSS variables let a palette change across components, but the Default Theme CSS adds a shared theme layer. Inline color utilities avoid that layer when an existing project only needs shadcn-vue components. Colors that do not fit the project's design then require component-level adjustment.

## Sources

- [shadcn-vue: Theming](https://www.shadcn-vue.com/docs/theming)
- [shadcn-vue: Dark Mode in Nuxt](https://www.shadcn-vue.com/docs/dark-mode/nuxt)

## Related Practices

- [Integrate shadcn-vue with Nuxt and Cover Needed Styles](integrate-shadcn-vue-with-nuxt-and-cover-needed-styles.md)
