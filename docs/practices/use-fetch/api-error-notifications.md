---
title: Handle API Error Notifications in Custom Fetchers
semanticId: api-error-notifications
category: failure-and-workflow-outcomes
prerequisites: [custom-api-fetchers]
status: confirmed
---

# Handle API Error Notifications in Custom Fetchers

## Practice

Apply the application's common API failure-notification rules through the configured `useAPI` and `$api` error hooks. Share error resolution, support per-request suppression or message overrides, keep intentional cancellation silent, and carry server-rendered notifications through hydration.

## Apply When

- API request failures should appear through a common notification.
- Requests need common error-message, notification-suppression, or cancellation rules.
- Caller-specific hooks must run alongside common notification hooks.
- A request failure during server rendering should appear after hydration.

## Do Not Apply When

- The feedback is an input-validation message rather than an API request failure.
- The interaction needs its own explanation or recovery guidance instead of a common notification.
- The request explicitly suppresses the global notification.
- The app intentionally cancels a request because the user navigated away or the requested data changed.

## Why

Without one notification contract, error extraction, cancellation handling, suppression, and hydration behavior drift across callers. Applying those rules in both configured fetchers gives page reads and imperative requests consistent failure presentation while leaving feature-specific recovery with the interaction owner.

## Implementation Guidance

- Create notifications from `onRequestError` and `onResponseError` hooks on both configured fetchers.
- Share the resolver that turns a transport or API error into notification content.
- Compose caller-provided hooks with the common hooks rather than replacing either set.
- Let each request override notification content or suppress the notification.
- Detect intentional cancellation, including nested cancellation causes, and do not notify it as a failure.
- Store notifications created during SSR in Nuxt state and display them after hydration.
- Keep form validation, feature success, refresh completion, dialogs, navigation, and session lifecycle outside this failure-notification contract.

## Minimal Nuxt Example

```ts
const resolveNotification = (error: unknown) => {
  if (isIntentionalCancellation(error)) return;

  return {
    type: "error" as const,
    title: "Request failed",
    message: getApiErrorMessage(error),
  };
};

const reportError = (error: unknown) => {
  const notification = resolveNotification(error);
  if (notification) useNotifications().addNotification(notification);
};

export const useAPI = createUseFetch(() => ({
  onRequestError: ({ error }) => reportError(error),
  onResponseError: ({ response }) => reportError(response._data),
}));
```

## Verified App Examples

- [`useAPI`](../../../apps/bulletproof-nuxt/layers/base/app/composables/useAPI.ts) reports failures from page-rendering API reads.
- [`$api`](../../../apps/bulletproof-nuxt/layers/base/app/plugins/api.ts) applies the same rules to imperative API requests.
- The shared [notification resolver](../../../apps/bulletproof-nuxt/layers/base/app/utils/apiNotifications.ts) handles message resolution, suppression, and cancellation.
- Notifications created during SSR pass through Nuxt state and appear from the [app root](../../../apps/bulletproof-nuxt/app/app.vue) after hydration.

## Trade-offs and Limitations

Custom fetchers that never run during SSR do not need hydration handoff for their notifications.

## Sources

- [Nuxt custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [ofetch interceptors](https://github.com/unjs/ofetch#interceptors)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
