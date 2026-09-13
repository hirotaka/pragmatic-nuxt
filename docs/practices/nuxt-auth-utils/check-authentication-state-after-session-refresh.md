---
title: Check Authentication State After a Session Refresh
semanticId: nuxt-auth-utils-check-authentication-state-after-session-refresh
category: authentication
status: confirmed
---

# Check Authentication State After a Session Refresh

## Practice

After a successful request, continue to UI that requires authentication only if the refreshed session is authenticated.

## Apply When

- Nuxt Auth Utils manages the client session state.
- UI shown after a successful request requires refreshed authenticated session data.
- The original request and the session refresh can succeed or fail independently.

## Do Not Apply When

- UI shown after the request does not require an authenticated session.
- The session refresh is optional and does not determine whether the interaction continues.
- The refreshed session is already checked before protected UI continues.

## Why

Nuxt Auth Utils can settle a failed session refresh as logged-out client state instead of propagating the request error. A completed session refresh therefore does not prove that the session remains authenticated.

The original request and the session refresh have independent outcomes. Treating them separately preserves the result of the original request while preventing protected UI from continuing without an authenticated session.

## Implementation Guidance

- Complete the original request before starting the required session refresh.
- Await `useUserSession().fetch()`.
- Read `loggedIn` after the refresh finishes.
- Stop UI that requires authentication when `loggedIn` is `false`.
- Report the session refresh outcome separately from the original request result.
- Keep the interaction available for another attempt.

## Minimal Nuxt Example

```ts
const { fetch, loggedIn } = useUserSession();

await fetch();

if (!loggedIn.value) {
  throw new Error("The user session could not be refreshed.");
}
```

Run this code after the original request succeeds and before continuing to UI that requires authentication. The example throws an error if the refreshed session does not contain a user.

## App Examples

- [`useRequiredUserSessionRefresh.ts`](../../../apps/bulletproof-nuxt/layers/auth/app/composables/useRequiredUserSessionRefresh.ts) combines `fetch()` with the required `loggedIn` check.
- [`useLogin.ts`](../../../apps/bulletproof-nuxt/layers/auth/app/composables/useLogin.ts) requires the refreshed session before reporting a successful login.
- [`useUpdateProfile.ts`](../../../apps/bulletproof-nuxt/layers/users/app/composables/useUpdateProfile.ts) requires the refreshed session before the profile update finishes.

## Trade-offs and Limitations

A required session refresh adds a request, delays UI completion, and makes completion depend on the session endpoint. In return, protected UI starts only after the refreshed session is confirmed as authenticated.

## Sources

- [Nuxt Auth Utils: Vue Composable](https://github.com/atinux/nuxt-auth-utils#vue-composable)

## Related Practices

- [Store a User ID and Load the Current User When Fetching the Session](store-user-id-and-load-current-user.md)
- [Orchestrate Auth Session State Outside the Fetch Client](../use-fetch/auth-session-orchestration.md)
