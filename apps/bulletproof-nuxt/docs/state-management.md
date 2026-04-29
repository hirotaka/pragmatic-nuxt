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

[Application State Example Code](../layers/base/app/composables/useNotifications.ts)

## Server Cache State

The Server Cache State refers to the data retrieved from the server that is stored locally on the client-side for future use. Nuxt provides built-in data fetching composables that handle caching, deduplication, and SSR automatically.

Good Server Cache Solutions for Nuxt:

- [useFetch](https://nuxt.com/docs/api/composables/use-fetch) - Built-in data fetching with caching (used in this project)
- [$fetch](https://nuxt.com/docs/api/utils/dollarfetch) - For mutations and non-cached requests
- [useAsyncData](https://nuxt.com/docs/api/composables/use-async-data) - For custom async operations
- [Pinia Colada](https://pinia-colada.esm.dev/) - See [apps/reference/bulletproof-nuxt-pinia-colada](../../reference/bulletproof-nuxt-pinia-colada/README.md)

[Server Cache State Example Code](../layers/discussions/app/composables/useDiscussions.ts)

## Form State

Forms are a crucial part of any application, and managing form state effectively is essential for a seamless user experience. This project uses Regle with Zod v4 for type-safe form validation.

Good Form Libraries for Vue:

- [Regle](https://reglejs.dev/) - Used in this project
- [VeeValidate](https://vee-validate.logaretm.com/v4/) - See [apps/reference/bulletproof-nuxt-veevalidate](../../reference/bulletproof-nuxt-veevalidate/README.md)
- [TanStack Form](https://tanstack.com/form/) - See [apps/reference/bulletproof-nuxt-tanstack-form](../../reference/bulletproof-nuxt-tanstack-form/README.md)
- [Formwerk](https://formwerk.dev/) - See [apps/reference/bulletproof-nuxt-formwerk](../../reference/bulletproof-nuxt-formwerk/README.md)
- [FormKit](https://formkit.com/)
- [vuelidate](https://vuelidate-next.netlify.app/)

Validation libraries:

- [zod](https://github.com/colinhacks/zod) - Used in this project
- [yup](https://github.com/jquense/yup)

[Form Example Code](../layers/base/app/components/ui/Form.vue)

## URL State

URL state refers to the data stored and manipulated within the address bar of the browser. This state is commonly managed through URL parameters (e.g., /app/${dynamicParam}) or query parameters (e.g., /app?page=1). Nuxt's built-in router (based on Vue Router) provides composables to access and control the URL state.

- [useRoute](https://nuxt.com/docs/api/composables/use-route) - Access current route params and query
- [useRouter](https://nuxt.com/docs/api/composables/use-router) - Navigate and manipulate URL

[URL State Example Code](../layers/discussions/app/pages/app/discussions/[id].vue)
