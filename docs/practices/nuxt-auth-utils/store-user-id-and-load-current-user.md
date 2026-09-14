---
title: Store a User ID and Load the Current User When Fetching the Session
semanticId: nuxt-auth-utils-store-user-id-and-load-current-user
category: authentication
status: confirmed
---

# Store a User ID and Load the Current User When Fetching the Session

## Practice

Store only `user.id` in the session's `user` field. Use `sessionHooks.hook("fetch", ...)` to load the user record from the database before Nuxt Auth Utils returns the session response. Assign only fields intended for the client to `session.user`.

## Apply When

- Nuxt Auth Utils stores session data in an encrypted cookie.
- The current user record is stored in a database.
- The session response needs user fields that can change after authentication.
- The Nuxt server can query the database each time the session is fetched.

## Do Not Apply When

- The session must contain every user field needed by the client without a database lookup.
- The Nuxt server cannot query the database each time the session is fetched.
- A backend outside the Nuxt server loads the current user record and creates the session response.

## Why

Nuxt Auth Utils stores session data in an encrypted cookie with a 4096-byte size limit. Keeping only `user.id` in `session.user` reduces the stored user data and avoids copying mutable user fields into the cookie.

The `fetch` session hook runs before Nuxt Auth Utils returns the session response. Loading the user record by ID at that point lets the response use current database values. Selecting each response field keeps data such as a password hash out of the response.

## Implementation Guidance

- Define one type for the stored user identity and another type for the public user data returned to application code.
- After authentication succeeds, write `{ user: { id: user.id } }` with `replaceUserSession()` rather than the merging `setUserSession()` API. Do not rely on replacement as a migration mechanism for arbitrary fields in cookies issued under an earlier session contract.
- Register a `sessionHooks.hook("fetch", ...)` callback.
- Return without querying the database when the session has no `user` field.
- Validate `session.user.id` before using it in a database query.
- Load the user record by ID.
- Choose how the application handles an invalid user ID or a missing user record.
- Assign public user data to `session.user` by selecting each field that the client can receive.

## Minimal Nuxt Example

```ts
await replaceUserSession(event, {
  user: { id: user.id },
});
```

`replaceUserSession()` is intended for a replacement write rather than the merging behavior of `setUserSession()`. Applications that change their session shape must separately decide whether previously issued cookies remain valid; do not treat a replacement write as a guarantee that arbitrary legacy cookie fields have been removed.

```ts
export default defineNitroPlugin(() => {
  sessionHooks.hook("fetch", async (session) => {
    if (!session.user) return;

    const userId = session.user.id;
    if (typeof userId !== "string" || userId.length === 0) {
      throw createError({ statusCode: 401 });
    }

    const user = await users.findById(userId);
    if (!user) {
      throw createError({ statusCode: 401 });
    }

    session.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  });
});
```

The hook reads the user ID from the stored session data. It assigns selected fields from the user record to the session object returned by the session endpoint. It does not write those fields to the cookie.

This example returns `401` for an invalid user ID or a missing user record. An application can clear the session instead.

## App Examples

- [`serializeSessionIdentity.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/utils/serializeSessionIdentity.ts) returns an object containing only the user record ID.
- [`session.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/plugins/session.ts) loads the current user record and assigns selected public user fields to the fetched session.
- [`serializeUser.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/utils/serializeUser.ts) defines the fields that can reach the client.

## Trade-offs and Limitations

Resolving the user record during every session fetch adds a database read. That read keeps mutable user fields out of the cookie and lets the response use current database values.

The stored `session.user` value and the `session.user` value returned to application code have different shapes. Application types must distinguish the stored user identity from the public user data.

The fetch hook cannot return current user data if the stored user ID is invalid or no longer resolves to a user record. The application must choose whether to reject the session request or clear the session.

## Sources

- [Nuxt Auth Utils: Session Management](https://github.com/atinux/nuxt-auth-utils#session-management)
- [Nuxt Auth Utils: Extend Session](https://github.com/atinux/nuxt-auth-utils#extend-session)
