# 🧱 Components and Styling

The root app owns shared shadcn-vue UI source in [`app/components/ui/`](../../apps/bulletproof-nuxt/app/components/ui/) and application-wide compositions such as [`AppSidebar`](../../apps/bulletproof-nuxt/app/components/AppSidebar.vue) and [`DataTable`](../../apps/bulletproof-nuxt/app/components/DataTable.vue). Feature layers compose these components with their own forms, dialogs, and domain behavior; they do not own copies of the shared primitives.

[`nuxt.config.ts`](../../apps/bulletproof-nuxt/nuxt.config.ts) registers the UI modules and stylesheet. [`components.json`](../../apps/bulletproof-nuxt/components.json) configures the app-scoped shadcn-vue CLI, while [`tailwind.css`](../../apps/bulletproof-nuxt/app/assets/css/tailwind.css) covers root-app and feature-layer styles. Form components pair shadcn-vue fields with Regle-owned state and validation. [`MarkdownPreview`](../../apps/bulletproof-nuxt/app/components/MarkdownPreview.vue) sanitizes parsed markdown before applying the project-owned Typeset styles.

For reusable decisions and their limits, see the [shadcn-vue Practices](../practices/shadcn-vue/index.md).
