---
title: E2E Tests for Important User Journeys
semanticId: center-e2e-tests-on-important-user-journeys
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# E2E Tests for Important User Journeys

## Practice

E2E tests check the Nuxt application's behavior under conditions close to actual use, with a real browser and the UI and backend running together.

The tests perform user actions through the UI and check the results the user can see.

## Apply When

- A Nuxt application implements both the UI and the API used by that UI.

## Do Not Apply When

- Nuxt provides only the UI, while a separate backend application implements the API.

## Why

UI and API tests can pass separately while the application still fails when users operate it in a browser. E2E tests check that UI actions reach the backend and that its results are reflected in the page.

For saved changes, checking the result after a reload distinguishes persisted data from state held only in the current page.

## Implementation Guidance

- Prepare the required data and authentication state.
- Open the target page and wait for Nuxt hydration.
- Perform the operation through the UI. Use role or label locators where available.
- Await assertions that check the expected visible result. For saved changes, check the result again after a reload.

## Minimal Nuxt Example

This case updates a user's first name through the UI and checks that the new name remains visible after a reload.

```ts
// layers/users/test/e2e/profile.spec.ts
import { expect, test } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("keeps the updated first name after reload", async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "profile-update", team.id, "ADMIN");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  await goto("/app/profile", { waitUntil: "hydration" });

  await page.getByRole("button", { name: "Update Profile" }).click();
  const dialog = page.getByRole("dialog", { name: "Update Profile" });
  await dialog.getByLabel("First Name").fill("Updated");
  await dialog.getByRole("button", { name: "Submit" }).click();

  await expect(dialog).toBeHidden();
  const profileName = page.getByRole("main").getByText("Updated", { exact: true });
  await expect(profileName).toBeVisible();

  await page.reload();
  await waitForNuxtHydration(page);
  await expect(profileName).toBeVisible();
});
```

`createTeam()` and `createAccount()` create records in the dedicated E2E database. `login()` prepares an authenticated session through the real login API; the profile update still goes through the UI. The Playwright cleanup project clears the test data after the dependent tests finish. `waitForNuxtHydration(page)` waits for hydration after the reload. These helpers are linked in App Examples.

## App Examples

- [`registration.spec.ts`](../../../apps/bulletproof-nuxt/test/e2e/registration.spec.ts) checks the registration, logout, and login journey through the UI.
- [`smoke.spec.ts`](../../../apps/bulletproof-nuxt/test/e2e/smoke.spec.ts) checks that discussion and comment changes survive reloads.
- [`profile.spec.ts`](../../../apps/bulletproof-nuxt/layers/users/test/e2e/profile.spec.ts) checks that profile changes update the page and user menu after a reload.
- [`discussions.spec.ts`](../../../apps/bulletproof-nuxt/layers/discussions/test/e2e/discussions.spec.ts) checks a representative server-rendered title separately from the hydrated page.
- [`factories.ts`](../../../apps/bulletproof-nuxt/test/e2e/support/factories.ts) creates the records required by the profile test.
- [`authentication.ts`](../../../apps/bulletproof-nuxt/test/e2e/support/authentication.ts) prepares an authenticated session through the login API.
- [`nuxtNavigation.ts`](../../../apps/bulletproof-nuxt/test/e2e/support/nuxtNavigation.ts) provides the hydration wait used after the reload.

## Trade-offs and Limitations

Running a browser with the application adds setup time and maintenance cost. Journey selection concentrates that work on important user outcomes rather than repeating every lower-level case.

Long journeys can fail early and leave later steps untested. Assertions at meaningful checkpoints help locate the failing transition.

A representative journey covers the path and data it exercises. Detailed input and permission checks remain necessary in the focused tests that own those rules.

## Sources

- [Playwright: Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright: Assertions](https://playwright.dev/docs/test-assertions)
- [Nuxt: Rendering Modes](https://nuxt.com/docs/4.x/guide/concepts/rendering)
- [Nuxt: Testing](https://nuxt.com/docs/4.x/getting-started/testing)

## Related Practices

- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
- [Use Playwright Test for Nuxt E2E Testing](use-playwright-test-for-nuxt-e2e-testing.md)
- [Application UI Testing Through Real Nuxt Page Components](test-application-ui-through-real-nuxt-page-components.md)
- [API Integration Tests Through the Nuxt Server](test-api-routes-through-the-nuxt-server.md)
