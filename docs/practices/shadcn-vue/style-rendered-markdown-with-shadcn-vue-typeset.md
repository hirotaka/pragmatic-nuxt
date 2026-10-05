---
title: Style rendered markdown with shadcn-vue Typeset
semanticId: style-rendered-markdown-with-shadcn-vue-typeset
category: content-styling
status: confirmed
---

# Style rendered markdown with shadcn-vue Typeset

## Practice

When an application renders markdown, it can use shadcn-vue Typeset as its styling system for the resulting HTML. The application owns the single CSS file that styles headings, paragraphs, and lists with consistent sizing and spacing.

## Apply When

- A Nuxt application renders markdown as HTML and needs consistent sizing and spacing for headings, paragraphs, lists, code, and tables.
- The rendered content should use the application's theme colors and fit its surrounding layout.

## Do Not Apply When

- An application already uses another styling system for HTML, such as the Tailwind Typography plugin, and that styling fits its rendered content.

## Why

Rendering markdown produces plain HTML whose headings, paragraphs, lists, and tables still need typography that fits the application. shadcn-vue Typeset's CSS file provides that styling without writing rules for every element; size, leading, and flow control most of the reading rhythm. Its colors and fonts follow the application's theme, while sizing adapts to the surrounding layout.

## Implementation Guidance

- Download [`typeset.css`](https://shadcn-vue.com/typeset.css) into the directory containing the CSS entry file. Import it after `@import "tailwindcss";` with `@import "./typeset.css";`.
- Add a Nuxt plugin that calls `nuxtApp.vueApp.use(VueDOMPurifyHTML)`. This Vue plugin provides `v-dompurify-html`, which sanitizes HTML before display.
- In the component that renders markdown, parse the source with `marked` and bind the resulting HTML to `v-dompurify-html` on an element with `class="typeset"`.

## Minimal Nuxt Example

```css
/* app/assets/css/tailwind.css */
@import "tailwindcss";
@import "./typeset.css";
```

The application keeps a copy of the Typeset stylesheet beside its CSS entry file. The `typeset.css` import follows `@import "tailwindcss";` in that file and makes the `typeset` container styles available.

```ts
/* app/plugins/dompurify.ts */
import VueDOMPurifyHTML from "vue-dompurify-html"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDOMPurifyHTML)
})
```

The Nuxt plugin registers the sanitizer directive separately from the typography stylesheet.

```vue
<!-- app/components/MarkdownPreview.vue -->
<script setup lang="ts">
import { parse } from "marked"

defineProps<{ value: string }>()
</script>

<template>
  <div v-dompurify-html="parse(value)" class="typeset" />
</template>
```

The shared renderer parses markdown, passes the HTML to the sanitizer directive, and places Typeset on the rendered-content container. The `typeset` class does not provide sanitization.

## App Examples

- [`tailwind.css`](../../../apps/bulletproof-nuxt/app/assets/css/tailwind.css) places `@import "./typeset.css";` after `@import "tailwindcss";`.
- [`MarkdownPreview.vue`](../../../apps/bulletproof-nuxt/app/components/MarkdownPreview.vue) owns the shared Typeset container for parsed and sanitized markdown.
- [`DiscussionView.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionView.vue) uses the shared preview for a discussion body.
- [`CommentsList.vue`](../../../apps/bulletproof-nuxt/layers/comments/app/components/CommentsList.vue) uses the shared preview for comment bodies.

## Trade-offs and Limitations

The downloaded [`typeset.css`](https://shadcn-vue.com/typeset.css) applies the same default typography wherever `typeset` is used. Different markdown displays in an application, such as chat messages and documentation pages, may call for different font sizes or spacing. Adding a preset class allows those displays to use different typography.

## Sources

- [shadcn-vue: Typeset](https://www.shadcn-vue.com/docs/typeset)
- [shadcn-vue: Typeset CSS download](https://shadcn-vue.com/typeset.css)
- [shadcn-vue: Pinned Typeset CSS](https://github.com/unovue/shadcn-vue/blob/67c9a3926dc0a854507b325c6337ff2210d16379/apps/v4/public/typeset.css)
- [Tailwind CSS: Typography Plugin](https://tailwindcss.com/docs/typography-plugin)

## Related Practices

- [Integrate shadcn-vue with Nuxt and Cover Needed Styles](integrate-shadcn-vue-with-nuxt-and-cover-needed-styles.md)
- [Use CSS Variables and the Default Theme CSS for shadcn-vue Theming](use-css-variables-and-the-default-theme-css-for-shadcn-vue-theming.md)
