---
title: Use Database Record Factories for Test Data Setup
semanticId: use-database-record-factories-for-test-data-setup
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Use Database Record Factories for Test Data Setup

## Practice

Use database record factories to prepare test data that must exist in the database. Define reusable defaults for each record type and override the values needed by each test.

## Apply When

- The application uses Drizzle ORM, and API or E2E tests need existing database records.
- Several tests create the same record types with shared defaults and case-specific values.

## Do Not Apply When

- The test only needs in-memory inputs, such as a typed user object, and does not read or write database records.
- A record's creation through the UI or API is the behavior being tested, rather than a prerequisite for another operation.

## Why

Database record factories give tests a reusable way to create prerequisite records. Tests specify the values and relationships relevant to the case, while the factory supplies shared defaults.

This keeps record preparation concise without repeating UI workflows, API calls, or handwritten inserts. Schema changes can be reflected in the shared defaults rather than in repeated setup across tests.

## Implementation Guidance

- Define shared factories with `@praha/drizzle-factory` and the Drizzle schema.
- Use the factory with the test database and call `create()` in the test or `beforeEach`. Override the values needed for the case.
- Prepare prerequisite records with factories, then perform the operation being tested through its UI or API.

## Minimal Nuxt Example

Define a factory once with defaults for the required fields.

```ts
// test/factories/team.ts
import { randomUUID } from "node:crypto";
import { teams } from "@nuxthub/db/schema";
import { defineFactory } from "@praha/drizzle-factory";

export const teamFactory = defineFactory({
  schema: { teams },
  table: "teams",
  resolver: ({ sequence }) => ({
    id: randomUUID(),
    name: `Test team ${sequence}`,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  }),
});
```

Reuse the factory in a test, overriding the team name for the case. The factory saves the existing team; the registration API creates the new user.

```ts
// test/unit/server/api/register.post.test.ts
import { expect } from "vitest";
import { json, setupRequestTests } from "~~/test/support/request";

const { test, request } = setupRequestTests();

test("registers a user in an existing team", async ({ db }) => {
  const { teamFactory } = await import("~~/test/factories/team");
  const team = await teamFactory(db).create({ name: "Existing team" });

  const response = await request("/api/register", json("POST", {
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    password: "Password123!",
    teamId: team.id,
    teamName: null,
  }));

  expect(response.status).toBe(201);
  expect(await db.query.users.findMany()).toEqual([
    expect.objectContaining({ email: "ada@example.com", teamId: team.id, role: "USER" }),
  ]);
  expect(await db.query.teams.findMany()).toEqual([team]);
});
```

`create()` inserts the team into the same test database used by the API. The request test helper supplies that database and the Nuxt server runtime; database initialization and cleanup remain separate from the factory definition.

## App Examples

- [`team.ts`](../../../apps/bulletproof-nuxt/test/factories/team.ts) defines reusable defaults for team records.
- [`user.ts`](../../../apps/bulletproof-nuxt/test/factories/user.ts) requires a team identifier and stored password hash when preparing account records.
- [`register.post.test.ts`](../../../apps/bulletproof-nuxt/test/unit/server/api/register.post.test.ts) creates prerequisite records through factories before calling the registration API.
- [`factories.ts`](../../../apps/bulletproof-nuxt/test/e2e/support/factories.ts) reuses the shared record factories for E2E preparation.

## Trade-offs and Limitations

Shared defaults reduce repeated setup, but changing them can affect multiple tests at once. A change made for one case can alter the prerequisite data of other tests that rely on the same factory.

Factories insert records without running the application's validation or authorization. Tests can therefore pass with prerequisite data that the UI or API would reject; successful factory setup does not prove that users can create those records.

## Sources

- [Drizzle Factory: Defining Factories and Creating Records](https://github.com/praha-inc/drizzle-factory/blob/main/README.md)
- [Playwright: API Testing and Establishing Preconditions](https://playwright.dev/docs/api-testing#establishing-preconditions)
- [Playwright: Best Practices](https://playwright.dev/docs/best-practices)

## Related Practices

- [Isolated Test Databases Initialized from Migrations](isolate-test-databases-and-initialize-them-from-migrations.md)
- [E2E Tests for Important User Journeys](center-e2e-tests-on-important-user-journeys.md)
- [Application UI Testing Through Real Nuxt Page Components](test-application-ui-through-real-nuxt-page-components.md)
- [API Integration Tests Through the Nuxt Server](test-api-routes-through-the-nuxt-server.md)
