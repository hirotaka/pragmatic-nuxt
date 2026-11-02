---
title: Direct Tests for All Application Utilities
semanticId: test-all-application-utilities-directly
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Direct Tests for All Application Utilities

## Practice

Calculations, checks, and transformations are separated from side effects into utility functions. Their results depend only on their inputs, and they do not change external state.

Every utility function and validation schema defined by the application has direct unit tests of its inputs and results.

## Apply When

- The application or its Nuxt layers define utility functions or validation schemas.

## Do Not Apply When

- Neither the application nor its Nuxt layers define utility functions or validation schemas.

## Why

The same inputs produce the same result, so a test can reproduce a utility's behavior without preparing or resetting application state. Small input/output examples make it straightforward to check normal inputs, defaults, and boundary values.

Keeping these checks close to each utility makes failures easier to trace to a calculation, transformation, or validation rule.

## Implementation Guidance

- Utility functions receive the values needed for their calculations as arguments. Values that change outside the function, such as the current time, are supplied by the caller.
- Tests call each utility's public functions directly. Cases check the normal inputs, defaults, boundary values, and errors defined by the function.
- Expected results are explicit values rather than values calculated with the utility or formatter being tested.
- Schema tests parse valid and invalid inputs and check field constraints, defaults, and parsed output.
- Utility and schema tests run in the Node environment, with explicit imports of the modules under test.

## Minimal Nuxt Example

A utility normalizes a search term by trimming surrounding whitespace and converting letters to lowercase.

```ts
// app/utils/normalizeSearchTerm.ts
export function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}
```

The result depends only on the supplied string, so the function can be tested without Nuxt context or a rendered component.

The test calls the utility with explicit inputs and expected strings.

```ts
// test/unit/app/utils/normalizeSearchTerm.test.ts
import { expect, test } from "vitest";
import { normalizeSearchTerm } from "../../../../app/utils/normalizeSearchTerm";

test.each([
  [" Nuxt ", "nuxt"],
  ["Hello World", "hello world"],
  [" \t ", ""],
])("normalizes %j to %j", (input, expected) => {
  expect(normalizeSearchTerm(input)).toBe(expected);
});
```

The cases check trimming, case conversion, preservation of internal spaces, and an empty result for whitespace-only input. They run in the Node environment.

## App Examples

- [`errors.test.ts`](../../../apps/bulletproof-nuxt/test/unit/app/utils/errors.test.ts) checks error-message precedence and fallback values through direct calls to `extractErrorMessage`.
- [`utils.test.ts`](../../../apps/bulletproof-nuxt/test/unit/app/lib/utils.test.ts) checks the class-merging results exposed by `cn`.
- [`registration.test.ts`](../../../apps/bulletproof-nuxt/test/unit/shared/utils/registration.test.ts) checks registration input constraints, mutually exclusive team choices, and parsed defaults.
- [`serializeTeam.test.ts`](../../../apps/bulletproof-nuxt/layers/teams/test/unit/server/utils/serializeTeam.test.ts) checks the team fields and ISO datetime strings returned by `serializeTeam`.

## Trade-offs and Limitations

Direct tests for every utility add expected results to maintain. Changes to a shared formatting or validation rule can require updates to the utility tests and the feature tests that exercise that rule.

Extracting a calculation can increase the number of parameters its caller must supply. Passing the current time as an argument, for example, lets tests use a fixed value without replacing the global clock.

## Sources

- [Vue Testing: Unit Testing](https://vuejs.org/guide/scaling-up/testing.html#unit-testing)
- [Vitest: Getting Started](https://vitest.dev/guide/)
- [Nuxt app/utils/ Directory](https://nuxt.com/docs/4.x/directory-structure/app/utils)
- [Nuxt Testing: Test Environments](https://nuxt.com/docs/4.x/getting-started/testing#test-environments)
- [Zod: Basic Usage](https://zod.dev/basics)

## Related Practices

- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
- [Test Composable Logic and Its Use in Components](test-composable-logic-and-its-use-in-components.md)
- [Organize Nuxt Tests by Application and Layer Responsibility](organize-nuxt-tests-by-application-and-layer-responsibility.md)
