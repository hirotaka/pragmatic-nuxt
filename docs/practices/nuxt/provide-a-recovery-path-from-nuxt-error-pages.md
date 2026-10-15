---
title: Provide a Recovery Path from Nuxt Error Pages
semanticId: provide-a-recovery-path-from-nuxt-error-pages
category: failure-and-workflow-outcomes
prerequisites: []
status: confirmed
---

# Provide a Recovery Path from Nuxt Error Pages

## Practice

A recovery action on Nuxt's full-screen error page gives users a way to continue using the application when the requested page cannot be displayed. The action clears the active error and takes the user to a known working page.

## Apply When

- Nuxt displays a full-screen error page after a page failure.
- The application customizes its error page.
- A destination is available that does not require the resource that failed to load.

## Do Not Apply When

- The failure can be handled within the current page or component without opening a full-screen error page.
- Recovery requires a domain-specific workflow rather than leaving the error page.

## Why

A full-screen error page replaces the requested page. A failure message explains what happened, but does not give the user an action to continue using the application.

An error page can appear after a direct page request, so there may be no previous page in the application to return to. A designated destination provides a recovery target without depending on browser history.

Nuxt provides a helper that explicitly clears the handled error and redirects to that destination. The recovery action expresses both operations instead of leaving error cleanup implicit in ordinary navigation.

## Implementation Guidance

- Customize the full-screen error page in `app/error.vue`, alongside `app/app.vue`.
- Choose a recovery destination that can render without the resource that failed to load.
- Connect a visible recovery action to `clearError({ redirect: destination })`.
- Display user-facing text for unexpected failures instead of raw internal error messages.
- Verify that the recovery action reaches the destination and clears Nuxt's handled error state.

## Minimal Nuxt Example

This error page offers a Home action when the requested page cannot be displayed. The example assumes that `/` can be rendered without the resource that failed to load.

```vue
<!-- app/error.vue -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error?: NuxtError }>()
const isNotFound = computed(() => props.error?.statusCode === 404)
const heading = computed(() => isNotFound.value
  ? 'Page Not Found'
  : 'Unable to Display This Page')
const message = computed(() => isNotFound.value
  ? 'This page could not be found.'
  : 'Something went wrong. Please try again.')
const recover = () => clearError({ redirect: '/' })
</script>

<template>
  <main>
    <h1>{{ heading }}</h1>
    <p>{{ message }}</p>
    <button type="button" @click="recover">
      Go to Home
    </button>
  </main>
</template>
```

The button invokes Nuxt's error-clearing helper with a destination, rather than only requesting a route change. The example supplies its own visible text instead of displaying the raw error message. Home is this example's destination, not a required route for every application.

## App Examples

- [`error.vue`](../../../apps/bulletproof-nuxt/app/error.vue) provides a Home action using `clearError({ redirect: '/' })`.

## Trade-offs and Limitations

Redirecting to a designated page leaves the failed page rather than restoring its interrupted interaction. Returning through browser history is an alternative when an earlier working page is available, but a direct visit may have no previous application page.

## Sources

- [Nuxt Error Handling](https://nuxt.com/docs/4.x/getting-started/error-handling)
- [Nuxt `clearError`](https://nuxt.com/docs/4.x/api/utils/clear-error)

## Related Practices

- [Present API Failures from Custom Fetchers](../nuxt-use-fetch/api-error-notifications.md)
