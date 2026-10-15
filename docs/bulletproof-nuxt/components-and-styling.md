# 🧱 Components and Styling

## Components Best Practices

Keep feature components near their callers, split large components into smaller units, and use props and slots for composition. Share components when multiple callers need the same behavior.

The root app owns shared UI and application-wide compositions. Feature layers compose them rather than copying shared primitives.

## Component libraries

The app uses shadcn-vue components in [app/components/ui/](../../apps/bulletproof-nuxt/app/components/ui/). Keep installed primitives separate from app-specific behavior.

See [Keep Installed shadcn-vue Components Unmodified](../practices/shadcn-vue/keep-installed-shadcn-vue-components-unmodified.md).

## Styling Solutions

The app uses Tailwind CSS and shadcn-vue theme variables. Forms combine shadcn-vue fields with Regle validation.

See the [shadcn-vue Practices](../practices/shadcn-vue/index.md) for integration, theming, form, and rendered-markdown guidance.

## Storybook

Storybook can provide an isolated component catalogue. It is not configured in this app.
