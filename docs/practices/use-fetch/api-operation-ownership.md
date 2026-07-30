---
title: Give App-Owned API Operations an Explicit Owner
semanticId: api-operation-ownership
category: request-boundaries
prerequisites:
  - custom-api-fetchers
  - page-rendering-data
  - imperative-api-requests
status: confirmed
---

# Give App-Owned API Operations an Explicit Owner

## Practice

Give each app-owned API operation an explicit domain, feature, or application owner. Expose domain operations through focused composables, and let Pages or Routes act as application composition boundaries that combine public APIs from multiple owners. Choose file placement from the application's architecture; Nuxt Layers are one valid organization mechanism, not a prerequisite for this Practice.

Let Read composables register configured `useFetch` behavior during setup, and let Action composables expose imperative operations through the configured `$fetch` client.

Keep interaction and presentation lifecycle with the actual UI owner. An operation composable owns the endpoint contract; it does not automatically own pending UI, success feedback, refresh settlement, dialogs, navigation, or provider session state.

Use a cohesive domain controller when pagination, accumulation, resource transitions, recovery, and stale-result safety must move together. Do not replace these explicit boundaries with one generic CRUD facade.

## Apply When

- An application domain or feature owns an app API endpoint consumed by a Page, Component, or application workflow.
- A Page or Route combines UI or data from multiple domain or feature owners.
- A Read needs one owner-defined endpoint, reactive identity, option contract, or shared AsyncData boundary.
- An imperative Action needs one reusable endpoint, method, body, and result contract.
- Pagination or another stateful Read lifecycle has interdependent responsibilities that belong to one feature owner.
- A codebase uses composables as the public client API of its domains or features, whether they are organized with Layers, feature directories, or a flat app structure.

## Do Not Apply When

- Nuxt Auth Utils or another provider owns the request and its state contract.
- A request belongs to base transport implementation rather than a domain or application operation.
- No domain or feature owns the operation and an application composition owner has a deliberate one-off request.
- A proposed wrapper only anticipates future reuse or makes a directory look symmetrical without establishing an endpoint or lifecycle owner.
- A one-off setup-time Read belongs to application composition itself rather than an endpoint owned by an application domain or feature.
- A generic resource facade would hide the difference between setup-time AsyncData registration and event-time imperative execution.

## Why

Nuxt makes direct `useFetch` and `$fetch` calls convenient, but convenience does not assign operation ownership. Owner-specific composables keep route literals, request inputs, and operation names close to the domain or feature that defines them while preserving Nuxt's generated route inference and configured request behavior.

File placement expresses the application's architecture, not the Practice itself. A Layered app can place an operation in its owning Layer, a feature-oriented app can place it in an explicitly imported feature module, and a smaller app can use a domain-specific composable in `app/composables/`. Each form can express the same ownership boundary.

The boundary also keeps Nuxt lifecycle differences visible. Reads register AsyncData during setup so Server rendering and payload hydration work normally. Actions capture the configured client during setup and execute later without pretending to create AsyncData state.

This boundary does not require domain or feature internals to depend on one another. A Page or Route can compose public APIs while the underlying Components, composables, and request declarations remain independently owned. Consumer count alone does not erase endpoint ownership: a single Page can still depend on an owner-specific operation.

Nuxt combines composables from configured auto-import directories and Layers into an application-wide namespace. Domain-specific names therefore make ownership and operation intent visible at callsites: singular and plural nouns distinguish resource cardinality, while verb-plus-domain names distinguish imperative Actions from setup-time Reads.

This organization gives Pages and Components a stable owner-specific API without turning composables into a generic service layer. Stateful collection behavior remains in focused controllers only when its responsibilities form one lifecycle.

## Implementation Guidance

