# 🚄 Performance

### Code Splitting

Code splitting involves splitting production JavaScript into smaller files to optimize application loading times. This technique enables the application to be downloaded in parts, fetching only the necessary code when required.

Ideally, code splitting should be implemented at the routes level, ensuring that only essential code is loaded initially, with additional parts fetched lazily as needed. It's important to avoid excessive code splitting, as this can lead to a performance decline due to the increased number of requests required to fetch all the code chunks. Strategic code splitting, focusing on critical parts of the application, helps balance performance optimization with efficient resource loading.

[Code Splitting Example Code](../src/router/index.ts)

### Component and state optimizations

- Do not put everything in a single state. That might trigger unnecessary re-renders. Instead split the global state into multiple stores according to where they are being used.

- Keep the state as close as possible to where it is being used. This will prevent re-rendering components that do not depend on the updated state.

- If you have a piece of state that is initialized by an expensive computation, consider initializing it lazily or caching the result:

```javascript
// instead of this which would be executed on every component creation:
const state = ref(myExpensiveFn());

// consider computing once and caching, or use a factory function
const state = ref();
if (state.value === undefined) {
  state.value = myExpensiveFn();
}
```

- If you develop an application that requires a state to track many elements at once, you might consider using [Pinia](https://pinia.vuejs.org/) stores or composables with fine-grained reactivity.

- Use Vue's provide/inject wisely. It is good for low-velocity data like themes, user data, small local state etc. Do not rush with provide/inject and global state - in many scenarios you may satisfy your needs by lifting the state up or proper composition of components.

- If your application is expected to have frequent updates that might affect performance, consider using zero runtime styling solutions ([tailwind](https://tailwindcss.com/), [UnoCSS](https://unocss.dev/), [vanilla-extract](https://github.com/seek-oss/vanilla-extract), [CSS modules](https://github.com/css-modules/css-modules) which generate styles during build time).

### Slots as the most basic optimization

- The `slots` (similar to React's `children` prop) is the most basic and easiest way to optimize your components. When applied properly, it eliminates a lot of unnecessary rerenders. The content passed via slots represents an isolated VDOM structure that does not need to be re-rendered by its parent. Example below:

```vue
<!-- Not optimized example -->
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue';
import PureComponent from './PureComponent.vue';

const count = ref(0);
</script>

<template>
  <div>
    <button @click="count++">count is {{ count }}</button>
    <PureComponent />
    <!-- will rerender whenever "count" updates -->
  </div>
</template>

<!-- Optimized example -->
<!-- App.vue -->
<template>
  <Counter>
    <PureComponent />
  </Counter>
</template>

<!-- Counter.vue -->
<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <div>
    <button @click="count++">count is {{ count }}</button>
    <slot />
    <!-- won't rerender whenever "count" updates -->
  </div>
</template>
```

### Image optimizations

Consider lazy loading images that are not in the viewport.

Use modern image formats such as WEBP for faster image loading.

Use `srcset` to load the most optimal image for the clients screen size.

### Web vitals

Since Google started taking web vitals in account when indexing websites, you should keep an eye on web vitals scores from [Lighthouse](https://web.dev/measure/) and [Pagespeed Insights](https://pagespeed.web.dev/).

### Data prefetching

It is possible to prefetch data before the user navigates to a page. This can be done by using the `queryClient.prefetchQuery` method from the `@tanstack/vue-query` library. This method allows you to prefetch data for a specific query. This can be useful when you know that the user will navigate to a specific page and you want to prefetch the data before the user navigates to the page. This can help to improve the performance of the application by reducing the time it takes to load the data when the user navigates to the page.

[Data Prefetching Example Code](../src/features/discussions/components/discussions-list.vue)
