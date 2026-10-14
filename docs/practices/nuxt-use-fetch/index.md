---
title: Nuxt Data Fetching Practices
---

# Nuxt Data Fetching Practices

This collection documents practices for choosing and composing Nuxt data-fetching primitives. Follow the dependency-first reading order within each category; the numbers are a recommended path, not stable identifiers.

## Request Boundaries

1. [Use Custom Fetchers for Your API](custom-api-fetchers.md)
2. [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
3. [Pass Native `useFetch` Options Through Data-Fetching Composables](feature-composable-options.md)
4. [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
5. [Define Domain and Feature API Calls in Composables](domain-feature-api-calls.md)
6. [Treat API Payloads as Serialized JSON Values](serialized-api-payloads.md)

## AsyncData Lifecycle

7. [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
8. [Share AsyncData Through Feature Composables](shared-async-data.md)
9. [Keep Existing Data Visible During Refresh](refresh-data-visibility.md)

## Failure and Workflow Outcomes

10. [Present API Failures from Custom Fetchers](api-error-notifications.md)
11. [Separate Completed Changes from Data Refresh Failures](completed-change-refresh-failures.md)
12. [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)

## Testing and Evidence

This section contains testing guidance specific to the data-fetching Practices above.

13. [Match Data-Fetching Tests to the Behavior They Exercise](data-fetching-test-boundaries.md)
