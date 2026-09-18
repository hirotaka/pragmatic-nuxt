---
title: TanStack Query Practices
status: confirmed
---

# TanStack Query Practices

These confirmed Practices describe how a layered Nuxt application can integrate TanStack Query, organize queries and mutations, and keep request and failure boundaries explicit.

Implementation examples point to the [TanStack Query Reference](../../../apps/reference/bulletproof-nuxt-tanstack-query/README.md).

## Start Here

1. [Use Nuxt Query to Integrate TanStack Query with Nuxt](use-nuxt-query-to-integrate-tanstack-query-with-nuxt.md)

The remaining Practices build on this Nuxt integration boundary.

## Query and Mutation Design

2. [Centralize Shared Request Rules in a Custom Nuxt `$fetch` Instance](centralize-shared-request-rules-in-a-custom-nuxt-fetch-instance.md)
3. [Keep Query Keys and Query Functions Together as Reusable Query Options](keep-query-keys-and-query-functions-together-as-reusable-query-options.md)
4. [Keep Mutation Success Separate from Query Refetch Failures](keep-mutation-success-separate-from-query-refetch-failures.md)

## Collection Behavior

5. [Load More Pages with Infinite Queries](load-more-pages-with-infinite-queries.md)

## Failure Boundaries

6. [Keep Query Retries in TanStack Query](keep-query-retries-in-tanstack-query.md)
