---
title: Orchestrate Auth Session State Outside the Fetch Client
semanticId: auth-session-orchestration
category: failure-and-workflow-outcomes
prerequisites: [imperative-api-requests]
status: confirmed
---

# Orchestrate Auth Session State Outside the Fetch Client

## Practice

When an authentication request changes the server session, synchronize the client authentication state before completing the interaction.

Treat the authentication request and the session operation as separate responsibilities. Keep session synchronization, logout, navigation, and interaction completion in the workflow that owns the interaction, outside the fetch client.

Protect server APIs independently from client-side navigation. Client-side route middleware can improve the user experience, but it does not protect an API from direct requests.

## Apply When

Use this practice when:

- A login or registration request creates a server session.
- An authenticated profile change updates user data stored in the session.
- Logout must clear both the session cookie and client auth state.
- A server API must reject requests without an authenticated session before performing protected work.
- The app uses Nuxt Auth Utils to manage cookie-backed user sessions.

## Do Not Apply When

Do not use this practice when:

- A request does not change the authenticated user or session state.
- Page-rendering data belongs in AsyncData rather than auth session state.
- The authentication provider defines a different client session lifecycle.
- Only transport credentials, authentication headers, or common unauthorized-response handling are needed.

## Why

An authentication change affects both the server session and the auth state observed by the client. These states do not necessarily become current at the same time. Completing the interaction before both sides have settled can leave the next screen working with outdated identity information.

Logout has the same consistency requirement. Reporting completion before the session state has been cleared can tell the user that logout succeeded while authenticated access remains possible.

Authentication workflows also control outcomes that ordinary data requests do not, such as completing a form, reporting authentication success, or choosing the next screen. Keeping those decisions within the authentication workflow prevents unrelated requests from affecting them.

Page access and API access are separate security boundaries. Restricting navigation does not prevent a caller from requesting protected server data directly, so each boundary must enforce its own requirements.

## Implementation Guidance

- Send login, registration, and authenticated profile requests through the app's configured API client.
- In a login or registration route, replace the session after validating the request. Store the stable user ID instead of mutable user fields.
- After the request succeeds, refresh the session and confirm that the refreshed session is authenticated before reporting success, completing the form, or navigating.
- For logout, clear the user session before reporting success. Handle navigation after logout as a separate outcome.
- Before a protected server route performs domain work, validate the session user ID and load the current user record. Use client-side route middleware only for page navigation.

## Minimal Nuxt Example

```ts
// composables/useLogin.ts
export function useLogin() {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession, loggedIn } = useUserSession();

  return async (credentials: LoginInput): Promise<void> => {
    await $api("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    await refreshSession();
    if (!loggedIn.value) {
      throw new Error("The user session could not be refreshed.");
    }
  };
}
```

The feature composable sends the login request, refreshes the client session, and confirms that it remains authenticated before resolving.

```vue
<!-- pages/login.vue -->
<script setup lang="ts">
const login = useLogin();

const submit = async (credentials: LoginInput) => {
  await login(credentials);
  await navigateTo("/app");
};
</script>
```

The page waits for the login operation to finish before navigating.

```ts
// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const credentials = await readValidatedBody(event, loginSchema.parse);
  const user = await authenticate(credentials);

  await replaceUserSession(event, { user: { id: user.id } });
  return {};
});
```

The login API replaces the server session with the stable user ID only after authentication succeeds.

```ts
// server/api/projects.get.ts
export default defineProtectedEventHandler(async (event, currentUser) => {
  return getProjectsForUser(currentUser.id);
});
```

The protected API validates the session user ID and loads the current user record before accessing protected data.

## App Examples

- [`useLogin.ts`](../../../apps/bulletproof-nuxt/layers/auth/app/composables/useLogin.ts) sends the login request and refreshes the client session before reporting success.
- [`login.post.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/api/auth/login.post.ts) replaces the server session with the stable user ID after authentication succeeds.
- [`dashboard.vue`](../../../apps/bulletproof-nuxt/layers/base/app/layouts/dashboard.vue) waits for the session to clear before reporting logout success and then handles navigation separately.
- The [discussion collection API route](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.get.ts) loads the current user record before accessing discussion data.
- The [auth route middleware](../../../apps/bulletproof-nuxt/layers/auth/app/middleware/auth.ts) redirects unauthenticated page navigation.

## Trade-offs and Limitations

Refreshing the client auth state adds another request after an authentication change, so notification, form completion, and navigation take longer.

Session synchronization can fail even after the primary authentication request succeeds. The workflow must preserve the completed request result while handling the session outcome separately.

Session clearing can also fail. The workflow must not report logout as complete before clearing succeeds. A later navigation failure does not reverse a completed logout.

Concurrent operations that write session state can finish out of order. When logout must remain the final session change, additional operation ordering or server-side invalidation is needed.

Password handling, provider selection, session payloads, redirect validation, session expiry, and multi-tab behavior are separate concerns.

## Sources

- [Nuxt Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)
- [Nuxt Custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt Auth Utils](https://github.com/atinux/nuxt-auth-utils)

## Related Practices

- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Present API Failures from Custom Fetchers](api-error-notifications.md)
- [Separate Completed Changes from Data Refresh Failures](completed-change-refresh-failures.md)
- [Store a User ID and Load the Current User When Fetching the Session](../nuxt-auth-utils/store-user-id-and-load-current-user.md)
- [Load the Current User Record Before Processing a Protected Request](../nuxt-auth-utils/load-current-user-before-protected-request.md)
- [Check Authentication State After a Session Refresh](../nuxt-auth-utils/check-authentication-state-after-session-refresh.md)
- [Complete Logout Only After Clearing the User Session](../nuxt-auth-utils/complete-logout-only-after-clearing-user-session.md)
