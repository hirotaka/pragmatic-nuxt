---
title: Separate MDC authoring from UI composition
semanticId: separate-mdc-authoring-from-ui-composition
category: content-components
status: confirmed
---

# Separate MDC authoring from UI composition

## Practice

Use MDC syntax to pass text and options from markdown to a Vue component through props and slots when the same UI block is used repeatedly. An example is a [callout](https://content.nuxt.com/docs/components/slot), a box that displays notes or warnings separately from the surrounding text. Compose the UI components inside the Vue component instead of repeating their structure in markdown. For a callout, pass the title as a prop and the body through the default slot; the Vue component arranges them using the UI library's components.

## Apply When

- Multiple markdown files use the same UI block, such as a callout or a code preview.
- Text, images, or display options need to be specified in markdown without assembling the underlying UI components there.

## Do Not Apply When

- The content can be written using standard markdown headings, paragraphs, and lists.
- A UI layout is used in only one place, and its component structure can be written directly in that markdown file.

## Why

When multiple markdown files repeat the same UI component structure, changing that structure requires editing each file. Keeping that structure in one Vue component lets the markdown files supply text and options through props and slots. The component's internal layout can then change without rewriting those files, as long as the prop and slot names and their meaning remain unchanged.

## Implementation Guidance

- Use props for values that configure the component, and slots for content written in markdown.
- Import and compose the UI components inside the Vue component. Expose only the props and slots needed to use it from markdown.
- Register the Vue component so that Nuxt Content can resolve the name used in MDC. Render the markdown through Nuxt Content's `ContentRenderer`.
- Keep headings, paragraphs, and lists in markdown when they do not need an embedded UI block.
- Before changing prop or slot names or their meaning, find the markdown files that use them. After the change, check the rendered HTML and verify that Vue hydrates it without mismatches.

## Minimal Nuxt Example

Define a Vue component that displays a preview followed by its source code.

```vue
<!-- app/components/content/CodePreview.vue -->
<script setup lang="ts">
defineProps<{ label?: string }>();
</script>

<template>
  <section>
    <p v-if="label">{{ label }}</p>
    <div><slot /></div>
    <div><slot name="code" /></div>
  </section>
</template>
```

The `label` prop supplies an optional plain-text label. The template renders the default slot first and the named `code` slot after it.

Provide the label and both slots from a markdown file using MDC.

````md
<!-- content/docs/emphasis.md -->
::code-preview{label="Emphasis"}
This sentence has **emphasis**.

#code
```md
This sentence has **emphasis**.
```
::
````

`label="Emphasis"` passes the label prop. The text before `#code` fills the default slot, and the fenced code block after `#code` fills the named `code` slot.

## App Examples

- [`Callout.vue`](../../../apps/nuxt-content/app/components/Callout.vue) uses Alert components to display the `title` prop and default slot content.
- [`CodePreview.vue`](../../../apps/nuxt-content/app/components/CodePreview.vue) places the default slot and the named `code` slot in separate regions.
- [`5.animals.md`](../../../apps/nuxt-content/content/3.blog/5.animals.md) supplies images and text to repeated `PictureAndText` components through MDC.

## Trade-offs and Limitations

MDC lets markdown reuse Vue components through props and slots. In exchange, it introduces syntax beyond standard markdown, reducing portability to renderers without MDC support. Moving the content to another renderer can require rewriting or converting those MDC-specific parts.

## Sources

- [Nuxt Content: Markdown and MDC components](https://content.nuxt.com/docs/files/markdown)
- [Nuxt Content: Slots](https://content.nuxt.com/docs/components/slot)
- [Nuxt Content: ContentRenderer](https://content.nuxt.com/docs/components/content-renderer)

## Related Practices

- [Keep Installed shadcn-vue Components Unmodified](../shadcn-vue/keep-installed-shadcn-vue-components-unmodified.md)
