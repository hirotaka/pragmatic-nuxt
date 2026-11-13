---
title: Preserve ranked search results through the UI
semanticId: preserve-ranked-search-results-through-the-ui
category: search
status: confirmed
---

# Preserve ranked search results through the UI

## Practice

Nuxt Content extracts searchable sections from markdown. Each section represents a page or heading and contains a title, parent headings, text, and an `id` for its destination.

Configure the search engine with the fields to search and the ranking options. Pass the results it returns to the selection UI without filtering or sorting them again. A term can match a section's text without appearing in its title. Filtering those results against the displayed title can remove that match.

Show the title, parent headings, and a plain-text excerpt so readers can see why a result matched and choose a destination. Keep the original `id`, including its heading anchor, for navigation.

## Apply When

- Search includes section text as well as headings.
- A search engine selects and ranks results independently of the text displayed in the selection UI.

## Do Not Apply When

- Search only needs to filter the labels shown in the UI, and the selection component can do this without a separate search engine. For example, typing "config" shows "Configuration".

## Why

A search term can match a section's text without appearing in its title. Filtering the returned results against the displayed labels can remove that match. Sorting them again can replace the engine's order.

Parent headings distinguish sections with similar titles. An excerpt around a body match explains why the result appeared, while the section's original `id` takes the reader to the matching destination.

## Implementation Guidance

- Separate section extraction from matching and ranking. `queryCollectionSearchSections` generates data; check which fields the search engine searches and returns.
- Preserve the returned results and order. Disable additional UI filtering, such as with Reka UI Combobox's `ignoreFilter`.
- Show titles, parent headings, and plain-text excerpts. Navigate with the original `id`, and do not render snippets with `v-html`.
- With `useSearchCollection`, wait for initialization and distinguish initialization failures from zero matches. Accept only the latest query's results while the dialog is open.

## Minimal Nuxt Example

This component receives results already selected and ordered by a search engine. Its parent supplies the current query through `v-model:query` and prepares each `excerpt` as plain text around a body match. `excerpt` is a display field, not a Nuxt Content result field.

```vue
<!-- app/components/SearchResults.vue -->
<script setup lang="ts">
import {
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
} from "reka-ui";

interface SearchItem {
  id: string;
  title: string;
  titles: string[];
  excerpt: string;
}

const props = defineProps<{ results: SearchItem[] }>();
const query = defineModel<string>("query", { required: true });
</script>

<template>
  <ComboboxRoot
    ignore-filter
    :reset-search-term-on-blur="false"
    :reset-search-term-on-select="false"
  >
    <ComboboxInput v-model="query" aria-label="Search documentation" />
    <ComboboxContent>
      <ComboboxItem
        v-for="item in props.results"
        :key="item.id"
        :value="item.id"
        @select="navigateTo(item.id)"
      >
        <span>{{ item.title }}</span>
        <span>{{ item.titles.join(" / ") }}</span>
        <span>{{ item.excerpt }}</span>
      </ComboboxItem>
    </ComboboxContent>
  </ComboboxRoot>
</template>
```

`ignore-filter` prevents the Combobox from removing results based on rendered text. The loop preserves the supplied order, and selection uses the unchanged `id`. Interpolation displays the excerpt as text rather than executing markup. The parent handles index initialization and query completion; this component does not run a second search.

## App Examples

- [DocsSearch.vue](../../../apps/nuxt-content/app/components/DocsSearch.vue) displays section titles and parent headings for selection by section ID.

## Trade-offs and Limitations

Separating search from selection keeps matches and ranking intact, but the surrounding component must coordinate initialization, query completion, and selection state. Excerpts make results easier to distinguish but take up space in the list; shortening them can hide the words that matched.

## Sources

- [Nuxt Content: searchable section data](https://content.nuxt.com/docs/utils/query-collection-search-sections)
- [Nuxt Content: client-side full-text search](https://content.nuxt.com/docs/utils/use-search-collection)
- [Reka UI Combobox: custom filtering](https://reka-ui.com/docs/components/combobox#custom-filtering)
- [Vue: HTML content escaping](https://vuejs.org/guide/best-practices/security.html#html-content)

## Related Practices

- [Keep Installed shadcn-vue Components Unmodified](../shadcn-vue/keep-installed-shadcn-vue-components-unmodified.md)
