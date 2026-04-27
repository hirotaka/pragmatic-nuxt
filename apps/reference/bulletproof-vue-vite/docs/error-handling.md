# ⚠️ Error Handling

### API Errors

Implement an interceptor to manage errors effectively. This interceptor can be utilized to trigger notification toasts informing users of errors, log out unauthorized users, or send requests to refresh tokens to maintain secure and seamless application operation.

[API Errors Notification Example Code](../src/lib/api-client.ts)

### In App Errors

Utilize error boundaries in Vue to handle errors within specific parts of your application. Instead of having only one error boundary for the entire app, consider placing multiple error boundaries in different areas. This way, if an error occurs, it can be contained and managed locally without disrupting the entire application's functionality, ensuring a smoother user experience.

Vue provides the `onErrorCaptured` lifecycle hook and `errorCaptured` option to handle errors in component trees. You can create an ErrorBoundary component that catches and displays errors gracefully.

[Error Boundary Example Code](../src/components/errors/error-boundary.vue)

### Error Tracking

You should track any errors that occur in production. Although it's possible to implement your own solution, it is a better idea to use tools like [Sentry](https://sentry.io/). It will report any issue that breaks the app. You will also be able to see on which platform, browser, etc. did it occur. Make sure to upload source maps to sentry to see where in your source code did the error happen.