- Identify the domain, feature, or application owner before choosing a directory.
- In a Layered app, put a public composable in the owning Layer's top-level `app/composables/` directory so Nuxt's default scanner can discover it.
- In a feature-directory app, keep the composable in the owning feature module and import its public API explicitly unless that directory is deliberately configured for auto-import.
- In a smaller or flat app, use a domain-specific name in `app/composables/` instead of creating a Layer or feature hierarchy only for symmetry.
- Keep one principal composable per file and match the file name to the exported composable name.
- Name a single-resource Read with a singular domain noun and a collection Read with a plural domain noun.
- Name an Action with a verb and its domain operation, such as `useCreateProject` or `useUpdateProfile`.
- Register `useFetch` or a configured `createUseFetch` client when the Read composable is called during setup. Do not defer first registration to an event handler or arbitrary callback.
- Capture the configured `$fetch` client when an Action composable is created, then return an async operation for later execution.
- Use a thin Read as native AsyncData by default. Use an owner-specific controller only when the owner has additional cohesive state such as replace or append pagination.
- Keep provider session operations in their provider-aware workflow rather than forcing them into resource CRUD names.
- Let Pages, Routes, or other application-level workflows compose public APIs from multiple owners. Use explicit imports when they make those owners visible, and do not use composition as permission for arbitrary dependencies between domain or feature internals.
- If auto-imported public composables require nested organization, re-export the intended public API from a scanned top-level file. Do not enable recursive auto-import solely for directory aesthetics.
- Keep tests colocated with the domain, feature, application, or infrastructure owner. Choose test boundaries from behavior and lifecycle, not from a requirement that every composable have exactly one test file.

## Minimal Nuxt Example

```ts
// app/composables/useProjects.ts
export async function useProjects() {
  return await useAPI("/api/projects")
}
```

```vue
<script setup lang="ts">
const { data: projects, refresh } = await useProjects()
</script>
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

## Verified App Examples

- [`useDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) owns the reactive Discussion detail endpoint and returns native AsyncData to compatible consumers.
- [`useDiscussions`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) owns replacement pagination while reusing shared pagination mechanics.
- [`useComments`](../../../apps/bulletproof-nuxt/layers/comments/app/composables/useComments.ts) owns append pagination, resource transitions, recovery, and stale-result safety as one lifecycle.
- Discussion and Comment Action composables own their API operations while Components own pending UI, success feedback, refresh settlement, and completion.
- [`useLogin`](../../../apps/bulletproof-nuxt/layers/auth/app/composables/useLogin.ts) and [`useRegister`](../../../apps/bulletproof-nuxt/layers/auth/app/composables/useRegister.ts) retain provider-aware session reconciliation instead of adopting resource CRUD names.

## Trade-offs And Limitations

Operation-specific composables add files and indirection compared with direct Page or Component calls. The additional boundary is justified by explicit ownership, a stable endpoint contract, generated route typing, and a focused test seam; it should not grow into a second generic fetch framework.

Auto-imported composable names share an application-wide namespace even when their files come from different configured directories or Layers. Keep names domain-specific and avoid depending on directory or Layer priority to resolve accidental collisions.

A domain controller can be larger than a thin Read because it owns a coherent lifecycle. Do not infer that every resource needs one controller or that all CRUD operations should share one returned object.

This Practice organizes app-owned client operations. It does not define server repository boundaries, external provider clients, generic server-state caches, or query-library adoption.

The physical owner directory differs between applications. Document whether Pages, Routes, Layers, feature modules, or flat composables form the public boundary in each app; do not force every app into one directory shape.

Treating Pages or Routes as composition boundaries permits explicit dependencies on multiple public APIs, but it also makes their placement important. If a file cannot be understood as application composition in the project's architecture, move the composition boundary rather than allowing unrestricted domain-to-domain or feature-to-feature imports.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch)
- [Nuxt data fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt composables directory](https://nuxt.com/docs/4.x/directory-structure/app/composables)
- [Nuxt Layers](https://nuxt.com/docs/4.x/getting-started/layers)
- [Vue composables](https://vuejs.org/guide/reusability/composables.html)
- [Bulletproof React project structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
- [Bulletproof React API layer](https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Forward Native Options Through Thin Feature Reads](feature-composable-options.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Choose Replacement or Append Pagination at the Feature Boundary](pagination-strategies.md)
