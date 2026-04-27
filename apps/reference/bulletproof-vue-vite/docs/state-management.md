# 🗃️ State Management

Managing state effectively is crucial for optimizing your application's performance. Instead of storing all state information in a single centralized repository, consider dividing it into various categories based on their usage. By categorizing your state, you can streamline your state management process and enhance your application's overall efficiency.

## Component State

Component state is specific to individual components and should not be shared globally. It can be passed down to child components as props when necessary. Typically, you should begin by defining state within the component itself and consider elevating it to a higher level if it's required elsewhere in the application. When managing component state, you can use the following Vue APIs:

- [ref](https://vuejs.org/api/reactivity-core.html#ref) - for simpler states that are independent
- [reactive](https://vuejs.org/api/reactivity-core.html#reactive) - for more complex states where on a single action you want to update several pieces of state

[Component State Example Code](../src/components/layouts/dashboard-layout.vue)

## Application State

Application state manages global parts of an application, such as controlling global modals, notifications, and toggling color modes. To ensure optimal performance and ease of maintenance, it is advisable to localize the state as closely as possible to the components that require it. Avoid unnecessarily globalizing all state variables from the outset to maintain a structured and efficient state management architecture.

Good Application State Solutions:

- [Provide / Inject](https://vuejs.org/guide/components/provide-inject.html)
- [Pinia](https://pinia.vuejs.org/) - the officially recommended state management library for Vue
- [VueUse](https://vueuse.org/) - collection of useful composables

[Global State Example Code](../src/components/ui/notifications/notifications-store.ts)

## Server Cache State

The Server Cache State refers to the data retrieved from the server that is stored locally on the client-side for future use. While it is feasible to cache remote data within a state management store like Pinia, there exist more optimal solutions to this practice. It is essential to consider more efficient caching mechanisms to enhance performance and optimize data retrieval processes.

Good Server Cache Libraries:

- [TanStack Query](https://tanstack.com/query) - REST + GraphQL
- [apollo client](https://apollo.vuejs.org/) - GraphQL
- [urql](https://formidable.com/open-source/urql/) - GraphQL
- [swrv](https://docs-swrv.netlify.app/) - Vue port of SWR

[Server Cache State Example Code](../src/features/discussions/api/get-discussions.ts)

## Form State

Forms are a crucial part of any application, and managing form state effectively is essential for a seamless user experience. When handling form state, consider using libraries to streamline the process. These libraries provide built-in validation, error handling, and form submission functionalities, making it easier to manage form state within your application.

Forms in Vue can be handled with [v-model](https://vuejs.org/guide/essentials/forms.html).

Depending on the application needs, they might be pretty complex with many different fields that require validation.

Although it is possible to build any form using only Vue primitives, there are some good solutions out there that help with handling forms such as:

- [VeeValidate](https://vee-validate.logaretm.com/) - form validation library for Vue
- [FormKit](https://formkit.com/) - form building framework for Vue

Create abstracted Form component and all the input field components that wrap the library functionality and are adapted to the application needs.

[Form Example Code](../src/components/ui/form/form.vue)

[Input Field Example Code](../src/components/ui/form/input.vue)

You can also integrate validation libraries with the mentioned solutions to validate inputs on the client. Some good options are:

- [zod](https://github.com/colinhacks/zod)
- [yup](https://github.com/jquense/yup)
- [valibot](https://valibot.dev/)

[Validation Example Code](../src/features/auth/components/register-form.vue)

## URL State

URL state refers to the data stored and manipulated within the address bar of the browser. This state is commonly managed through URL parameters (e.g., /app/${dynamicParam}) or query parameters (e.g., /app?dynamicParam=1). By incorporating routing solutions like vue-router, you can effectively access and control the URL state, enabling dynamic manipulation of application parameters directly from the browser's address bar.

[URL State Example Code](../src/features/discussions/components/discussion-view.vue)
