# 🗃️ State Management

Managing state effectively is crucial for optimizing your application's performance. Instead of storing all state information in a single centralized repository, consider dividing it into various categories based on their usage. By categorizing your state, you can streamline your state management process and enhance your application's overall efficiency.

## Component State

Component state is specific to individual components and should not be shared globally. It can be passed down to child components as props when necessary. Typically, you should begin by defining state within the component itself and consider elevating it to a higher level if it's required elsewhere in the application. When managing component state, you can use the following Vue APIs:

- [ref](https://vuejs.org/api/reactivity-core.html#ref) - for simple reactive values
- [reactive](https://vuejs.org/api/reactivity-core.html#reactive) - for reactive objects
- [computed](https://vuejs.org/api/reactivity-core.html#computed) - for derived state

## Application State

Application state manages global parts of an application, such as controlling global modals, notifications, and toggling color modes. To ensure optimal performance and ease of maintenance, it is advisable to localize the state as closely as possible to the components that require it. Avoid unnecessarily globalizing all state variables from the outset.

Good Application State Solutions for Vue/Nuxt:

- [useState](https://nuxt.com/docs/api/composables/use-state) - Nuxt's SSR-friendly global state
- [Pinia](https://pinia.vuejs.org/) - Official Vue state management library
- [VueUse](https://vueuse.org/) - Collection of Vue composition utilities

[Application State Example Code](../../apps/bulletproof-nuxt/layers/base/app/composables/useNotifications.ts)

## Server Cache State

The Server Cache State refers to the data retrieved from the server that is stored locally on the client-side for future use. Nuxt provides built-in data fetching composables that handle caching, deduplication, and SSR automatically.

Good Server Cache Solutions for Nuxt:

- [Pinia Colada](https://pinia-colada.esm.dev/) - Query and Mutation server state used in the Pinia Colada Reference
- [useFetch](https://nuxt.com/docs/api/composables/use-fetch) - Nuxt's built-in data fetching with caching
- [$fetch](https://nuxt.com/docs/api/utils/dollarfetch) - Underlying requests without managed Query state
- [useAsyncData](https://nuxt.com/docs/api/composables/use-async-data) - Custom async operations

The following subsections describe how the [Pinia Colada Reference](../../apps/reference/bulletproof-nuxt-pinia-colada/README.md) composes server state. They are variant-specific examples rather than canonical app behavior. See the [Pinia Colada Practices](../practices/pinia-colada/index.md) for reusable decision boundaries and guidance.

### Query Organization

In the Pinia Colada Reference, feature-owned Query factories define Query keys, request behavior, and cache options. Pages and components use those shared Query options instead of defining their own copies. See [Organize Queries by Domain with `defineQueryOptions()`](../practices/pinia-colada/query-organization.md) for the reusable organization guidance.

### Query Prefetching

In the Pinia Colada Reference, the Discussions list can start the selected Discussion detail Query before navigation finishes. The detail page and view use the same Query options after navigation, so they can use the prefetched result or reuse the request while it is still running. Navigation continues without waiting for the prefetch.

See [Use Query Prefetching to Reduce Waiting for Data](../practices/pinia-colada/use-query-prefetching-to-reduce-waiting-for-data.md) for the reusable timing, Query reuse, and fallback guidance.

### Accumulated Comments State

In the Pinia Colada Reference, comments keep accumulated pages in one feature-owned Infinite Query so later pages append to the current list.

[Comments State](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/queries/comments.ts)

### Mutation Organization

In the Pinia Colada Reference, Mutation definitions use `defineMutationOptions()` in domain-specific files. Components pass
those options to `useMutation()` and own the interaction associated with executing the
Mutation. Mutation functions wait for write requests to complete, and components wait for
`mutateAsync()` before continuing their success interactions. Related Query invalidation
remains with the domain Mutation definition and continues in the background after a
successful write. See [Wait for Mutation Requests to
Complete](../practices/pinia-colada/wait-for-mutation-requests-to-complete.md)
and [Synchronize Related Queries in the Background After Successful
Writes](../practices/pinia-colada/synchronize-related-queries-in-the-background-after-successful-writes.md).

### Auth Session Synchronization

Nuxt Auth Utils manages the cookie-backed authentication session, logged-in state, and current user. In the Pinia Colada Reference, login, registration, and profile Mutations await `useUserSession().fetch()` after their write succeeds. Logout awaits `useUserSession().clear()` before reloading the public route, while a protected request that returns `401 Unauthorized` reloads the current route so session state and route access are read again.

See [Use Nuxt Auth Utils for Authentication Session Management with Pinia Colada](../practices/pinia-colada/keep-authentication-session-state-in-nuxt-auth-utils.md) for the reusable Query Cache and session lifecycle guidance.

## Form State

Forms are a crucial part of any application, and managing form state effectively is essential for a seamless user experience. This project uses Regle with Zod v4 for type-safe form validation.

Good Form Libraries for Vue:

- [Regle](https://reglejs.dev/) - Used in this project
- [VeeValidate](https://vee-validate.logaretm.com/v4/) - See [apps/reference/bulletproof-nuxt-veevalidate](../../apps/reference/bulletproof-nuxt-veevalidate/README.md)
- [TanStack Form](https://tanstack.com/form/) - See [apps/reference/bulletproof-nuxt-tanstack-form](../../apps/reference/bulletproof-nuxt-tanstack-form/README.md)
- [Formwerk](https://formwerk.dev/) - See [apps/reference/bulletproof-nuxt-formwerk](../../apps/reference/bulletproof-nuxt-formwerk/README.md)
- [FormKit](https://formkit.com/)
- [vuelidate](https://vuelidate-next.netlify.app/)

Validation libraries:

- [zod](https://github.com/colinhacks/zod) - Used in this project
- [yup](https://github.com/jquense/yup)

[Form Example Code](../../apps/bulletproof-nuxt/app/components/form/Form.vue)

## URL State

URL state refers to the data stored and manipulated within the address bar of the browser. This state is commonly managed through URL parameters (e.g., /app/${dynamicParam}) or query parameters (e.g., /app?page=1). Nuxt's built-in router (based on Vue Router) provides composables to access and control the URL state.

- [useRoute](https://nuxt.com/docs/api/composables/use-route) - Access current route params and query
- [useRouter](https://nuxt.com/docs/api/composables/use-router) - Navigate and manipulate URL

[Pinia Colada Reference URL State Example](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/pages/app/discussions/[id].vue)
