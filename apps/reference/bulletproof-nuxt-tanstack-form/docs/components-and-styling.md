# 🧱 Components And Styling

## Components Best Practices

#### Colocate things as close as possible to where it's being used

Keep components, functions, styles, state, etc. as close as possible to where they are being used. This will not only make your codebase more readable and easier to understand but it will also improve your application performance since it will reduce redundant re-renders on state updates.

#### Stay consistent

Keep your code style consistent. Vue and Nuxt provide official style guides and conventions that are worth following. For example, component naming (PascalCase for SFC filenames), prop definitions, and directory structure all have recommended patterns. Most of code consistency is achieved by using linters and code formatters, so make sure you have them set up in your project.

- [Vue Style Guide](https://vuejs.org/style-guide/)
- [Nuxt Directory Structure](https://nuxt.com/docs/guide/directory-structure)

#### Limit the number of props a component is accepting as input

If your component is accepting too many props you might consider splitting it into multiple components or use the composition technique via children or slots.

[Composition Example Code](../layers/base/app/components/ui/Dialog/Dialog.vue)

#### Abstract shared components into a component library

For larger projects, it is a good idea to build abstractions around all the shared components. It makes the application more consistent and easier to maintain. Identify repetitions before creating the components to avoid wrong abstractions.

[Component Library Example Code](../layers/base/app/components/ui/Button.vue)

It is a good idea to wrap 3rd party components as well in order to adapt them to the application's needs. It might be easier to make the underlying changes in the future without affecting the application's functionality.

[3rd Party Component Example Code](../layers/base/app/components/ui/Link.vue)

## Component libraries

Every project requires some UI components such as modals, tabs, sidebars, menus, etc. Instead of building those from scratch, you might want to use some of the existing, battle-tested component libraries.

#### Fully featured component libraries

These component libraries come with their components fully styled.

- [PrimeVue](https://primevue.org/) - Comprehensive Vue UI library with a lot of components. Great for enterprise applications.

- [Vuetify](https://vuetifyjs.com/) - Material Design component framework for Vue. Has a lot of different components and is well documented.

- [Naive UI](https://www.naiveui.com/) - Modern Vue 3 component library with TypeScript support and good customization options.

- [Element Plus](https://element-plus.org/) - A Vue 3 based component library for enterprise-grade applications.

#### Headless component libraries

These component libraries come with their components unstyled. If you have a specific design system to implement, it might be easier and better solution to go with headless components that come unstyled than to adapt a fully featured component library such as Vuetify to your needs. Some good options are:

- [Reka UI](https://reka-ui.com/)
- [Headless UI](https://headlessui.dev/)

## Styling Solutions

There are multiple ways to style a Vue application. Some good options are:

- [Tailwind CSS](https://tailwindcss.com/) - Used in this project
- [UnoCSS](https://unocss.dev/)
- [CSS modules](https://vuejs.org/api/sfc-css-features.html#css-modules)
- [Scoped CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css)

With the rise of headless component libraries, there is another tier of component libraries where predefined components are provided with styling solutions included, but instead of being installed as a package, they are provided as code which can be customized and styled as needed.

- [shadcn-vue](https://www.shadcn-vue.com/)
- [Inspira UI](https://inspira-ui.com/)

## Storybook

[Storybook](https://storybook.js.org/) is a great tool for developing and testing components in isolation. Think of it as a catalogue of all the components your application is using. Very useful for developing and discoverability of components.

[Storybook Vue Guide](https://storybook.js.org/docs/get-started/frameworks/vue3-vite)
