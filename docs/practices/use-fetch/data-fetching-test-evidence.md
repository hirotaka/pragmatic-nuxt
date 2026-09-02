---
title: Test Data-Fetching Claims at Their Owning Boundaries
semanticId: data-fetching-test-evidence
category: testing-and-evidence
prerequisites:
  - custom-api-fetchers
  - page-rendering-data
  - api-operation-ownership
status: confirmed
---

# Test Data-Fetching Claims at Their Owning Boundaries

## Practice

Start each durable data-fetching test with the claim and its Production owner, then choose the smallest boundary that still contains the data-fetching failure you need to detect. Test shared pagination or configured-client policy at its common owner, rendered wiring at the page or component owner, Nuxt lifecycle only in a Nuxt environment, and SSR, hydration, navigation, or real HTTP behavior only in browser or direct API coverage that reaches those paths.

Use temporary evidence when installed Nuxt behavior is unresolved, but do not treat an experiment or a historical filename as current data-fetching authority.

## Apply When

- Adding or changing a `useAPI`/`useFetch` read, `$api` operation, pagination owner, or mutation-refresh flow.
- Deciding whether a data-fetching claim requires focused, rendered composition, Nuxt runtime, direct API, SSR, or browser coverage.
- Comparing tests that mention the same journey at different ownership boundaries.
- Investigating installed Nuxt data-fetching behavior before deciding what belongs in ongoing CI.

## Do Not Apply When

- A pure domain rule has no data-fetching, Vue, Nuxt, HTTP, or browser dependency.
- The test exists only to preserve an unconfirmed experiment or historical implementation.
- A fixed coverage percentage or test-level ratio is being used as a substitute for claim and risk analysis.
- The proposed test mocks the same owner or lifecycle it claims to prove.
- A generic testing-policy question has no data-fetching-specific contract to explain.

## Why

Data-fetching failures cross request construction, configured hooks, AsyncData identity, SSR payload reuse, reactive transitions, server serialization, mutation settlement, and hydrated browser behavior. One broad test cannot localize every failure, while repeating one happy path at every level creates cost without new protection.

Thin feature reads can own meaningful endpoint, reactive-input, or option-forwarding contracts, but complete returned-object identity is not automatically a consumer contract. A focused mock proving request mapping cannot establish Nuxt lifecycle, SSR, hydration, HTTP, or database behavior.

## Implementation Guidance

- Name the accepted claim, material failure, and Production owner before selecting a test type.
- Test common configured-fetch hooks and shared pagination mechanics at their common owners rather than repeating them in thin feature reads.
- Use a focused feature test only for an independent endpoint, reactive input, option policy, transformation, or settlement contract.
- Use a rendered page or component test for loading, error, empty state, events, and parent-child wiring. Do not describe a simulated DOM as production SSR or browser evidence.
- Use a Nuxt runtime test only when installed AsyncData state, plugins, router context, registered endpoints, or shared Nuxt data are material to the claim.
- Use serializer evidence for app-owned serialization and JSON-shape behavior.
- Use direct API or repository/database integration evidence when status, authorization, persistence, or the configured database adapter is part of the claim.
- Use browser E2E for SSR-to-hydration reuse, navigation settlement, browser-only interaction, and representative mutation-refresh journeys.
- State when route interception narrows browser evidence. Claim real server or database coverage only for requests that reach the intended server and test adapter.
- Record the nearest overlapping durable tests and the unique fault each boundary detects. Same journey does not mean same claim.
- Keep temporary data-fetching evidence outside the default durable suite and preserve its result before promotion or deletion.

## Minimal Nuxt Example

```ts
export async function useProject(id: MaybeRefOrGetter<string>) {
  return await useAPI(() => `/api/projects/${toValue(id)}`);
}
```

For this thin read, focused coverage may protect the endpoint and reactive input when they carry an independent contract. Configured hooks belong to the common `useAPI` owner. Nuxt runtime or browser coverage is warranted only when the accepted claim depends on installed AsyncData, SSR, hydration, or navigation behavior.

## Verified App Examples

- [`usePaginatedData.test.ts`](../../../apps/bulletproof-nuxt/layers/base/app/composables/__tests__/usePaginatedData.test.ts) protects common append and replace behavior, retained data during refresh, page clamping, stale-result rejection, and disposal at the shared pagination owner.
- The [Discussion detail Page test](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/__tests__/[id].test.ts) protects route-to-read and settled-ID child composition. Its mocked Read does not prove the production endpoint, SSR request, hydration, or browser behavior.
- [`discussions.spec.ts`](../../../apps/bulletproof-nuxt/e2e/discussions.spec.ts) owns representative Discussion SSR, hydration reuse, navigation, reactive identity, notification, and mutation-refresh browser claims. Individual intercepted scenarios state the narrower network path they exercise.
- [`api-contracts.spec.ts`](../../../apps/bulletproof-nuxt/e2e/api-contracts.spec.ts) exercises direct HTTP status, response-body, authorization, serialization, and test-database contracts without presenting them as UI journeys.

## Trade-offs and Limitations

The smallest sufficient boundary is not always the fastest boundary. SSR, hydration, real navigation, and persistence failures require broader environments even when focused tests are cheaper.

Distinct failure detection may justify coverage at multiple levels. The goal is not one test per journey or the fewest possible tests; it is a coherent durable portfolio in which each retained boundary has a named job.

Temporary evidence requires explicit execution and cleanup. Keeping it outside default CI prevents a Nuxt investigation from silently becoming permanent authority, but the result and disposition still need a durable record while the work is active.

## Sources

- [Nuxt Testing](https://nuxt.com/docs/4.x/getting-started/testing)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Vue Testing Guide](https://vuejs.org/guide/scaling-up/testing)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Define Domain and Feature API Calls in Composables](domain-feature-api-calls.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
