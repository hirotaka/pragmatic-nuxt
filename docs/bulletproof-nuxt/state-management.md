# 🗃️ State Management

Choose state ownership by how the data is used rather than putting everything in one global store.

## Component State

Use Vue's `ref`, `reactive`, and `computed` for local and derived state. Lift state only when other components need it.

## Application State

Use Nuxt's SSR-aware `useState` or Pinia for shared application state. Authentication session state remains with Nuxt Auth Utils; see [Security](security.md).

## Server Cache State

Page-rendering data uses `useAPI`, built on Nuxt's `useFetch`. Imperative requests use `$api`; they do not manage AsyncData automatically.

See the [Nuxt Data Fetching Practices](../practices/nuxt-use-fetch/index.md) for request selection, shared data, and refresh behavior.

## Form State

The app uses Regle with Zod for form state and validation.

See the [Regle Practices](../practices/regle/index.md) and [Regle Validation in shadcn-vue Forms](../practices/shadcn-vue/regle-validation-in-shadcn-vue-forms.md).

## URL State

Use route parameters and query parameters for state that should survive navigation or be shareable, such as the selected page.

See [Keep Pagination State in the URL](../practices/nuxt/keep-pagination-state-in-the-url.md).
