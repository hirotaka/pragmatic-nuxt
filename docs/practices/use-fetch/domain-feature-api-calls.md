---
title: Define Domain and Feature API Calls in Composables
semanticId: api-operation-ownership
category: request-boundaries
prerequisites:
  - custom-api-fetchers
  - page-rendering-data
  - imperative-api-requests
status: confirmed
---

# Define Domain and Feature API Calls in Composables

## Practice

Keep the request details for each API call defined by the app in one place. These details include the endpoint, request inputs, and returned value.

When an API call reads or changes data for a domain or feature, define it in a composable. Pages and Routes may call several of these composables, but they should not repeat the API URLs or request options. If an API call does not belong to a domain or feature, define it directly in the Page or Route that needs it.

Use a composable that returns Nuxt's native AsyncData for data needed to render the UI. For a request that should run only when a form is submitted, a deletion is confirmed, or another event occurs, use a composable that returns a function the caller can run at that time.

Keep API URLs, request inputs, and returned values separate from UI behavior. The Component or Page that starts a request decides when to show loading and success feedback, refresh data, close a dialog, or navigate.

Use Nuxt's native AsyncData without adding feature-specific state unless the feature needs behavior that AsyncData does not provide.

## Apply When

- The app has an API call for a domain or feature, and its URL, request inputs, and returned value should be defined together.
- A Page needs AsyncData to render data without defining the API URL or request options itself.
- A Component needs a function it can call after a form submission, deletion confirmation, or another event.
- A Page or Route combines API calls from several domains or features and should call their composables instead of repeating request details.

## Do Not Apply When

- Nuxt Auth Utils or another library already provides the request and updates the related client state. Use that library's API instead of wrapping it in an app composable.
- The change applies to every app request, such as a base URL, header, credential, retry setting, or shared response hook. Configure the app's fetch client instead.
- A request is used only in one Page or Route and does not belong to a domain or feature. Define it directly in that Page or Route instead of creating a domain composable.
- The proposed composable exists only to make a directory symmetrical, anticipate future reuse, or expose generic CRUD methods. Keep the request definition direct and specific until a concrete need appears.

## Why

Keeping each API call's URL, request inputs, and returned value in one place prevents Pages and Components from copying request details. When an endpoint or its options change, only one definition needs to change.

Native AsyncData from `useFetch` lets Nuxt fetch data during server rendering, reuse it from the hydration payload, and send a new request when a reactive value used to build the URL or request options changes—for example, a route parameter, current page, or filter. A request triggered by a form submission, deletion confirmation, or another event should start only after that event occurs. The composable returns a function so the Component or Page can start the request when it handles the event.

Pages and Routes can combine API calls from several domains or features by calling their composables. Each composable keeps its API URL and request options in one place, so combining the calls does not duplicate request definitions.

`useFetch` already provides `data`, `status`, `error`, and `refresh`. Using them means the feature does not need a second copy of the request state or its own refresh implementation.

## Implementation Guidance

- Keep each API composable with the domain or feature whose data it reads or changes. Use a domain-specific name, such as `useDiscussion`, `useDiscussions`, or `useDeleteDiscussion`.
- For data needed during rendering, call `useFetch` or a composable created with `createUseFetch` during setup and return the resulting `AsyncData`.
- For an event-triggered request, return an async function that sends the request when the Component or Page invokes it.
- Keep the API URL, request inputs, and returned value in the composable. Keep feedback, refresh timing, dialog closure, and navigation in the Component or Page that starts the request.
- Start with native AsyncData. Add feature-specific state only for behavior that AsyncData does not provide, such as accumulating results across pages, recovering from a failed incremental request, or preventing an outdated response from replacing current data.

## Minimal Nuxt Example

`useAPI` and `$api` are configured as described in [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md). The following example defines the project-specific requests and keeps refresh timing in the Component.

```ts
// app/composables/useProjects.ts
export async function useProjects() {
  return await useAPI("/api/projects")
}
```

```ts
// app/composables/useCreateProject.ts
export function useCreateProject() {
  const { $api } = useNuxtApp()

  return (input: { name: string }) => $api("/api/projects", {
    method: "POST",
    body: input,
  })
}
```

```vue
<script setup lang="ts">
const { data: projects, refresh } = await useProjects()
const createProject = useCreateProject()

async function handleCreate(name: string) {
  await createProject({ name })
  await refresh()
}
</script>
```

## Verified App Examples

- [`useDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) builds the detail URL from a reactive Discussion ID and returns the resulting `AsyncData`.
- [`useDiscussions`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) keeps the collection URL and reactive page and limit options together and returns `AsyncData`.
- [`DiscussionsCollection`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionsCollection.vue) stores the current page and uses the returned data, status, and refresh function. [`DiscussionsList`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionsList.vue) receives the values it needs as props and emits page changes without defining the request.
- [`useCreateDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCreateDiscussion.ts) and [`useDeleteDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDeleteDiscussion.ts) keep each request's URL, method, and input together and return functions for later execution.
- [`CreateDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/CreateDiscussion.vue) and [`DeleteDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DeleteDiscussion.vue) invoke those functions after form submission or deletion confirmation and decide pending feedback, success notifications, refresh timing, and when the drawer or dialog closes.

## Trade-offs And Limitations

Defining a request in a domain-specific composable adds a file and indirection compared with defining it directly in a Page or Component. A reader may need to open the composable to see the exact API URL and request options.

Native AsyncData follows Nuxt's standard behavior. A feature that needs different behavior must add and maintain its own state and logic.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch)
- [Nuxt `$fetch`](https://nuxt.com/docs/4.x/api/utils/dollarfetch)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Choose Replacement or Append Pagination at the Feature Boundary](pagination-strategies.md)
