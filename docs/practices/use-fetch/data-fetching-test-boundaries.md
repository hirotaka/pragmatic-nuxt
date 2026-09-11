---
title: Match Data-Fetching Tests to the Behavior They Exercise
semanticId: data-fetching-test-boundaries
category: testing-and-evidence
prerequisites:
  - custom-api-fetchers
  - page-rendering-data
  - api-operation-ownership
status: confirmed
---

# Match Data-Fetching Tests to the Behavior They Exercise

## Practice

Before writing a data-fetching test, name the behavior the application must preserve, the code responsible for it, and the failure the test must catch. Choose the narrowest boundary that runs that code without mocking it and can reproduce the named failure.

Use a broader boundary only when the behavior depends on it—for example, when the test must render components, run the Nuxt lifecycle, send a real HTTP request, inspect server rendering or hydration, or interact through a browser. If tests follow the same user journey, keep each one only when it can catch a different failure.

## Apply When

- A data read, an API request that changes data, a pagination flow, refresh after a completed change, an HTTP status, or a response body needs a test.
- A test uses a mock or intercepted response, and you need to know which application code it skips.
- Tests cover the same user journey at more than one boundary, and you need to decide which tests catch different failures.
- Installed Nuxt behavior is unclear, and you need to decide whether a temporary test is useful.

## Do Not Apply When

- The behavior does not read, change, or display fetched data and does not depend on a request lifecycle.
- You need instructions for test locations, commands, CI workflows, fixtures, or local database setup; use the app testing guide instead.
- You are choosing a repository-wide coverage target or a general testing strategy, not a test for a specific data-fetching failure.

## Why

Different test boundaries catch different failures. A focused test can verify a route or request option but cannot show how `useFetch` behaves during the Nuxt lifecycle. A rendered component can show how the UI reacts to mocked data but cannot verify the mocked request. A direct API test can verify an HTTP response but cannot show the rendered page. If a browser test intercepts and fulfills a request, it can show the user outcome without running the matching server code.

Broader tests are not automatically stronger. Shared request hooks are easier to verify where they are implemented, while server rendering, hydration, and navigation require the application boundary where those behaviors occur.

## Implementation Guidance

- Test shared request hooks and pagination rules where they are implemented. Add a focused test for a feature-specific read only when it adds behavior beyond the shared code. Examples include building an endpoint from reactive input, setting request options, transforming the response, or deciding when the request is complete.
- Use a rendered page or component test for a visible loading, error, or empty state or for component interaction. A mocked request does not cover the Nuxt request lifecycle or HTTP.
- Use a Nuxt runtime test when the behavior depends on Nuxt composables, plugins, router context, shared AsyncData, or a registered server endpoint. It does not cover the HTML returned by the built server or hydration in a browser.
- Test application-owned response serialization directly. Use a direct API test for HTTP status, authorization, response body, or persistence. Treat it as test-database coverage only when the request reaches the intended test server and configured database adapter.
- Use a built-preview browser test for server-rendered HTML, hydration reuse, navigation completion, and browser interaction. A request fulfilled by browser interception does not test how the server or database handles that request.
- Keep a temporary exploration or characterization test outside the regular suite while installed behavior remains unresolved. Record the result, move the test into the regular suite if it protects behavior the application must keep, and otherwise remove it after recording what was learned.

## Minimal Nuxt Example

```ts
export async function useProject(id: MaybeRefOrGetter<string>) {
  return await useAPI(() => `/api/projects/${toValue(id)}`);
}
```

This wrapper maps a reactive project ID to an API endpoint. A focused test can pass a ref, capture the route getter passed to `useAPI`, and verify the route before and after the ID changes. That test catches a wrong endpoint or lost reactivity.

Because the test mocks `useAPI`, it does not cover shared error hooks, HTTP, the AsyncData lifecycle, server rendering, or hydration. Test those behaviors at the boundaries where they run.

## App Examples

- [`useAPI.test.ts`](../../../apps/bulletproof-nuxt/layers/base/app/composables/__tests__/useAPI.test.ts) verifies how the configured client combines shared and request-specific error hooks. It mocks Nuxt's `createUseFetch` factory and does not send an HTTP request.
- [`usePaginatedData.test.ts`](../../../apps/bulletproof-nuxt/layers/base/app/composables/__tests__/usePaginatedData.test.ts) verifies shared append, replacement, pending-request, stale-result, and disposal behavior with controlled AsyncData-like state. It does not run an API route or browser.
- The [Discussion detail page test](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/__tests__/[id].test.ts) verifies route-to-read mapping and child composition. The test mocks the read, so it does not cover the production request, server rendering, hydration, or browser navigation.
- In [`discussions.spec.ts`](../../../apps/bulletproof-nuxt/e2e/discussions.spec.ts), `direct discussion detail is SSR-rendered without a hydration GET` checks server-rendered content and hydration reuse against the built preview.
- In the same file, `custom fetcher reports each failed initial GET attempt without an inline error` fulfills the request through browser interception. It checks the rendered failure notification without running the intercepted API route or database query.
- [`api-contracts.spec.ts`](../../../apps/bulletproof-nuxt/e2e/api-contracts.spec.ts) sends direct HTTP requests to verify status, response bodies, authorization, serialization, and test-database behavior without presenting those checks as rendered UI coverage.

## Trade-offs and Limitations

Focused tests usually run faster and make failures easier to locate, but mocks remove the behavior they replace. Broader tests cover more integration points, but they take longer to run and make it harder to tell which part failed.

Tests at multiple boundaries are justified when each catches a different failure. Feature symmetry alone is not a reason to duplicate tests.

## Sources

- [Nuxt Testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Vue Testing Guide](https://vuejs.org/guide/scaling-up/testing)
- [Vitest Mocking Requests](https://vitest.dev/guide/mocking/requests)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Playwright Mock APIs](https://playwright.dev/docs/mock)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Define Domain and Feature API Calls in Composables](domain-feature-api-calls.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Update Paginated Lists Differently for Page Navigation and Load More](pagination-strategies.md)
- [Separate Completed Changes from Data Refresh Failures](completed-change-refresh-failures.md)
