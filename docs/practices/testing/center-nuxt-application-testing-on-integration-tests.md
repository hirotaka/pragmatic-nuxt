---
title: Center Nuxt Application Testing on Integration Tests
semanticId: center-nuxt-application-testing-on-integration-tests
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Center Nuxt Application Testing on Integration Tests

## Practice

Integration tests check behavior across cooperating parts of a Nuxt application, such as a page and its composables or an API route and its database. They form the center of the test suite, complemented by unit tests, E2E tests for important user journeys, linting, and type checking. The emphasis on integration tests is inspired by the [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications).

## Apply When

- A full-stack Nuxt application stores its data in a database.
- Tests need to detect failures in the connections between UI, server, and data-access code.

## Do Not Apply When

- The entire test target is an isolated utility or algorithm with no cooperating application parts.

## Why

Code can pass isolated tests while failing when its inputs, state, or dependencies are connected. Integration tests check those connections using the participating implementations, so they more closely reflect how the application is used. A test with a mocked dependency does not verify the connection to that dependency's real implementation.

Tests focused on observable results are less tied to internal details that change during refactoring. The goal is confidence in application behavior for the time spent writing, running, and maintaining tests, rather than maximizing test count or coverage.

## Implementation Guidance

Use integration tests to verify feature behavior across cooperating implementations. Complement them with direct tests of utility functions and E2E tests of important user journeys.

- **Components:** For existing components such as those from Reka UI or shadcn-vue, use integration tests to check how they work with the application's logic. Components built from scratch or extended with new behavior may also need focused unit tests.
- **Pages:** Render the actual page with the components and composables it uses. Check the page's behavior as a whole, including data fetching and user interactions.
- **Composables:** Test reusable composables directly, and verify their use by components and pages in integration tests.
- **Utility functions:** Keep direct unit tests for the application's utility functions, even when integration tests also exercise them. These tests check each function's own input/output contract.
- **API routes:** Verify API route behavior through real requests and the database operations they trigger. Test request handling, application logic, and data access together rather than replacing them with mocks.

Across these targets, use end-to-end tests for important user journeys through the running application. Check the UI-to-backend connection as a whole rather than reproducing every lower-level test.

## App Examples

- [`register.test.ts`](../../../apps/bulletproof-nuxt/test/nuxt/app/pages/register.test.ts) tests the registration page with its form and composables.
- [`register.post.test.ts`](../../../apps/bulletproof-nuxt/test/unit/server/api/register.post.test.ts) tests registration through the Nitro request boundary and a migration-backed database.
- [`vitest.config.ts`](../../../apps/bulletproof-nuxt/vitest.config.ts) collects tests by execution environment rather than by integration scope.

## Trade-offs and Limitations

Testing with real shared state can expose interaction failures, but adds setup and cleanup work. That state must be prepared and reset so tests do not affect one another.

Integration tests check combined behavior, but can make failures harder to diagnose. A failure may originate in any participating part, so the result alone may not identify the cause.

Feature integration tests alone may not be enough when UI components are built from scratch. Unit tests can also be important for their own behavior. Storybook is one option for testing component states and interactions in isolation.

## Sources

- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Nuxt Testing: Test Environments](https://nuxt.com/docs/4.x/getting-started/testing#test-environments)
- [Nuxt Testing: Helpers](https://nuxt.com/docs/4.x/getting-started/testing#helpers)
- [Reka UI: Introduction](https://reka-ui.com/docs/overview/introduction)
- [shadcn-vue: Introduction](https://www.shadcn-vue.com/docs/introduction)
- [Storybook: Testing UIs](https://storybook.js.org/docs/writing-tests)

## Related Practices

- [Use Vitest, happy-dom, and Playwright for Nuxt Testing](use-vitest-happy-dom-and-playwright-for-nuxt-testing.md)
- [Match Data-Fetching Tests to the Behavior They Exercise](../nuxt-use-fetch/data-fetching-test-boundaries.md)
