# ⚠️ Error Handling

## API Errors

Since Nuxt is a full-stack framework, error handling should be implemented on both the server and client sides. On the server side, use H3's `createError` to throw consistent HTTP errors with proper status codes.

Page-read failures currently enter the notification system through the configured `useAPI` client. Imperative request failures enter through the `$api` plugin. Both use the notification utilities and state in the base layer.

[Configured Read Client](../layers/base/app/composables/useAPI.ts)

[API Plugin](../layers/base/app/plugins/api.ts)

[Notification State](../layers/base/app/composables/useNotifications.ts)

[Server-Side Error Example Code](../layers/discussions/server/api/discussions/[id].get.ts)

[Client-Side Error Handling Example Code](../layers/discussions/app/composables/useCreateDiscussion.ts)

See [Use Configured API Fetchers for App-Owned Requests](../../../docs/practices/use-fetch/custom-api-fetchers.md) for the base client entry points and [Handle API Error Notifications in Custom Fetchers](../../../docs/practices/use-fetch/api-error-notifications.md) for their notification hooks.

## Mutation and Follow-Up Errors

Interaction-owning components call direct feature actions and coordinate with the affected read owner. See [Use Imperative API Requests for Application Operations](../../../docs/practices/use-fetch/imperative-api-requests.md) for the confirmed request ownership boundary and [State Management](./state-management.md) for app-specific state placement.

## In-App Errors

Nuxt provides a built-in error handling system with the `error.vue` page for fatal errors. For component-level errors, Vue's `onErrorCaptured` lifecycle hook can be used to catch and handle errors locally without disrupting the entire application.

Feature components render the AsyncData state supplied by their read composables. Common notification presentation is owned by the base notification center.

[Error Page Example Code](../app/error.vue)

## Error Tracking

You should track any errors that occur in production. Although it's possible to implement your own solution, it is a better idea to use tools like [Sentry](https://sentry.io/). It will report any issue that breaks the app. You will also be able to see on which platform, browser, etc. did it occur. Make sure to upload source maps to Sentry to see where in your source code did the error happen.

[Sentry Nuxt Integration](https://docs.sentry.io/platforms/javascript/guides/nuxt/)
