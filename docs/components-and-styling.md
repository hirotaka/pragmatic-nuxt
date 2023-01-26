# 🧱 Components And Styling

## Components Best Practices

#### Colocate things as close as possible to where it's being used

Keep components, functions, styles, state, etc. as close as possible to the component where it's being used. This will not only make your codebase more readable and easier to understand but it will also improve your application performance since it will reduce redundant re-renders on state updates.

#### Stay consistent

Keep your code style consistent. e.g If you name your components by using pascal case, do it everywhere. More on this can be found [here](./style-guide.md)

#### Limit the number of props a component is accepting as input

If your component is accepting too many props you might consider splitting it into multiple components or use the composition technique via children or slots.

[Composition Example Code](../src/components/Elements/ConfirmationDialog.vue)

#### Abstract shared components into a component library

For larger projects, it is a good idea to build abstractions around all the shared components. It makes the application more consistent and easier to maintain. Identify repetitions before creating the components to avoid wrong abstractions.

[Component Library Example Code](../src/components/Elements/BaseButton.vue)

It is a good idea to wrap 3rd party components as well in order to adapt them to the application's needs. It might be easier to make the underlying changes in the future without affecting the application's functionality.

[3rd Party Component Example Code](../src/components/Elements/BaseLink.vue)

## Component libraries

Every project requires some UI components such as modals, tabs, sidebars, menus, etc. Instead of building those from scratch, you might want to use some of the existing, battle-tested component libraries.

#### Fully featured component libraries:

These component libraries come with their components fully styled.

- [Chakra UI Vue](https://vue.chakra-ui.com/) - great library with probably the best developer experience, allows very fast prototyping with decent design defaults. Plenty of components that are very customizable and flexible with accessibility already configured out of the box. Chakara UI for Vue3 is work in progress. You can check the latest status on thre [repository](https://github.com/chakra-ui/chakra-ui-vue-next).

- [Ant Design Vue](https://antdv.com/) - another great component library that has a lot of different components. Best suitable for creating admin dashboards. However, it might be a bit difficult to change the styles in order to adapt them to a custom design.

- [VUETIFY](https://vuetifyjs.com/) - the most popular component library for Vue. Has a lot of different components. Can be used as a styled solution by implementing Material Design or as unstyled headless component library.

#### Headless component libraries:

These component libraries come with their components unstyled. If you have a specific design system to implement, it might be easier and better solution to go with headless components that come unstyled than to adapt a styled components library such as Material UI to your needs. Some good options are:

- [Headless UI](https://headlessui.dev/)

## Styling Solutions

Scoped CSS works well to stylevVue application. But, there are still some good options:

- [tailwind](https://tailwindcss.com/)
- [vue-styled-components](https://github.com/styled-components/vue-styled-components)
- [vue-emotion](https://github.com/egoist/vue-emotion)
- [vanilla-extract](https://github.com/seek-oss/vanilla-extract)
- [CSS modules](https://github.com/css-modules/css-modules)

## Good combinations

Some good combinations of component library + styling

- [Chakra UI Vue](https://vue.chakra-ui.com/) + [emotion](https://emotion.sh/docs/introduction) - The best choice for most applications
- [Headless UI](https://headlessui.dev/) + [tailwind](https://tailwindcss.com/)

## Storybook

[Storybook](https://storybook.js.org/) is a great tool for developing and testing components in isolation. Think of it as a catalogue of all the components your application is using. Very useful for developing and discoverability of components.

[Storybook Story Example Code](../src/stories/components/Elements/Button.stories.ts)
