---
title: Pinia Colada Practices
---

# Pinia Colada Practices

This collection documents practices for organizing and integrating Pinia Colada in
Pragmatic Nuxt applications. The practices focus on native Pinia Colada APIs and
application boundaries rather than library-neutral abstractions or API parity.

## Query Organization

1. [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)

## Prefetching

2. [Use Query Prefetching to Reduce Waiting for Data](use-query-prefetching-to-reduce-waiting-for-data.md)

## Pagination

3. [Handle Page Changes with Paginated Queries](handle-page-changes-with-paginated-queries.md)

## Infinite Queries

4. [Accumulate Pages with Infinite Queries and Explicit Load More](infinite-query-explicit-load-more.md)

## Mutations

5. [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
6. [Wait for Mutation Requests to Complete](wait-for-mutation-requests-to-complete.md)
7. [Synchronize Related Queries in the Background After Successful Writes](synchronize-related-queries-in-the-background-after-successful-writes.md)

## Nuxt Integration

8. [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](shared-custom-fetch.md)
9. [Use Nuxt Auth Utils for Authentication Session Management with Pinia Colada](keep-authentication-session-state-in-nuxt-auth-utils.md)

## Query Retry

10. [Disable `$fetch` Retry When Using Pinia Colada Query Retry](use-pinia-colada-query-retry-without-transport-retry.md)

## Query Loading

11. [Use the Pinia Colada Delay Plugin to Avoid Loading Indicator Flicker During Short Background Refetches](use-the-pinia-colada-delay-plugin-to-avoid-loading-indicator-flicker.md)
