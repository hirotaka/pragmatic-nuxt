---
title: API Integration Tests Through the Nuxt Server
semanticId: test-api-routes-through-the-nuxt-server
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# API Integration Tests Through the Nuxt Server

## Practice

API integration tests send requests through the Nuxt server's Nitro routing and middleware. They run the real handlers, authentication, authorization, repositories, and serializers involved in the request, using a real test database when the endpoint reads or changes persistent data.

The tests check response status, headers, body, and any changes to stored data.

## Apply When

- A full-stack Nuxt application implements API routes and uses a database for persistence.

## Do Not Apply When

- Nuxt provides only the frontend, while a separate backend application implements the API and database access.

## Why

An API response depends on routing, middleware, and request parsing as well as the handler. Sending requests through Nuxt exercises that sequence instead of reconstructing it in a test.

For operations that change data, the response and database checks show whether the expected change was saved. They also confirm that rejected requests left the relevant data unchanged.

## Implementation Guidance

- Cases cover the API's valid and invalid inputs and its access rules, including authentication, permissions, and which records each caller can access.
- Assertions check response status, headers, and body rather than the handler's return value or internal function-call counts.
- For data-changing requests, database assertions check the saved result on success and unchanged relevant data after rejection.

## Minimal Nuxt Example

An API route accepts a nonempty message and returns it as JSON.

```ts
// server/api/echo.post.ts
import { createError, defineEventHandler, readBody } from "h3";
import { z } from "zod";

const inputSchema = z.object({ message: z.string().min(1) });

export default defineEventHandler(async (event) => {
  const input = inputSchema.safeParse(await readBody(event));
  if (!input.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid message" });
  }
  return { message: input.data.message };
});
```

The handler returns a JSON response for valid input and an HTTP 400 error for an empty message.

The shared `setupRequestTests` helper shown in App Examples provides `test` and `post`. The `post` helper sends a JSON request through Nuxt and returns a `Response`.

```ts
// test/unit/server/api/echo.post.test.ts
import { expect } from "vitest";
import { setupRequestTests } from "../../../support/request";

const { test, post } = setupRequestTests();

test("returns a JSON response for a valid message", async () => {
  const response = await post("/api/echo", { message: "Hello" });

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("application/json");
  expect(await response.json()).toEqual({ message: "Hello" });
});

test("rejects an empty message through the HTTP boundary", async () => {
  const response = await post("/api/echo", { message: "" });

  expect(response.status).toBe(400);
  expect(await response.json()).toMatchObject({ statusMessage: "Invalid message" });
});
```

The test selects the endpoint by its URL and method, then checks the serialized response. It does not import or invoke the handler directly.

## App Examples

- [`request.ts`](../../../apps/bulletproof-nuxt/test/support/request.ts) provides `setupRequestTests` and shared JSON request helpers for API specs.
- [`register.post.test.ts`](../../../apps/bulletproof-nuxt/test/unit/server/api/register.post.test.ts) checks registration responses, saved users and teams, password behavior, and session creation through real requests.
- [`login.post.test.ts`](../../../apps/bulletproof-nuxt/layers/auth/test/unit/server/api/auth/login.post.test.ts) checks successful login and rejected credentials through the real authentication middleware and database.
- [`index.get.test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/unit/server/api/discussions/index.get.test.ts) checks discussion pagination, team filtering, public response fields, and request errors.
- [`profile.patch.test.ts`](../../../apps/bulletproof-nuxt/layers/users/test/unit/server/api/profile.patch.test.ts) checks allowed profile changes, session enrichment, and unchanged data after rejected requests.

## Trade-offs and Limitations

Building Nitro and preparing an isolated database add setup time. Test data also needs to be reset between cases to prevent one test from affecting another.

## Sources

- [Nuxt Server Directory](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt Testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [node-mock-http](https://github.com/unjs/node-mock-http)
- [H3 v1 Request Utilities](https://v1.h3.dev/utils/request)
- [Zod: Basic Usage](https://zod.dev/basics)

## Related Practices

- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
- [Match Data-Fetching Tests to the Behavior They Exercise](../nuxt-use-fetch/data-fetching-test-boundaries.md)
- [Direct Tests for All Application Utilities](test-all-application-utilities-directly.md)
- [Organize Nuxt Tests by Application and Layer Responsibility](organize-nuxt-tests-by-application-and-layer-responsibility.md)
