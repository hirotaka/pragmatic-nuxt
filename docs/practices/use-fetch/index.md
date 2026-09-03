---
title: Nuxt Data Fetching Practices
---

# Nuxt Data Fetching Practices

This collection documents practices for choosing and composing Nuxt data-fetching primitives. Follow the dependency-first reading order within each category; the numbers are a recommended path, not stable identifiers.

## Request Boundaries

1. [Use Custom Fetchers for Your API](custom-api-fetchers.md)
2. [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
3. [Pass Native `useFetch` Options Through Data-Fetching Composables](feature-composable-options.md)
4. [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
5. [Define Domain and Feature API Calls in Composables](domain-feature-api-calls.md)
6. [Treat API Payloads as Serialized JSON Values](serialized-api-payloads.md)
7. [Design API Responses for Direct Use with Nuxt Data Fetching](semantic-api-response-shapes.md)

## AsyncData Lifecycle

8. [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
9. [Share AsyncData Through Feature Composables](shared-async-data.md)
10. [Keep Existing Data Visible During Refresh](refresh-data-visibility.md)

## Failure and Workflow Outcomes

11. [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
12. [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
13. [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)

## Collection Strategies

14. [Share Pagination Mechanics and Choose the Collection Strategy](pagination-strategies.md)

## Testing and Evidence

This section contains testing guidance specific to the data-fetching Practices above.

15. [Test Data-Fetching Claims at Their Owning Boundaries](data-fetching-test-evidence.md)
