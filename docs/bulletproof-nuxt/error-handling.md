# ⚠️ Error Handling

### API Errors

Server routes return HTTP errors with appropriate statuses. The app's custom fetchers present request failures; authentication-session operations remain outside those fetchers.

See [Present API Failures from Custom Fetchers](../practices/nuxt-use-fetch/api-error-notifications.md) and [Separate Completed Changes from Data Refresh Failures](../practices/nuxt-use-fetch/completed-change-refresh-failures.md).

### In-App Errors

Nuxt's [app/error.vue](../../apps/bulletproof-nuxt/app/error.vue) handles full-screen errors and offers a Home recovery action without exposing internal server messages. Vue's `onErrorCaptured` supports component-local error handling.

See [Provide a Recovery Path from Nuxt Error Pages](../practices/nuxt/provide-a-recovery-path-from-nuxt-error-pages.md).

### Error Tracking

Production error tracking requires a separately configured service. [Sentry's Nuxt integration](https://docs.sentry.io/platforms/javascript/guides/nuxt/) is one option; source maps help locate errors in the original code.
