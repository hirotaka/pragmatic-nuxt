---
title: Complete Logout Only After Clearing the User Session
semanticId: nuxt-auth-utils-complete-logout-only-after-clearing-user-session
category: authentication
status: confirmed
---

# Complete Logout Only After Clearing the User Session

## Practice

Treat logout as complete only after the user session has been cleared. Treat navigation after logout as a separate outcome.

## Apply When

Use this practice when:

- Nuxt Auth Utils manages the user session.
- Logout is followed by navigation to unauthenticated UI.
- Clearing the user session and navigating can fail independently.

## Do Not Apply When

Do not use this practice when:

- The same logout operation must also end an identity-provider session, revoke an external token, or end sessions on other devices.
- The user session being cleared is not managed by Nuxt Auth Utils.

## Why

Clearing the user session changes the authentication state. Navigation changes the current page. A navigation failure after the session is cleared does not restore the session.

Reporting logout success before the session clear finishes can claim a state that has not been confirmed. Waiting for the clear and treating navigation separately keeps each result aligned with the state it represents.

## Implementation Guidance

- Get `clear` from `useUserSession()`.
- Prevent another logout attempt while the current attempt is pending.
- Await `clear()` before reporting success or starting navigation.
- If `clear()` fails, do not report logout success or start navigation.
- Keep the logout interaction available for another attempt after a clear failure.
- After `clear()` succeeds, handle navigation as a separate operation.
- If navigation fails, report that the user is logged out but the destination could not be opened.

## Minimal Nuxt Example

```ts
// layers/base/app/layouts/dashboard.vue
const { clear } = useUserSession();

await clear();

try {
  await navigateTo("/login");
}
catch {
  throw new Error("The session was cleared, but navigation failed.");
}
```

Navigation starts only after `clear()` succeeds. A navigation error does not change the cleared session state.

## App Examples

- [`dashboard.vue`](../../../apps/bulletproof-nuxt/layers/base/app/layouts/dashboard.vue) awaits `clear()`, reports logout success, and then handles navigation separately.

## Trade-offs and Limitations

Waiting for `clear()` delays logout feedback and navigation until the session request finishes. In return, the UI does not report logout success while the provider session may still be active.

## Sources

- [Nuxt Auth Utils: Vue Composable](https://github.com/atinux/nuxt-auth-utils#vue-composable)

## Related Practices

- [Orchestrate Auth Session State Outside the Fetch Client](../use-fetch/auth-session-orchestration.md)
