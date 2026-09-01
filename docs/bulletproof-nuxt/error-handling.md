# ⚠️ Error Handling

## API Errors

Since Nuxt is a full-stack framework, error handling should be implemented on both the server and client sides. On the server side, use H3's `createError` to throw consistent HTTP errors with proper status codes.

App-owned API requests use the shared custom `$fetch` instance provided as `$api`. It forwards the current SSR request context and propagates ofetch failures without app-specific transformation. Pinia Colada Query and Mutation error hooks remain the shared client-side notification and protected-session recovery owner.

See [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](../practices/pinia-colada/shared-custom-fetch.md) for the reusable transport guidance.

[API Plugin](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/base/app/plugins/api.ts)

[Notification State](../../apps/bulletproof-nuxt/layers/base/app/composables/useNotifications.ts)

[Server-Side Error Example Code](../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/[id].get.ts)

[Client-Side Error Handling Example Code](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)

On protected routes, the shared Pinia Colada error hooks treat `401 Unauthorized` as a missing or expired session and reload the current route. Other errors continue through the normal notification flow. Nuxt Auth Utils manages session refresh and clear operations outside the app transport.

See [Use Nuxt Auth Utils for Authentication Session Management with Pinia Colada](../practices/pinia-colada/keep-authentication-session-state-in-nuxt-auth-utils.md) for the reusable session and protected-request recovery guidance.

## Mutation and Follow-Up Errors

Interaction-owning components call domain Mutation options and own the interaction associated
with executing the Mutation. Related Query invalidation remains with the domain Mutation
definition. A refetch failure after a successful write remains a Query error and does not
change the completed write into a Mutation failure. See [State Management](./state-management.md)
for app-specific state placement and [Synchronize Related Queries in the Background After
Successful Writes](../practices/pinia-colada/synchronize-related-queries-in-the-background-after-successful-writes.md)
for the reusable timing and failure boundary.

## In-App Errors

Nuxt provides a built-in error handling system with the `error.vue` page for fatal errors. For component-level errors, Vue's `onErrorCaptured` lifecycle hook can be used to catch and handle errors locally without disrupting the entire application.

Feature components render the Query state supplied by their Pinia Colada owners. Common notification presentation is owned by the base notification center and coordinated by the shared Colada error hooks.

A failed Discussion detail prefetch does not create a global notification while its Query entry remains inactive. Once the Query becomes active, failures retain the normal error presentation and recovery behavior. See [Use Query Prefetching to Reduce Waiting for Data](../practices/pinia-colada/use-query-prefetching-to-reduce-waiting-for-data.md) for the reusable prefetch boundary.

[Error Page Example Code](../../apps/bulletproof-nuxt/app/error.vue)

## Error Tracking

You should track any errors that occur in production. Although it's possible to implement your own solution, it is a better idea to use tools like [Sentry](https://sentry.io/). It will report any issue that breaks the app. You will also be able to see on which platform, browser, etc. did it occur. Make sure to upload source maps to Sentry to see where in your source code did the error happen.

[Sentry Nuxt Integration](https://docs.sentry.io/platforms/javascript/guides/nuxt/)
