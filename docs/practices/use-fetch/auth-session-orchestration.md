---
title: Orchestrate Auth Session State Outside the Fetch Client
semanticId: auth-session-orchestration
category: failure-and-workflow-outcomes
prerequisites: [imperative-api-requests]
status: confirmed
---

# Orchestrate Auth Session State Outside the Fetch Client

## Practice

This practice assumes that the application uses Nuxt Auth Utils to manage cookie-backed user sessions.

After an authentication request changes the server session, refresh client auth state through `useUserSession()` before completing the interaction. Use `fetch()` after login, registration, or authenticated profile changes, and use `clear()` for logout.

Keep session refresh, logout, navigation, login completion, and provider-specific reconciliation outside the fetch client. Transport authentication extensions such as credentials, headers, or common unauthorized-response handling remain transport concerns.

## Apply When

- A login or registration request creates a server session.
- An authenticated profile change updates user data stored in the session.
- Logout must clear both the session cookie and client auth state.
- A protected server route requires an authenticated user.
- The app uses Nuxt Auth Utils and `$api` for imperative auth mutations.

## Do Not Apply When

- A request does not change authenticated user or session state.
- Page-rendering data belongs in AsyncData rather than auth state.
- The authentication provider defines a different client session lifecycle.
- Only transport credentials, auth headers, or common unauthorized-response handling are needed.
- Multi-tab session synchronization is required; that needs a separate policy.

## Why

Nuxt's Sessions and Authentication recipe performs the login request, refreshes `useUserSession()`, and only then navigates. This keeps the server cookie and client auth state synchronized before the next UI state depends on them.

Transport extensions can apply broadly to API traffic, but session operations have feature-specific ordering and provider semantics. Keeping those responsibilities separate avoids coupling every request to login, logout, navigation, or provider state.

## Implementation Guidance

- Send imperative login, registration, and profile requests through `$api`.
- In the server route, call `setUserSession()` after validating credentials or updating authenticated user data.
- After the request succeeds, await `useUserSession().fetch()` before success notification, navigation, or form completion.
- For logout, await `useUserSession().clear()` instead of adding a parallel logout endpoint.
- Protect authenticated server routes with `requireUserSession()` before applying role or ownership checks.
- Do not return a duplicate session DTO solely to assign it directly to client state.
- Do not call the Nuxt Auth Utils session endpoint directly from app code when `fetch()` or `clear()` expresses the operation.
- Accept the session provider's documented failure behavior rather than layering generic API notifications onto its internal request.
- Add fallback sessions, queues, generation guards, or server-side invalidation only for a concrete requirement.

## Minimal Nuxt Example

```ts
export const useLogin = () => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();

  return async (credentials: LoginInput) => {
    await $api("/api/auth/login", {
      method: "POST",
      body: credentials,
    });

    await refreshSession();
  };
};
```

```ts
export default defineEventHandler(async (event) => {
  const credentials = await readValidatedBody(event, loginSchema.parse);
  const user = await authenticate(credentials);
  await setUserSession(event, { user });
  return {};
});
```

## Verified App Examples

- Login and registration send their requests through `$api`, await `useUserSession().fetch()`, and then report success.
- Profile update refreshes the session before the form interaction completes.
- Dashboard and profile-menu logout actions await `useUserSession().clear()` before navigation.
- Auth and profile routes call `setUserSession()` without returning duplicate session DTOs.
- Protected APIs call `requireUserSession()` before feature authorization.

## Trade-offs and Limitations

Refreshing client auth state adds a provider session request after the primary mutation. Waiting for it delays completion, but intentionally avoids proceeding with pre-mutation auth state.

Nuxt Auth Utils owns the exact behavior of `fetch()` and `clear()`. A primary mutation can succeed while a later session refresh leaves client state empty. The app also does not serialize profile updates with logout; applications that require logout to be the final session writer need additional coordination or server-side invalidation.

Password hashing, provider selection, session payload design, multi-tab synchronization, and a complete authentication architecture require separate decisions.

## Sources

- [Nuxt Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication)
- [Nuxt Custom useFetch](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt Auth Utils](https://github.com/atinux/nuxt-auth-utils)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
