---
title: Use Server Repositories for Database Access
semanticId: use-server-repositories-for-database-access
category: server-data-access
prerequisites: []
status: confirmed
---

# Use Server Repositories for Database Access

## Practice

For database-backed domain operations in a Nuxt application, API routes call server-side repositories instead of querying the database directly. Repositories hide persistence queries and database-record mapping behind domain operations; API routes own request validation, authorization, HTTP status, and response selection.

## Apply When

- Nuxt API routes read or write database-backed domain data.

## Do Not Apply When

- An endpoint gets its data from an external service and the Nuxt application does not query a database for that domain.
- Database migrations, seed scripts, and other operational tasks run outside API routes.

## Why

Nuxt registers `server/api/` files as routes. A route that queries the database directly owns persistence details alongside request handling, access checks, and HTTP outcomes. A repository exposes domain operations, such as finding a discussion by ID and team, while keeping the database client, query filters, and record mapping in server-only code. The route consumes the result, decides the HTTP outcome, and selects the response. Multiple routes can call the same repository method when they need the same domain operation.

## Implementation Guidance

- Place the repository with its domain's server code, such as `server/repository/`.
- Keep the database client in the repository. With NuxtHub Database, import the generated `@nuxthub/db` client and schema exports there.
- Expose methods named for domain operations; keep database queries and filters inside them, and map database rows to server records there.
- Call those methods from Nuxt server routes in `server/api/`. Validate request input, check authentication and authorization, and choose HTTP statuses there.
- Select client response fields in the server route or in a server-only helper called by the route.
- Test repository queries and mapping against a database configured for the app's tests. Test server route access, HTTP status, and responses separately.

## Minimal Nuxt Example

```ts
// server/repository/discussionRepository.ts
import { db } from "@nuxthub/db";
import { discussions } from "@nuxthub/db/schema";
import { and, eq } from "drizzle-orm";

export function createDiscussionRepository() {
  return {
    async findByIdAndTeamId(id: string, teamId: string) {
      const row = await db.query.discussions.findFirst({
        where: and(eq(discussions.id, id), eq(discussions.teamId, teamId)),
      });
      if (!row) return null;
      return { id: row.id, title: row.title };
    },
  };
}
```

```ts
// server/api/discussions/[id].get.ts
import { createDiscussionRepository } from "#server/repository/discussionRepository";

export default defineEventHandler(async (event) => {
  const currentUser = await requireCurrentUser(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400 });

  const discussion = await createDiscussionRepository().findByIdAndTeamId(id, currentUser.teamId);
  if (!discussion) throw createError({ statusCode: 404 });

  return { id: discussion.id, title: discussion.title };
});
```

The repository contains the database query and maps its row to a server-side result, even if this route is its only caller. The route obtains the current user, handles invalid or missing IDs, and selects response fields. `requireCurrentUser` is an application-owned server helper, not a Nuxt API. This example uses the generated NuxtHub Database client and schema.

## App Examples

- [`discussionRepository.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/repository/discussionRepository.ts) contains discussion queries, filters, and database-record mapping.
- [`[id].get.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/[id].get.ts) handles a discussion request's authorization and not-found HTTP outcome without querying Drizzle directly.
- [`serializeDiscussion.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/utils/serializeDiscussion.ts) converts a server record's dates to client-facing strings at the response boundary.
- [`seed.ts`](../../../apps/bulletproof-nuxt/server/db/seed.ts) uses the generated NuxtHub Database client in a task outside a server route.

In this app, domain repositories live under local Nuxt Layers.

## Trade-offs and Limitations

[Nuxt's directory-structure documentation](https://nuxt.com/docs/4.x/directory-structure) does not list a dedicated repository directory under `server/`. If an application places repositories in its own directory, auto-importing exports from that directory requires additional configuration.

## Sources

- [Nuxt: Directory Structure](https://nuxt.com/docs/4.x/directory-structure)
- [Nuxt: Server Directory](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt: Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)
- [NuxtHub: Database Queries](https://hub.nuxt.com/docs/database/query)

## Related Practices

- [Use NuxtHub's Drizzle-Powered Database Integration](../nuxt-hub-db/runtime-schema-ownership.md)
- [Treat API Payloads as Serialized JSON Values](../nuxt-use-fetch/serialized-api-payloads.md)
- [Load the Current User Record Before Processing a Protected Request](../nuxt-auth-utils/load-current-user-before-protected-request.md)
