# 🚄 Performance

Measure before adding optimizations.

### Code Splitting

Nuxt splits code by route. Lazy components can defer optional UI; avoid adding chunks without a measured benefit.

### Component and State Optimizations

Keep state close to its callers and use `computed` for derived values. See [State Management](state-management.md) for state categories.

### Component Composition

Use Vue slots to separate layout from the content it displays.

### Image Optimizations

Lazy-load off-screen images, use suitable image formats, and provide responsive sizes with `srcset`.

### Web Vitals

Use [Lighthouse](https://web.dev/measure/) and [PageSpeed Insights](https://pagespeed.web.dev/) to inspect loading and interaction performance.

### Data Prefetching

Prefetching can reduce navigation wait, but also performs work the user may never need. Keep it consistent with the application's data-fetching model; see the [Nuxt Data Fetching Practices](../practices/nuxt-use-fetch/index.md).
