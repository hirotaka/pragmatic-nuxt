---
title: Treat API Payloads as Serialized JSON Values
semanticId: serialized-api-payloads
category: request-boundaries
prerequisites: []
status: confirmed
---

# Treat API Payloads as Serialized JSON Values

## Practice

Server-side values, JSON payloads, and values used by UI controls or calculations do not always have the same type. Separate type definitions can reflect what each part of the application needs.

For example, a server may hold a datetime as a `Date`, while a JSON response contains an ISO string. A date picker that accepts `Date` objects may need that string converted for its input.

Keeping these differences explicit makes it easier to see what the API sends and what a particular feature needs. Rather than automatically converting response values in a shared fetch client, API composables and component props can use the JSON types, with conversions made where a control or calculation requires another type.

## Apply When

Use this practice when:

- A value has different types in server code and in a JSON request or response, such as a `Date` represented as an ISO string.
- Deciding which type definitions to share between server code, API composables, and components.
- Considering automatic conversion of JSON response values in a shared fetch client.
- Connecting a JSON response value to a UI control or calculation that requires another type.

## Do Not Apply When

Do not use this practice when:

- Choosing types for data used only within server or client code, without crossing a JSON API boundary.
- Sending or receiving files, streams, `FormData`, or other non-JSON content.
- Serializing Nuxt's hydration payload, which transfers server-rendered data to the client through a mechanism separate from JSON API responses.
- Deciding which inputs are valid, who can access an endpoint, or how a response groups resources and metadata. These decisions concern validation, authorization, and response design rather than JSON value types.

## Why

JSON can represent strings, numbers, booleans, null, arrays, and objects, but it has no `Date` type. When a server serializes a valid JavaScript `Date` using standard JSON serialization, the result is an ISO string. Parsing that response produces a string, not a `Date` object.

This difference means that a type describing a server record may not describe the JSON response accurately. Declaring the response field as a `Date` in TypeScript does not change the string received at runtime. Separate definitions let the server record and the JSON response each describe their actual values.

In a full-stack Nuxt application, Nitro generates response types from the application's server routes, accounting for JSON serialization. Nuxt's `useFetch` uses these types to infer the response, including datetime fields serialized as strings. Keeping those JSON types lets server routes and client-side calls stay connected through Nuxt's built-in type inference. Converting response values to `Date` introduces a different result type that also needs to be represented accurately.

Converting datetime strings in a shared fetch client makes that client responsible for deciding which strings represent dates and how to convert them for every endpoint using it. Keeping the JSON types as the basis for API composables and component props leaves those decisions with the controls or calculations that need them. A date picker that requires a `Date` can receive one, while a formatter that accepts an ISO string can use the string directly.

## Implementation Guidance

- Let Nuxt's `useFetch` and `$fetch` infer response types from server routes.
- Define shared request types and any explicit response types using JSON-compatible fields. Keep server record types separate where they contain values such as `Date` objects. API composables and component props can share the JSON response type.
- Prepare server response values in the route or a serializer function. A serializer converts a record into the intended response, for example by converting datetime fields to ISO strings. A separate function is useful when that conversion is reused or needs focused tests.
- Keep datetime strings as strings in shared fetch clients and data-fetching composables. When a UI control or calculation requires a `Date`, create it for that use. A formatter that accepts an ISO string can use the response value directly.
- Prepare JSON request bodies in the format expected by the endpoint. For example, if a date picker returns a `Date` and the endpoint expects an ISO string, convert the value when building the request body.
- Validate request inputs separately. JSON serialization determines how values are sent, not whether those values are valid or whether the caller has permission to submit them.

## Minimal Nuxt Example

Return an ISO string from the server route, while keeping the server record's datetime as a `Date`.

```ts
// server/api/project.get.ts
export default defineEventHandler(() => {
  const record = {
    id: "project-1",
    startsAt: new Date("2026-09-04T12:00:00Z"),
  };

  return {
    id: record.id,
    startsAt: record.startsAt.toISOString(),
  };
});
```

Fetch the project in a component and format the datetime with Day.js directly in the template.

```vue
<!-- app/components/ProjectStartDate.vue -->
<script setup lang="ts">
import dayjs from "dayjs";

const { data: project } = await useFetch("/api/project");
</script>

<template>
  <span v-if="project">
    {{ dayjs(project.startsAt).format("MMMM D, YYYY") }}
  </span>
</template>
```

The server record holds a `Date`, while `project.startsAt` is inferred as a `string`. The component uses Day.js to create display text from that string.

## App Examples

- The shared [`Discussion` type](../../../apps/bulletproof-nuxt/layers/discussions/shared/types.ts) defines `createdAt` and `updatedAt` as strings.
- [`serializeDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/server/utils/serializeDiscussion.ts), [`serializeComment`](../../../apps/bulletproof-nuxt/layers/comments/server/utils/serializeComment.ts), and [`serializeTeam`](../../../apps/bulletproof-nuxt/layers/teams/server/utils/serializeTeam.ts) convert server datetime fields to ISO strings with `toISOString()`.
- [`useDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) delegates to the application's `useAPI` wrapper around Nuxt's `useFetch`. It uses the route's response type without adding a datetime conversion.
- [`DiscussionView.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionView.vue) passes `discussion.createdAt` to [`formatDate`](../../../apps/bulletproof-nuxt/layers/base/app/utils/format.ts), which uses Day.js to produce display text from the string.

## Trade-offs and Limitations

Separate server and response types make differences such as `Date` and `string` explicit, but they can duplicate fields. When an API changes, serializers and explicit response types need to stay consistent. Nuxt's inferred response types reduce this duplication on the client side.

Local conversion keeps date handling specific to the feature that needs it, but similar conversions may appear in several components. A shared formatter or conversion function can reduce that repetition without changing the types returned by the fetch client.

An ISO datetime string does not determine which timezone to display or how a date-only form value should become a timestamp. Those choices depend on the feature's date-handling requirements.

## Sources

- [MDN: `JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Day.js: Parse a String](https://day.js.org/docs/en/parse/string)
- [Day.js: Format](https://day.js.org/docs/en/display/format)

## Related Practices

- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Design API Responses for Direct Use with Nuxt Data Fetching](semantic-api-response-shapes.md)
