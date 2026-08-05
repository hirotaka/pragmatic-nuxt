---
title: Treat API Payloads as Serialized JSON Values
semanticId: serialized-api-payloads
category: request-boundaries
prerequisites: []
status: confirmed
---

# Treat API Payloads as Serialized JSON Values

## Practice

Use serialized JSON types as the shared contract between API composables and components. When a different runtime representation such as `Date` is required, convert the value only where that representation is needed.

Do not transform every response date into `Date` objects in a shared fetch client or composable.

## Apply When

- Sending a JSON request body with POST, PUT, or PATCH.
- Receiving a JSON response from a Nuxt server route.
- A server-side `Date` becomes an ISO string in a response.
- Passing response data from an API composable to a component.
- A specific UI control or calculation requires a runtime date object.

## Do Not Apply When

- Values do not cross an HTTP boundary.
- The request uses `FormData`, a file upload, a stream, or another non-JSON payload.
- Designing server-side validation, authentication, authorization, or response-envelope policy.

## Why

Server runtime values and client-visible HTTP values are not necessarily the same type. A server-side `Date` becomes an ISO string in JSON, properties with `undefined` values are omitted, and `BigInt` is not supported by standard JSON serialization.

A caller-supplied generic does not transform runtime data. Keeping serialized values unchanged through API composables and component contracts aligns TypeScript types with actual responses.

## Implementation Guidance

- Match request and response types to their actual JSON wire representations.
- Represent API datetime fields as ISO strings.
- Return serialized response values unchanged from API composables.
- Preserve serialized types in component props and shared API types.
- Parse values locally for display, controls, or calculations, then serialize them again before a later request.
- Prefer Nitro's generated response inference over unnecessary caller-supplied response generics for app-owned internal routes.
- Serialize server runtime dates at the response boundary.
- Do not treat JSON serialization as server-side validation.

## Minimal Nuxt Example

```ts
export interface Project {
  id: string;
  name: string;
  startsAt: string;
  createdAt: string;
}

export const serializeProject = (project: ProjectRecord): Project => ({
  id: project.id,
  name: project.name,
  startsAt: project.startsAt.toISOString(),
  createdAt: project.createdAt.toISOString(),
});
```

```vue
<script setup lang="ts">
import dayjs from "dayjs";

const props = defineProps<{ project: Project }>();
const displayDate = computed(() => dayjs(props.project.startsAt).format("MMMM D, YYYY"));
</script>
```

## Verified App Examples

- Shared `Discussion`, `Comment`, and `User` types define datetime fields as `string`.
- Discussion, comment, and team serializers convert server runtime datetimes to ISO strings.
- API composables do not transform serialized response dates into `Date` objects.
- Components pass serialized strings to the shared date formatter.
- App-owned internal route callers use Nitro's generated response inference.

## Trade-offs and Limitations

Using serialized types as the shared contract means a UI that needs `Date` or another runtime object creates it at the point of use. Globally converting responses creates a second app-wide representation and requires conversion back for later requests.

Display format, timezone, locale, server validation, non-JSON payloads, and response-envelope policy require separate decisions.

## Sources

- [Nuxt Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nitro TypeScript](https://nitro.build/guide/typescript)
- [Day.js](https://day.js.org/)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)
