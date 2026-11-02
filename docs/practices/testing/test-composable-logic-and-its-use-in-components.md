---
title: Test Composable Logic and Its Use in Components
semanticId: test-composable-logic-and-its-use-in-components
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Test Composable Logic and Its Use in Components

## Practice

Test a composable's own logic directly, such as state transitions, calculations, and error handling.

Use component tests to verify how components use the composable, without mocking it. A composable that only forwards an API call is tested through the component that uses it.

## Apply When

- The application defines composables.
- A Nuxt layer defines composables.

## Do Not Apply When

- Neither the application nor its Nuxt layers define composables.

## Why

A composable's dependencies determine the context required to test it. Reactivity APIs can be used without a host component, while lifecycle hooks and provide/inject require one. A small test component supplies that context without requiring a feature's UI.

When state changes, asynchronous requests, and UI updates are linked, a component test can make the sequence easier to verify. For example, clicking a pagination button changes the page number, starts a request, and updates the displayed rows. The test can check the loading indicator and new rows through the component, rather than calling the composable's methods and inspecting its returned state directly.

## Implementation Guidance

- In direct tests, call the composable and check its returned state, methods, and side effects.
- Supply the Vue context the composable uses: a mounted test component for lifecycle hooks or provide/inject, or an effect scope for `onScopeDispose`. Unmount the component or stop the scope after the test.
- Use the Nuxt environment when tests depend on Nuxt APIs, auto-imports, or plugin injections.
- In component tests, use the real composable and check rendered output or emitted events in response to inputs and user interactions.

## Minimal Nuxt Example

A composable that uses only Vue Reactivity APIs can be called directly in a test.

```ts
// app/composables/useToggle.ts
import { ref } from "vue";

export function useToggle(initial = false) {
  const enabled = ref(initial);
  const toggle = () => {
    enabled.value = !enabled.value;
  };

  return { enabled, toggle };
}
```

The composable returns a reactive boolean and a method that reverses its value.

The test checks the initial value and the result of calling `toggle`.

```ts
// test/unit/app/composables/useToggle.test.ts
import { expect, test } from "vitest";
import { useToggle } from "../../../../app/composables/useToggle";

test("toggles the supplied initial state", () => {
  const { enabled, toggle } = useToggle(true);

  expect(enabled.value).toBe(true);
  toggle();
  expect(enabled.value).toBe(false);
});
```

The test runs in the Node environment because this composable does not depend on a component instance or Nuxt APIs.

## App Examples

- [`useAPI.test.ts`](../../../apps/bulletproof-nuxt/test/nuxt/app/composables/useAPI.test.ts) checks the error handlers and hook order configured by `useAPI`.
- [`usePaginatedAPI.test.ts`](../../../apps/bulletproof-nuxt/test/nuxt/app/composables/usePaginatedAPI.test.ts) directly tests URL pagination and refresh behavior after creation or deletion.
- [`useInfiniteAPI.test.ts`](../../../apps/bulletproof-nuxt/test/nuxt/app/composables/useInfiniteAPI.test.ts) directly tests page accumulation, refresh, cancellation, and separation between endpoints.
- [`index.test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/nuxt/app/pages/app/discussions/index.test.ts) checks pagination requests and post-deletion page changes through the real discussion page and its composables.
- [`login.test.ts`](../../../apps/bulletproof-nuxt/layers/auth/test/nuxt/app/pages/auth/login.test.ts) checks session refresh before success notification and navigation through the real login page and `useLogin`.

## Trade-offs and Limitations

Composable tests can require extensive setup and mocks when pure logic is mixed with lifecycle hooks, injected services, or API calls. Extracting calculations, checks, and transformations that depend only on their inputs into utility functions lets those rules be unit tested without recreating the runtime context. Reactive state and the coordination of side effects remain in the composable.

Component test failures can be harder to trace to a single composable because rendering, event handling, and other dependencies also take part. In return, these tests check how a component behaves when it uses the real composable.

## Sources

- [Vue Testing: Testing Composables](https://vuejs.org/guide/scaling-up/testing.html#testing-composables)
- [Vue Testing: Component Testing](https://vuejs.org/guide/scaling-up/testing.html#component-testing)
- [Vue Reactivity API: effectScope](https://vuejs.org/api/reactivity-advanced.html#effectscope)
- [Vue Test Utils: Testing Composables](https://test-utils.vuejs.org/guide/advanced/reusability-composition)
- [Nuxt Testing: Test Environments](https://nuxt.com/docs/4.x/getting-started/testing#test-environments)
- [Nuxt Testing: Helpers](https://nuxt.com/docs/4.x/getting-started/testing#helpers)

## Related Practices

- [Match Data-Fetching Tests to the Behavior They Exercise](../nuxt-use-fetch/data-fetching-test-boundaries.md)
- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
- [Organize Nuxt Tests by Application and Layer Responsibility](organize-nuxt-tests-by-application-and-layer-responsibility.md)
