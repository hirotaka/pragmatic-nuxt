# 🚄 Performance

### Code Splitting

Code splitting involves splitting production JavaScript into smaller files to optimize application loading times. This technique enables the application to be downloaded in parts, fetching only the necessary code when required.

Nuxt automatically handles code splitting at the route level, ensuring that only essential code is loaded initially, with additional parts fetched lazily as needed. You can also lazy load components by prefixing them with `Lazy` (e.g., `<LazyComments />`), which loads the component only when it's rendered.

[Lazy Component Documentation](https://nuxt.com/docs/guide/directory-structure/components#dynamic-components)

### Component and State Optimizations

- Do not put everything in a single state. That might trigger unnecessary re-renders. Instead split the global state into multiple states according to where they are being used.

- Keep the state as close as possible to where it is being used. This will prevent re-rendering components that do not depend on the updated state.

- Use `computed` properties for derived state. Computed values are cached and only recalculate when their dependencies change, avoiding expensive recalculations on every render.

- If your application is expected to have frequent updates that might affect performance, consider using zero runtime styling solutions like [Tailwind CSS](https://tailwindcss.com/) which generates styles during build time, rather than runtime CSS-in-JS solutions.

- For large lists, consider using virtual scrolling with [@vueuse/core](https://vueuse.org/core/useVirtualList/) to render only visible items.

[Vue Reactivity Guide](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)

### Slots as Optimization

In Vue, slots serve a similar purpose to React's children prop for optimization. Content passed through slots represents an isolated VDOM structure that doesn't need to be re-rendered by its parent when the parent's local state changes. Use slots to pass content that should remain stable across parent re-renders.

[Vue Slots Documentation](https://vuejs.org/guide/components/slots.html)

### Image Optimizations

Consider lazy loading images that are not in the viewport. Use modern image formats such as WEBP for faster image loading. Use `srcset` to load the most optimal image for the client's screen size.

Nuxt provides the `@nuxt/image` module for automatic image optimization, including format conversion, resizing, and lazy loading.

[Nuxt Image Documentation](https://image.nuxt.com/)

### Web Vitals

Since Google started taking web vitals into account when indexing websites, you should keep an eye on web vitals scores from [Lighthouse](https://web.dev/measure/) and [PageSpeed Insights](https://pagespeed.web.dev/).

### Data Prefetching

Nuxt's `useFetch` and `useAsyncData` automatically handle data fetching with SSR support and client-side caching. Data is fetched on the server during SSR and hydrated on the client, improving initial page load performance. For navigation, Nuxt automatically prefetches page data when links are visible in the viewport.

You can also use the `lazy` option to defer non-critical data fetching to the client side.

[Nuxt Data Fetching Documentation](https://nuxt.com/docs/getting-started/data-fetching)
