---
title: Use Imperative API Requests for Application Operations
semanticId: imperative-api-requests
category: request-boundaries
prerequisites: [custom-api-fetchers]
status: confirmed
---

# Use Imperative API Requests for Application Operations

## Practice

Use the app's configured `$api` client for requests explicitly initiated by a user interaction or another application operation. Choose the imperative lifecycle when the operation does not need Nuxt AsyncData state.

Keep the feature action responsible for the API operation and leave interaction completion with the component or workflow that owns the UI.

## Apply When

- A form submission creates or updates a resource.
- A button or dialog action explicitly starts a request.
- An authentication flow performs an API mutation as one step in a larger operation.
- A GET request is imperative rather than part of page rendering.

## Do Not Apply When

- A read is required for the page's initial render and should use Nuxt AsyncData.
- The caller expects the request alone to create shared AsyncData state or a read cache.
- A feature action would absorb pending UI, success feedback, refresh targets, dialogs, navigation, or session orchestration from their actual owners.

## Why

Imperative requests represent operations rather than page-rendering state. A thin feature action keeps the endpoint contract reusable while the component or workflow remains the visible owner of pending state, success feedback, follow-up refreshes, and completion behavior.

## Implementation Guidance

- Use the configured `$api` client established by the custom API fetcher foundation.
- Let a thin feature action own the endpoint, method, body, and returned feature value.
- Let the component or workflow own pending state, success feedback, affected-data refresh, dialog completion, emitted events, and navigation.
- Keep form field validation local to the form.
- Keep provider-specific session state and reconciliation in authentication code.
- Choose by lifecycle, not HTTP method: page-rendering GETs and imperative GETs have different owners.

## Minimal Nuxt Example

```ts
// composables/useCreateProject.ts
export function useCreateProject() {
  const { $api } = useNuxtApp();

  return (input: { name: string }) => $api("/api/projects", {
    method: "POST",
    body: input,
  });
}
```

```ts
// components/CreateProject.vue
const createProject = useCreateProject();
const pending = ref(false);

const submit = async (input: { name: string }) => {
  pending.value = true;
  try {
    await createProject(input);
    await refreshProjects();
    closeDialog();
  }
  finally {
    pending.value = false;
  }
};
```

## Verified App Examples

- Discussion feature actions such as [create discussion](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCreateDiscussion.ts) call `$api` directly.
- The [update discussion component](../../../apps/bulletproof-nuxt/layers/discussions/app/components/UpdateDiscussion.vue) owns pending state, feature success, refresh settlement, and drawer completion.
- Auth feature actions perform the primary API operation while auth-specific code owns session reconciliation.

## Trade-offs and Limitations

An imperative request does not provide AsyncData state or cache semantics. Direct feature actions intentionally leave workflow code with the actual UI owner. Request deadlines and cancellation policies require their own lifecycle decisions.

## Sources

- [Nuxt custom `$fetch` recipe](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch#recipe-custom-fetch-instance)
- [ofetch interceptors](https://github.com/unjs/ofetch#interceptors)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
- [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)
