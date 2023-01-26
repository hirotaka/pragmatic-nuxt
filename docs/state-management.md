# 🗃️ State Management

There is no need to keep all of your state in a single centralized store. There are different needs for different types of state that can be split into several types:

## Component State

This is the state that only a component needs, and it is not meant to be shared anywhere else. But you can pass it as prop to children components if needed. Most of the time, you want to start from here and lift the state up if needed elsewhere. For this type of state, you will usually need:

- [ref](https://vuejs.org/api/reactivity-core.html#ref) - for simpler states that are independent
- [reactive](https://vuejs.org/api/reactivity-core.html#reactive) - for more complex states where on a single action you want to update several pieces of state

[Component State Example Code](../src/components/Layout/MainLayout.vue)

## Application State

This is the state that controls interactive parts of an application. Opening modals, notifications, changing color mode, etc. For best performance and maintainability, keep the state as close as possible to the components that are using it. Don't make everything global out of the box.

Good Application State Solutions:

- [Provide / Inject](https://vuejs.org/guide/components/provide-inject.html)
- [Vuex](https://vuex.vuejs.org)
- [Pinia](https://pinia.vuejs.org/)
- [mobx](https://mobx.js.org)
- [xstate](https://xstate.js.org/)

[UI State Example Code](../src/stores/notifications.ts)

## Server Cache State

This is the state that comes from the server which is being cached on the client for further usage. It is possible to store remote data inside a state management store such as redux, but there are better solutions for that.

Good Server Cache Libraries:

- [TanStack Qury](https://tanstack.com/query/v4) - REST + GraphQL
- [apollo client](https://www.apollographql.com/) - GraphQL
- [urql](https://formidable.com/open-source/urql/) - GraphQl

[Server State Example Code](../src/features/discussions/api/getDiscussions.ts)

## Form State

This is a state that tracks users inputs in a form.

Forms in Vue can be deleade with [v-model](https://vuejs.org/guide/essentials/forms.html).

Depending on the application needs, they might be pretty complex with many different fields which require validation.

Although it is possible to build any form using only React, there are pretty good solutions out there that help with handling forms such as:

- [VeeValidate](https://vee-validate.logaretm.com/)
- [Vue Hooks Form](https://beizhedenglong.github.io/vue-hooks-form/)
- [Formik](https://formkit.com/)

Create abstracted `BaseForm` component and all the input field components that wrap the library functionality and are adapted to the application needs. You can reuse it then throughout the application.

[Form Example Code](../src/components/Form/BaseForm.vue)

[Input Field Example Code](../src/components/Form/InputField.vue)

You can also integrate validation libraries with the mentioned solutions to validate inputs on the client. Some good options are:

- [zod](https://github.com/colinhacks/zod)
- [yup](https://github.com/jquense/yup)

[Validation Example Code](../src/features/auth/components/RegisterForm.vue)

## URL State

State that is being kept in the address bar of the browser. It is usually tracked via url params (`/app/${dynamicParam}`) or query params (`/app?dynamicParam=1`). It can be accessed and controlled via your routing solution such as `vue-router`.

[URL State Example Code](../src/features/discussions/routes/Discussion.vue)
