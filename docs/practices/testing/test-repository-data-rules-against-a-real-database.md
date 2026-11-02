---
title: Direct Repository Tests Against a Real Database
semanticId: test-repository-data-rules-against-a-real-database
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Direct Repository Tests Against a Real Database

## Practice

Domain database queries and record mapping are separated from API routes into server-side repositories so they can be tested independently of HTTP request handling.

Direct repository tests run those queries against a real test database and check returned values and changes to stored data.

The choice of methods depends on the complexity of their data rules, the impact of a mistake, existing API coverage, and the value of independent development and diagnosis.

## Apply When

- A Nuxt application's API routes read or change domain data stored in a database.

## Do Not Apply When

- The Nuxt application gets its domain data from a separate backend and does not access a database itself.

## Why

Keeping database queries and record mapping in repositories lets tests call them directly without constructing HTTP requests. Query failures can then be investigated separately from routing, authentication, and request validation.

A route can reject a request before an update or delete reaches the repository. An API rejection test can therefore pass even if the query no longer limits the affected rows correctly. Calling the repository with an existing row ID and an unrelated team or parent ID checks that condition directly.

A database mock supplies the results specified by the test rather than executing the query's filters and database constraints. Reading the stored rows after a repository call checks what the real query changed.

## Implementation Guidance

- Test data includes records that should match the query and records that should be excluded. For scoped updates and deletes, cases distinguish matching IDs, mismatched IDs, and missing records.
- Assertions check the returned value or record shape. Ordering, pagination, and mapping have explicit expected results when they are under test.
- Updates and deletes are checked against stored rows, including related rows and records that must remain unchanged.

## Minimal Nuxt Example

A repository exposes the database update as a method with ordinary arguments.

```ts
// layers/discussions/server/repository/discussionRepository.ts
import { db } from "@nuxthub/db";
import { discussions } from "@nuxthub/db/schema";
import { and, eq } from "drizzle-orm";

export function createDiscussionRepository() {
  return {
    async update(id: string, teamId: string, data: { title?: string; body?: string }) {
      const [updated] = await db
        .update(discussions)
        .set(data)
        .where(and(eq(discussions.id, id), eq(discussions.teamId, teamId)))
        .returning({ id: discussions.id });

      return Boolean(updated);
    },
  };
}
```

The query requires both the discussion ID and team ID to match. The method returns `true` when a row was updated and `false` when no row matched.

A direct test pairs an existing discussion ID with another team's ID. The shared `setupRepositoryTests` helper supplies `db`, production `repositories`, and saved `records`. Here, `records.discussion` belongs to one team and `records.otherTeam` is a different team. The helper implementation is linked in App Examples.

```ts
// layers/discussions/test/unit/server/repository/discussionRepository.test.ts
import { expect } from "vitest";
import { setupRepositoryTests } from "#layers/discussions/test/support/repository";

const test = setupRepositoryTests();

test("update returns false for another team and leaves rows unchanged", async ({ db, repositories, records }) => {
  const before = await db.query.discussions.findMany();

  const changed = await repositories.discussions.update(
    records.discussion.id,
    records.otherTeam.id,
    { title: "Updated title", body: "Updated body" },
  );

  expect(changed).toBe(false);
  expect(await db.query.discussions.findMany()).toEqual(before);
});
```

The expected result is `false` with unchanged stored rows, even though the discussion exists. The test reaches the repository without a route rejecting the mismatched IDs first.

## App Examples

- [`discussionRepository.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/repository/discussionRepository.ts) limits updates and deletes by both discussion ID and team ID.
- [`discussionRepository.test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/unit/server/repository/discussionRepository.test.ts) checks scoped updates and deletes against stored rows.
- [`commentRepository.test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/unit/server/repository/commentRepository.test.ts) checks that comment deletion respects the supplied discussion ID.
- [`repository.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/support/repository.ts) supplies the database, production repositories, and saved records for direct tests.
- [`[id].patch.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/[id].patch.ts) checks the discussion's team before calling the repository update.

## Trade-offs and Limitations

A real database requires isolated test data and cleanup, adding setup time to each suite.

Direct repository tests add cases to maintain alongside API tests. Tests of thin methods that only delegate a simple lookup to the ORM can mostly repeat checks of library behavior. Whether each direct test is needed depends on the application rules it checks, the failures it can detect, and existing API coverage.

## Sources

- [NuxtHub: Database Queries](https://hub.nuxt.com/docs/database/query)
- [Drizzle ORM: Filters](https://orm.drizzle.team/docs/operators)
- [Drizzle ORM: SQL Update](https://orm.drizzle.team/docs/update)
- [Drizzle ORM: SQL Delete](https://orm.drizzle.team/docs/delete)

## Related Practices

- [Use Server Repositories for Database Access](../nuxt/use-server-repositories-for-database-access.md)
- [API Integration Tests Through the Nuxt Server](test-api-routes-through-the-nuxt-server.md)
- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
