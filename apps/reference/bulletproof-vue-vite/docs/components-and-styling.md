# 🧱 Components And Styling

## Components Best Practices

#### Colocate things as close as possible to where it's being used

Keep components, functions, styles, state, etc. as close as possible to where they are being used. This will not only make your codebase more readable and easier to understand but it will also improve your application performance since it will reduce redundant re-renders on state updates.

#### Stay consistent

Keep your code style consistent. For example, if you name your components using kebab-case for files, do it everywhere. Most of code consistency is achieved by using linters and code formatters, so make sure you have them set up in your project.

#### Limit the number of props a component is accepting as input

If your component is accepting too many props you might consider splitting it into multiple components or use the composition technique via slots.

[Composition Example Code](../src/components/ui/dialog/confirmation-dialog/confirmation-dialog.vue)

#### Abstract shared components into a component library

For larger projects, it is a good idea to build abstractions around all the shared components. It makes the application more consistent and easier to maintain. Identify repetitions before creating the components to avoid wrong abstractions.

[Component Library Example Code](../src/components/ui/button/button.vue)

It is a good idea to wrap 3rd party components as well in order to adapt them to the application's needs. It might be easier to make the underlying changes in the future without affecting the application's functionality.

[3rd Party Component Example Code](../src/components/ui/link/link.vue)

## Component libraries

Every project requires some UI components such as modals, tabs, sidebars, menus, etc. Instead of building those from scratch, you might want to use some of the existing, battle-tested component libraries.

#### Fully featured component libraries

These component libraries come with their components fully styled.

- [Vuetify](https://vuetifyjs.com/) - the most popular component library for Vue. Has a lot of different components. Can be used as a styled solution by implementing Material Design or as unstyled headless component library.

- [PrimeVue](https://primevue.org/) - a rich set of open source UI components for Vue with multiple themes.

- [Ant Design Vue](https://antdv.com/) - another great component library that has a lot of different components. Best suitable for creating admin dashboards.

- [Naive UI](https://www.naiveui.com/) - a Vue 3 component library with TypeScript support and customizable themes.

#### Headless component libraries

These component libraries come with their components unstyled. If you have a specific design system to implement, it might be easier and better solution to go with headless components that come unstyled than to adapt a fully featured component library to your needs. Some good options are:

- [Reka UI](https://reka-ui.com/) - unstyled accessible components for Vue
- [Headless UI](https://headlessui.dev/) - unstyled, accessible components from Tailwind Labs

## Styling Solutions

There are multiple ways to style a Vue application. Some good options are:

- [tailwind](https://tailwindcss.com/)
- [UnoCSS](https://unocss.dev/)
- [vanilla-extract](https://github.com/seek-oss/vanilla-extract)
- [CSS modules](https://github.com/css-modules/css-modules)
- Scoped CSS (Vue's built-in solution)

With the rise of headless component libraries, there is another tier of component libraries where predefined components are provided with styling solutions included, but instead of being installed as a package, they are provided as code which can be customized and styled as needed.

- [shadcn-vue](https://www.shadcn-vue.com/) - Vue port of shadcn/ui
- [Park UI](https://park-ui.com/) - supports Vue

## Storybook

[Storybook](https://storybook.js.org/) is a great tool for developing and testing components in isolation. Think of it as a catalogue of all the components your application is using. Very useful for developing and discoverability of components.

[Storybook Story Example Code](../src/components/ui/button/button.stories.ts)
