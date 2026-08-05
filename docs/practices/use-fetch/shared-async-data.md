---
title: Share AsyncData Through Feature Composables
semanticId: shared-async-data
category: async-data-lifecycle
prerequisites: [page-rendering-data, async-data-identity]
status: confirmed
---

# Share AsyncData Through Feature Composables

## Practice

When multiple data-aware components need the same API data, request state, or refresh behavior, let them call the same feature composable with compatible inputs. Treat shared AsyncData state and HTTP execution as separate properties. Keep API-independent presentation components driven by props.

## Apply When

- More than one data-aware owner needs the same resource state.
- A child owns a mutation follow-up refresh for the shared resource.
- Reactive resource transitions must keep consumers aligned to one settled identity.
- Centralizing the URL and options prevents callers from drifting apart.

## Do Not Apply When

- A component only displays data and has no API-aware behavior.
- A new production consumer would exist only to demonstrate state sharing.
- Callers cannot use compatible request and data-shaping options.
- The goal is solely to guarantee a single HTTP execution.
- Each consumer must own an independent error or request-hook lifecycle.

## Why

Compatible calls with the same AsyncData key use the same Nuxt-managed data, error, status, and refresh lifecycle. A data-aware component can obtain the shared refresh operation without routing API behavior through unrelated intermediate components.

State sharing does not guarantee one handler or HTTP execution. Server rendering, hydration payload reuse, pending dedupe, and later client-side consumers each have different execution conditions.

## Implementation Guidance

- Centralize the URL and fetch options in a feature composable that returns native AsyncData.
- Keep the handler, URL, query, `default`, `transform`, `pick`, `deep`, and `getCachedData` compatible across consumers.
- Let data-aware consumers call the composable directly when they own data-dependent behavior.
- Pass display data to API-independent components as props.
- During a reactive resource transition, use the settled resource identity for dependent UI until the target resource settles.
- Treat notification, navigation, and other side effects as separate ownership decisions; do not assume same-key callers have independent request hooks.
- Do not use `dedupe` as a request-once policy. `cancel` and `defer` govern overlapping pending executions, not later calls after settlement.
- Consider `server: false` only for a consumer that does not need to start its own SSR read. Confirm whether another server-rendered owner supplies shared data and whether a standalone use may wait until hydration.

## Minimal Nuxt Example

```ts
// composables/useProject.ts
export function useProject(id: MaybeRefOrGetter<string>) {
  return useAPI(() => `/api/projects/${toValue(id)}`);
}

// A data-aware editor can use the same composable as the page.
const { data, refresh } = await useProject(() => props.projectId);
```

## Verified App Examples

- The [discussion detail page](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/%5Bid%5D.vue) owns initial settlement and passes a settled resource identity to dependent UI.
- [DiscussionView](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionView.vue) calls the same detail composable for shared display data.
- [UpdateDiscussion](../../../apps/bulletproof-nuxt/layers/discussions/app/components/UpdateDiscussion.vue) calls the same composable for form data and the raw refresh operation it owns.

## Trade-offs and Limitations

Nested awaited consumers can begin server-side reads serially after an earlier request has settled. Pending dedupe does not combine these settled executions. In the verified discussion detail shape, preserving direct data and refresh access in each data-aware component accepts repeated serial server reads.

Hydration can reuse a server result from the Nuxt payload without a browser refetch. In Nuxt 4.4.5, a later client-side initial call for an already successful same-key entry also skips another initial fetch. This is version-pinned source behavior, not a general application cache contract.

`server: false` prevents that caller from starting a server fetch; it does not unconditionally remove the request. A compatible SSR owner may already provide the shared state. Without such an owner, the data-dependent UI waits for a client request after hydration. Use this option only when that rendering trade-off is acceptable.

## Sources

- [Nuxt 4.4.5 `useFetch`](https://github.com/nuxt/nuxt/blob/v4.4.5/docs/4.api/2.composables/use-fetch.md)
- [Nuxt 4.4.5 `useAsyncData`](https://github.com/nuxt/nuxt/blob/v4.4.5/docs/4.api/2.composables/use-async-data.md)
- [Nuxt 4.4.5 AsyncData implementation](https://github.com/nuxt/nuxt/blob/v4.4.5/packages/nuxt/src/app/composables/asyncData.ts)
- [Nuxt issue discussing nested awaited request timing](https://github.com/nuxt/nuxt/issues/25853)
- [Nuxt issue discussing dedupe behavior](https://github.com/nuxt/nuxt/issues/29196)

## Related Practices

- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
