---
title: Use Imperative API Requests for Application Operations
semanticId: imperative-api-requests
category: request-boundaries
prerequisites: [custom-api-fetchers]
status: confirmed
---

# Use Imperative API Requests for Application Operations

## Practice

Use an imperative request when a user interaction or application operation starts an API call and Nuxt does not need to manage its result as AsyncData.

Keep the API request separate from the UI interaction that starts it. The component or page manages pending state and completes the interaction after the operation settles.

## Apply When

- The request should only start after a user interaction or application operation occurs.
- The request is not needed to render the initial page.
- The result does not need Nuxt AsyncData state.
- The code that starts the request needs to decide what happens after it settles.

## Do Not Apply When

- The request loads data needed before the page can be rendered.
- The caller needs the `data`, `status`, `error`, or `refresh` values provided by AsyncData.
- A route parameter, filter, or page number change should trigger a new request.

## Why

Nuxt AsyncData is designed for requests that provide rendered data and need Nuxt to manage their state. A request triggered by an interaction does not need that coordination and should not start until the interaction occurs.

An imperative request lets the initiating code control when the request starts and wait for it to settle before updating the UI.

## Implementation Guidance

- Use the application's configured custom `$fetch` instance. The examples call this client `$api`; it is an application-defined helper provided by a Nuxt plugin, not a built-in Nuxt API.
- Access the client with `useNuxtApp()` when creating the action, then call it from the function that runs the operation.
- Await the request before running work that should only happen after it succeeds.
- Keep the request details in the API action. Keep pending state and UI changes that depend on component or page context in the component or page that starts the operation.
- When an authentication or profile operation must refresh the current session, await that refresh before the operation resolves. Authentication code may report success after the refresh succeeds.
- An interaction-triggered GET can use the same imperative client when its result does not need AsyncData.

## Minimal Nuxt Example

```ts
// composables/useCreateProject.ts
export function useCreateProject() {
  const { $api } = useNuxtApp();

  return async (input: { name: string }): Promise<void> => {
    await $api("/api/projects", {
      method: "POST",
      body: input,
    });
  };
}
```

```vue
<!-- components/CreateProject.vue -->
<script setup lang="ts">
const emit = defineEmits<{
  created: [];
}>();

const createProject = useCreateProject();
const pending = ref(false);

const submit = async (input: { name: string }) => {
  pending.value = true;

  try {
    await createProject(input);
    emit("created");
  }
  finally {
    pending.value = false;
  }
};
</script>
```

The action defines and sends the API request. The component starts the operation, manages pending state, and emits `created` only after the request succeeds.

## Verified App Examples

- [`useCreateDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCreateDiscussion.ts) sends its request through the app-provided `$api` client when the returned function is called.
- [`UpdateDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/UpdateDiscussion.vue) tracks pending state, waits for the update and data refresh, and then closes the drawer.
- [`useLogin`](../../../apps/bulletproof-nuxt/layers/auth/app/composables/useLogin.ts) waits for the login request and session refresh before showing its success notification.
- [`useUpdateProfile`](../../../apps/bulletproof-nuxt/layers/users/app/composables/useUpdateProfile.ts) waits for the profile request and session refresh before it resolves.

## Trade-offs and Limitations

An imperative request returns a promise rather than AsyncData. It does not provide reactive `data`, `status`, `error`, or `refresh` values, so the code responsible for the interaction must manage the state it needs.

Work that follows the API request, such as refreshing displayed data or the current session, settles separately. A successful API request does not guarantee that this later work will succeed.

Separate Practices define error notifications, mutation and refresh outcomes, and authentication session behavior. This Practice does not define request deadlines, retries, or cancellation behavior.

## Sources

- [Nuxt 4.5.1: Custom `useFetch`](https://github.com/nuxt/nuxt/blob/v4.5.1/docs/3.guide/5.recipes/3.custom-usefetch.md)
- [Nuxt 4.5.1: `NuxtApp` and plugin injection](https://github.com/nuxt/nuxt/blob/v4.5.1/packages/nuxt/src/app/nuxt.ts)
- [Nuxt 4.5.1: `useFetch` implementation](https://github.com/nuxt/nuxt/blob/v4.5.1/packages/nuxt/src/app/composables/fetch.ts)

## Related Practices

- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Define Domain and Feature API Calls in Composables](domain-feature-api-calls.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
- [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)
