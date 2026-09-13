---
title: Load the Current User Record Before Processing a Protected Request
semanticId: nuxt-auth-utils-load-current-user-before-protected-request
category: authentication
status: confirmed
---

# Load the Current User Record Before Processing a Protected Request

## Practice

Load the current user record before processing a request in a protected server route. Use that record for the route's authorization checks. Keep authorization checks in each route handler.

## Apply When

- Protected Nuxt server routes use a Nuxt Auth Utils session to identify the user.
- Protected routes need the current user record because it can change or be deleted after the session is created.
- Multiple protected routes need to load the current user record before processing requests.

## Do Not Apply When

- A route is public or creates an authenticated session.
- The authenticated session is designed to be self-contained, and protected requests must not query a user database.
- Another server boundary already provides a verified current user record to the route handler.

## Why

Nuxt Auth Utils provides `requireUserSession()` to check whether a server request has a user session. This check only confirms that the session contains user data. It does not confirm that the referenced user record still exists or reflects the current database state.

Protected routes that depend on database-managed user data need the current user record before making access decisions. This prevents a deleted user record or stale session fields from being treated as current user data.

## Implementation Guidance

- Create an application helper that calls `requireUserSession()` and reads `session.user.id`.
- Validate the user ID before querying the database.
- Load the current user record by ID.
- Choose how the application handles an invalid user ID or a missing user record.
- Create a protected event-handler wrapper that awaits the helper before calling the route handler.
- Pass the current user record to the route handler.
- Use the wrapper for protected routes.

## Minimal Nuxt Example

```ts
export async function requireCurrentUser(event: H3Event) {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  if (typeof userId !== "string" || userId.length === 0) {
    throw createError({ statusCode: 401 });
  }

  const user = await users.findById(userId);
  if (!user) {
    throw createError({ statusCode: 401 });
  }

  return user;
}
```

The helper validates the session user ID before loading the user record. This example returns `401` when the user ID is invalid or the user record does not exist.

```ts
export function defineProtectedEventHandler(handler: ProtectedHandler) {
  return defineEventHandler(async (event) => {
    const currentUser = await requireCurrentUser(event);
    return handler(event, currentUser);
  });
}
```

The wrapper does not call the route handler until the current user record has been loaded.

## App Examples

- [`requireCurrentUser.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/utils/requireCurrentUser.ts) validates the session user ID and loads the current user record.
- [`defineProtectedEventHandler.ts`](../../../apps/bulletproof-nuxt/layers/auth/server/utils/defineProtectedEventHandler.ts) passes the current user record to a protected route handler.

## Trade-offs and Limitations

Loading the current user record adds a database read to each protected request and makes authentication depend on the user database. In return, protected routes do not rely on a deleted user record or stale user fields from the session.

## Sources

- [Nuxt Auth Utils: Session Management](https://github.com/atinux/nuxt-auth-utils#session-management)

## Related Practices

- [Store a User ID and Load the Current User When Fetching the Session](store-user-id-and-load-current-user.md)
