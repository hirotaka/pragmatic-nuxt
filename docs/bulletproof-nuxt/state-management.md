# 🗃️ State Management

The app separates component state, authentication sessions, fetched data, forms, and URL pagination.

## Component State

Forms and dialogs keep input values and pending state in their components.

## Application State

Authentication session state belongs to Nuxt Auth Utils and is exposed through `useCurrentUser`; see [Security](security.md).

## Server Cache State

Page-rendering data uses `useAPI`, built on Nuxt's `useFetch`. Imperative requests use `$api`; they do not manage AsyncData automatically.

See the [Nuxt Data Fetching Practices](../practices/nuxt-use-fetch/index.md) for request selection, shared data, and refresh behavior.

## Form State

The app uses Regle with Zod for form state and validation.

See the [Regle Practices](../practices/regle/index.md) and [Regle Validation in shadcn-vue Forms](../practices/shadcn-vue/regle-validation-in-shadcn-vue-forms.md).

## URL State

The selected discussion page is stored in the route's `page` query through `usePaginatedAPI`.

See [Keep Pagination State in the URL](../practices/nuxt/keep-pagination-state-in-the-url.md).
