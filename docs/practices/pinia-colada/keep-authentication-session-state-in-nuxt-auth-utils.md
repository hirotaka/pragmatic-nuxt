---
title: Use Nuxt Auth Utils for Authentication Session Management with Pinia Colada
semanticId: pinia-colada-provider-native-session-reset-boundary
category: nuxt-integration
status: confirmed
---

# Use Nuxt Auth Utils for Authentication Session Management with Pinia Colada

## Practice

In a Nuxt app that combines Pinia Colada with Nuxt Auth Utils, keep the authentication session and current user state in Nuxt Auth Utils rather than duplicating them in Pinia Colada.

Use Pinia Colada Mutations to send authentication requests. Pinia Colada can also cache protected server data and handle errors caused by an invalid session. Keep the current user and logged-in state in Nuxt Auth Utils; do not store them in Pinia Colada or another store.

After an operation changes authentication state, synchronize the session through Nuxt Auth Utils rather than through Pinia Colada. Keep provider-specific session checks in that operation's workflow. When the user chooses to log out, clear the Nuxt Auth Utils session before reloading a public route. The reload replaces the current Nuxt app instance and its Query Cache. If a protected API request reports a missing or expired session, the integration can reload the current route so the new app instance reads the session again.

## Apply When

- Nuxt Auth Utils provides the cookie-backed session and current user state, while Pinia Colada sends requests that require authentication.
- Login, registration, or a profile update changes the user information returned by the session endpoint.
- A protected API returns `401 Unauthorized` when the session is missing or expired, and route middleware handles access after the page reloads.

## Do Not Apply When

- The app uses another authentication provider with its own client-side session management. Follow that provider's session and refresh APIs instead.
- Do not reload the page for every `401 Unauthorized`. Reload only when a protected request uses the current session and the API defines `401` as a missing or expired session.
- Logout must update every open browser tab. Session refresh and page reload affect only the current tab, so cross-tab logout requires a separate mechanism.

## Why

Nuxt Auth Utils and Pinia Colada have separate responsibilities. Nuxt Auth Utils manages the cookie-backed authentication session and makes the logged-in state and current user available through `useUserSession()`. Pinia Colada caches values returned by Query requests and tracks whether Query and Mutation requests are pending, successful, or failed.

Keeping authentication session state in Nuxt Auth Utils prevents the app from storing separate copies of the current user or logged-in state. After login, registration, or a profile update changes the session, `useUserSession().fetch()` refreshes the logged-in state and current user from the session endpoint.

After logout or session expiry, the current Pinia Colada Query Cache may still contain protected values loaded for the previous session. A full page reload discards the current Nuxt app instance and its Query Cache. Nuxt Auth Utils then reads the session again, and route middleware checks access before showing a protected page.

This approach avoids maintaining a list of authenticated Queries or manually resetting every related cache entry when the session ends.

## Implementation Guidance

- Use `useUserSession()` to read the logged-in state and current user. Use Pinia Colada Queries to load and cache protected server values.
- For login, registration, or a profile update, use a Pinia Colada Mutation to send the request. Keep the Nuxt Auth Utils session refresh in the Mutation workflow instead of the shared fetch client.
- Refresh the session only when an operation can change whether the user is logged in or the current user information available through `useUserSession()`.
- When the user logs out, await `useUserSession().clear()` and then reload a public route. The reload replaces the current Nuxt app instance and its Pinia Colada Query Cache.
- When a protected request returns the status that the API defines for a missing or expired session, reload the current route. Nuxt Auth Utils reads the session again, and route middleware decides whether to show the protected page or redirect to login.

## Minimal Nuxt Examples

### Clear the session during logout

Wait for `useUserSession().clear()` and then reload a public route.

```ts
const { clear: clearSession } = useUserSession();

const logout = async () => {
  await clearSession();
  reloadNuxtApp({ path: "/" });
};
```

### Reload after session expiry

When a protected request returns `401 Unauthorized` for a missing or expired session, reload the current route.

```ts
const reloadAfterSessionExpiry = (statusCode: number) => {
  const route = useRoute();
  const isProtectedRoute = route.path === "/app" || route.path.startsWith("/app/");

  if (statusCode === 401 && isProtectedRoute) {
    reloadNuxtApp({ path: route.fullPath });
  }
};
```

## App Examples

- [`auth.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/auth/app/queries/auth.ts) defines Pinia Colada Mutations for login and registration. Each Mutation keeps the session refresh outside the shared fetch client.
- [`profile.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/queries/profile.ts) defines a Pinia Colada Mutation for profile updates and keeps session synchronization in the Mutation.
- [`dashboard.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/base/app/layouts/dashboard.vue) implements logout by awaiting `useUserSession().clear()` and then reloading `/`. It prevents another logout request while the first request is pending. If the clear request fails, it stays on the current page and allows the user to retry.
- [`colada.options.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/colada.options.ts) handles Query and Mutation errors in one place. When a request returns `401 Unauthorized` on a protected route, it reloads the current URL. Other errors continue through the app's normal error notification.

## Trade-offs and Limitations

- Calling `useUserSession().fetch()` after login, registration, or a profile update adds another request to the Mutation workflow.
- The authentication or profile request and the session refresh can have different outcomes. Provider-specific guidance determines when the workflow can continue to UI that requires authentication.
- A full page reload restarts the entire Nuxt app, not only the Pinia Colada Query Cache. It can take more time and discard temporary interface state, but it avoids tracking and resetting every Query associated with the previous session.
- If `useUserSession().clear()` rejects, the app cannot determine from that response alone whether the server kept or cleared the session. The current page can remain available for retry, but it must not report that logout succeeded.
- Session refresh and page reload affect only the current browser tab. Cross-tab logout, silent reauthentication, and switching users require separate coordination.
- An app that must preserve the current Nuxt app instance can use Pinia Colada cancellation and removal actions instead of a full page reload. That approach must identify the Query entries associated with the previous session, cancel pending requests, remove the entries, and verify the behavior.

## Sources

- [Nuxt Auth Utils: `useUserSession()` Vue composable](https://github.com/atinux/nuxt-auth-utils#vue-composable)
- [Nuxt `reloadNuxtApp()`](https://nuxt.com/docs/4.x/api/utils/reload-nuxt-app)
- [Nuxt route middleware](https://nuxt.com/docs/4.x/directory-structure/app/middleware)
- [Pinia Colada Mutations](https://pinia-colada.esm.dev/guide/mutations.html)
- [Pinia Colada Query Cache](https://pinia-colada.esm.dev/advanced/query-cache.html)

## Related Practices

- [Orchestrate Auth Session State Outside the Fetch Client](../use-fetch/auth-session-orchestration.md) — Keeps session synchronization and interaction outcomes outside the HTTP transport.
- [Check Authentication State After a Session Refresh](../nuxt-auth-utils/check-authentication-state-after-session-refresh.md) — Defines the provider-specific completion check after a required refresh.
- [Complete Logout Only After Clearing the User Session](../nuxt-auth-utils/complete-logout-only-after-clearing-user-session.md) — Defines the provider-specific logout and navigation ordering.
- [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](shared-custom-fetch.md) — Defines the HTTP transport boundary used by Pinia Colada requests while keeping `useUserSession().fetch()` and `clear()` outside that boundary.
- [Wait for Mutation Requests to Complete](wait-for-mutation-requests-to-complete.md) — Describes the general Mutation request lifecycle. Authentication Mutations additionally wait for the Nuxt Auth Utils session refresh before completing.
