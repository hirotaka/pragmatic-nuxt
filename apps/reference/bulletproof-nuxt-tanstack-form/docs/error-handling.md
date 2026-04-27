# ⚠️ Error Handling

## API Errors

Since Nuxt is a full-stack framework, error handling should be implemented on both the server and client sides. On the server side, use H3's `createError` to throw consistent HTTP errors with proper status codes. On the client side, handle errors from `useFetch` or `$fetch` calls and display appropriate notifications to users.

Implement error handling in composables to manage errors effectively. This can be utilized to trigger notification toasts informing users of errors, redirect unauthorized users, or handle specific error scenarios gracefully.

[Server-Side Error Example Code](../layers/discussions/server/api/discussions/[id].get.ts)

[Client-Side Error Handling Example Code](../layers/discussions/app/composables/useCreateDiscussion.ts)

## In-App Errors

Nuxt provides a built-in error handling system with the `error.vue` page for fatal errors. For component-level errors, Vue's `onErrorCaptured` lifecycle hook can be used to catch and handle errors locally without disrupting the entire application. You can also use `useFetch`'s error state to handle data fetching errors gracefully in templates.

Consider placing error handling at different levels of your application. This way, if an error occurs, it can be contained and managed locally, ensuring a smoother user experience.

[Error Page Example Code](../app/error.vue)

## Error Tracking

You should track any errors that occur in production. Although it's possible to implement your own solution, it is a better idea to use tools like [Sentry](https://sentry.io/). It will report any issue that breaks the app. You will also be able to see on which platform, browser, etc. did it occur. Make sure to upload source maps to Sentry to see where in your source code did the error happen.

[Sentry Nuxt Integration](https://docs.sentry.io/platforms/javascript/guides/nuxt/)
