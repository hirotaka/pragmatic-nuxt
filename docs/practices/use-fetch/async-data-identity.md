---
title: Let Request Inputs Define AsyncData Identity
semanticId: async-data-identity
category: async-data-lifecycle
prerequisites: [page-rendering-data]
status: confirmed
---

# Let Request Inputs Define AsyncData Identity

## Practice

Prefer Nuxt's generated AsyncData key when the request URL and fetch options fully describe request identity. Use a manual key only when the key itself is an explicit application contract.

## Apply When

- A fixed URL and its options fully identify a read.
- Reactive query values describe replacement-style list identity.
- A reactive URL describes the current resource identity.
- An explicit key is needed for `useNuxtData()`, an optimistic update, or intentionally independent state for otherwise identical requests.

## Do Not Apply When

- A manual key would only give a request a readable label.
- The key duplicates identity already present in the URL or query.
- A watcher would only call `refresh()` after changing an input that `useAPI` can watch directly.
- Calls sharing a manual key use different request or data-shaping options.

## Why

Generated identity keeps the key aligned with the resolved request inputs and avoids application helpers that duplicate URL and option state. Reactive request inputs also let Nuxt start the corresponding request without a second watcher dedicated to refresh.

## Implementation Guidance

- Pass reactive pagination, search, or sort values through the `query` option.
- Pass a reactive resource URL as a ref, computed value, or getter.
- Use the raw `refresh()` returned by the owning call for an explicit rerun of its current request.
- When a manual key is required, keep the request and `default`, `transform`, `pick`, `deep`, and `getCachedData` options compatible across callers.
- Evaluate dedupe separately when the app has a concrete same-key concurrency requirement; generated identity alone does not define an application-specific execution policy.

## Minimal Nuxt Example

```ts
const page = ref(1);
const route = useRoute();
const projectId = computed(() => route.params.id as string);

const projects = await useAPI("/api/projects", {
  query: { page },
});

const project = await useAPI(
  () => `/api/projects/${projectId.value}`,
);
```

## Verified App Examples

- The [discussion collection composable](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) passes reactive page and limit values as query inputs.
- The [discussion detail composable](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) passes the reactive resource ID through a URL getter.
- The [users composable](../../../apps/bulletproof-nuxt/layers/users/app/composables/useUsers.ts) relies on fixed URL and options for identity.

## Trade-offs and Limitations

Generated keys are not directly addressable by application code in the way an explicit key is. Introduce a manual key when that addressability is a real contract, then maintain option compatibility deliberately. Nuxt behavior can vary by framework version, so test material reactive transitions that the app depends on.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt `useNuxtData`](https://nuxt.com/docs/4.x/api/composables/use-nuxt-data)

## Related Practices

- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Share Pagination Mechanics and Choose the Collection Strategy](pagination-strategies.md)
