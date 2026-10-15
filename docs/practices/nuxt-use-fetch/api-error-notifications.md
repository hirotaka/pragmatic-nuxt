---
title: Present API Failures from Custom Fetchers
semanticId: api-error-notifications
category: failure-and-workflow-outcomes
prerequisites: [custom-api-fetchers]
status: confirmed
---

# Present API Failures from Custom Fetchers

## Practice

A shared API failure presentation policy in custom fetchers keeps failure handling consistent across requests. Failed reads during SSR go to the Nuxt error page with the response status. In the browser, unexpected failures go to the error page. Predictable failures are reported on the page where the user is working, without switching to an error page, when the user can continue working there, for example by correcting input or selecting another item. Intentional cancellation produces no error page or message.

## Apply When

- The application uses custom fetchers for page data and API operations.
- A failed read during SSR prevents the page from displaying its required data.
- After a predictable API failure in the browser, the user can continue working on the page by correcting input or selecting another item.
- Multiple requests need the same failure presentation policy.

## Do Not Apply When

- A page can display a useful fallback for a failed optional read.
- A domain operation needs a specific recovery flow instead of the shared failure policy.
- The feedback belongs beside a form field rather than in a notification or error page.

## Why

When components decide separately how to display API failures, one may open an error page while another shows a message for the same kind of failure. A shared policy in custom fetchers keeps that choice consistent across requests.

During SSR, the HTML and HTTP status are the initial response to a page request. If a required resource is not found, an error page with HTTP 404 reflects that failure instead of returning an incomplete normal page with HTTP 200.

In the browser, a user who entered invalid input can correct it on the same page. Showing the failure there preserves that interaction. An unexpected failure that prevents the user from continuing instead calls for an error page.

## Implementation Guidance

- Capture `useNuxtApp()` inside the `createUseFetch()` defaults callback and use its `runWithContext()` when an error hook calls `showError()`.
- Send failed reads during SSR to the error page using the HTTP response status, with a fallback status for failures without a response.
- Classify browser failures before choosing an error page or a message on the same page, and treat intentional cancellation as a separate outcome.
- Allow requests to customize or suppress messages for predictable browser failures while preserving error pages for SSR failures and unexpected browser failures.
- Run request-specific error hooks after the shared hook when callers need additional cleanup.

## Minimal Nuxt Example

The `onResponseError` hook below sends a failed read to the error page during SSR. In the browser, this example sends 5xx responses to the error page and treats 4xx responses as predictable failures, displaying them with a toast without leaving the page.

```ts
// app/composables/useApi.ts
import { toast } from 'vue-sonner'

export const useApi = createUseFetch(() => {
  const nuxtApp = useNuxtApp()

  return {
    onResponseError({ response }) {
      const error = {
        statusCode: response.status,
        statusMessage: 'Unable to load data',
      }

      if (import.meta.server || response.status >= 500) {
        nuxtApp.runWithContext(() => showError(error))
        return
      }

      toast.error(error.statusMessage)
    },
  }
})
```

The Nuxt app is captured while the composable has access to its context, rather than looked up after the request fails. This example focuses on HTTP response failures; request failures, cancellation, notification overrides, and caller hooks need their own handling in a complete custom fetcher.

## App Examples

- [`useAPI.ts`](../../../apps/bulletproof-nuxt/app/composables/useAPI.ts) selects SSR error pages and browser notifications from the shared read hooks.
- [`api.ts`](../../../apps/bulletproof-nuxt/app/plugins/api.ts) presents failures from imperative API requests in the browser.
- [`apiNotifications.ts`](../../../apps/bulletproof-nuxt/app/utils/apiNotifications.ts) classifies unexpected failures and excludes intentional cancellation from presentation.

## Trade-offs and Limitations

Showing an error page for a failed read during SSR replaces the requested page instead of keeping it available for interaction. Another approach is to render the requested page with an error state and hydrate it, so the failure can be handled there without switching to a separate error page.

## Sources

- [Nuxt `showError`](https://nuxt.com/docs/4.x/api/utils/show-error)
- [Nuxt `useNuxtApp` and `runWithContext`](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#runwithcontext)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt `createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch)

## Related Practices

- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Separate Completed Changes from Data Refresh Failures](completed-change-refresh-failures.md)
