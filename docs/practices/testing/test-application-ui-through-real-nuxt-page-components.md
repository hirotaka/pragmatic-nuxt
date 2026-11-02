---
title: Application UI Testing Through Real Nuxt Page Components
semanticId: test-application-ui-through-real-nuxt-page-components
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Application UI Testing Through Real Nuxt Page Components

## Practice

Component tests for application UI built from existing library components use the real Nuxt page component. The tests run the actual feature components, composables, and validation to check application-specific input handling, permissions, API interactions, and rendered results.

## Apply When

- The application's UI is built from components provided by UI libraries.
- Pages combine those components with application-specific state, validation, or API calls.

## Do Not Apply When

- The work focuses on developing a UI component's own appearance and interactions, rather than composing application UI from existing library components.

## Why

UI libraries supply the basic controls, while the application determines how inputs, validation, permissions, and API results affect the screen. A page component brings these parts together, making it a useful entry point for testing the application's behavior.

A wrong prop or a disconnected event handler can break a feature even when each child component works on its own. Testing the real page checks the data passed to children and the page's response to their events in the same interaction.

## Implementation Guidance

- The test imports the real page component from the application or its Nuxt layer and uses `mountSuspended` or `renderSuspended` in the Nuxt environment.
- The feature components, application composables, and validation involved in the behavior run together. API responses are controlled with `registerEndpoint` when the test requires data.
- The test drives user interactions and checks rendered output, submitted request data, or the navigation requested by the page.

## Minimal Nuxt Example

The page combines an existing shadcn-vue button with its own count and limit.

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
import { Button } from "@/components/ui/button";

const count = ref(0);
</script>

<template>
  <Button
    :disabled="count >= 2"
    @click="count++"
  >
    Increment
  </Button>
  <p role="status">{{ count }}</p>
</template>
```

The page increments the count on click and disables the button when the count reaches two.

The test mounts the page with the real button and operates it through the rendered UI.

```ts
// test/nuxt/app/pages/index.test.ts
import { expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "~~/app/pages/index.vue";

test("disables the increment action at the page limit", async () => {
  const wrapper = await mountSuspended(IndexPage);
  try {
    const button = wrapper.get("button");
    expect(wrapper.get('[role="status"]').text()).toBe("0");
    await button.trigger("click");
    expect(wrapper.get('[role="status"]').text()).toBe("1");
    await button.trigger("click");
    expect(wrapper.get('[role="status"]').text()).toBe("2");
    expect(button.attributes("disabled")).toBeDefined();
  }
  finally {
    wrapper.unmount();
  }
});
```

The assertions check how the page connects the button to its count, display, and limit.

## App Examples

- [`register.test.ts`](../../../apps/bulletproof-nuxt/test/nuxt/app/pages/register.test.ts) checks the real registration form, team data supplied by the page, and navigation after session refresh.
- [`index.test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/nuxt/app/pages/app/discussions/index.test.ts) checks the discussion table, real create and delete controls, and page updates after mutations.
- [`[id].test.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/nuxt/app/pages/app/discussions/[id].test.ts) checks the real discussion and comment views, including editing, comment creation, and pagination.
- [`profile.test.ts`](../../../apps/bulletproof-nuxt/layers/users/test/nuxt/app/pages/app/profile.test.ts) checks profile data passed into the real update form and the page's response to submission and session refresh.

## Trade-offs and Limitations

Testing a page can require more setup than testing a child alone because other children may load data or depend on session state. Cases for several feature components can also accumulate in the same page spec, making the file large and harder to maintain.

Nuxt runtime mounting does not reproduce a browser journey through the complete application. It runs the page in a simulated DOM, while `registerEndpoint` supplies test responses without executing the production API handler or its database operations. E2E tests complement these component tests by checking important user journeys in a real browser against the running application.

## Sources

- [Vue Testing: Component Testing](https://vuejs.org/guide/scaling-up/testing.html#component-testing)
- [Nuxt pages/ Directory](https://nuxt.com/docs/4.x/directory-structure/app/pages)
- [Nuxt Testing: Helpers](https://nuxt.com/docs/4.x/getting-started/testing#helpers)
- [shadcn-vue: Button](https://shadcn-vue.com/docs/components/button)
- [Vue Testing: E2E Testing](https://vuejs.org/guide/scaling-up/testing.html#e2e-testing)

## Related Practices

- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
- [Test Composable Logic and Its Use in Components](test-composable-logic-and-its-use-in-components.md)
- [Organize Nuxt Tests by Application and Layer Responsibility](organize-nuxt-tests-by-application-and-layer-responsibility.md)
- [Use Playwright Test for Nuxt E2E Testing](use-playwright-test-for-nuxt-e2e-testing.md)
