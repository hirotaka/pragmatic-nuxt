---
title: Separate Implementation Verification from Test Suite Design
semanticId: separate-implementation-verification-from-test-suite-design
category: testing-and-evidence
prerequisites: []
status: confirmed
---

# Separate Implementation Verification from Test Suite Design

## Practice

Let AI agents write the tests they need to verify their implementation work. Design and write the normal test suite as a separate task.

Use the application's requirements, testing principles, and existing tests to decide which behaviors the normal suite should verify and at which boundaries. Create or update those tests using the codebase's testing conventions.

## Apply When

- AI agents write tests from different perspectives while implementing a change.
- The normal suite needs a consistent design based on application behavior and the codebase's testing principles.

## Do Not Apply When

- The development workflow does not use AI agents to write task-specific implementation tests.

## Why

A test can be useful for checking that an implementation task is complete without needing to run on every later change. An agent working on a local change may also miss tests elsewhere in the codebase and add checks for behavior that is already covered.

The normal suite has a different purpose: checking application behavior when the code changes. Its design needs application requirements, testing principles, and existing tests as context. Passing the checks written during implementation does not answer all of those design questions.

## Implementation Guidance

- Keep implementation checks in `.agents/` within the relevant test directories. Track them in Git, but exclude them from normal CI checks.
- After implementation, design and write the normal suite using the application's requirements, testing principles, and existing tests. Leave the implementation checks in place.
- Review implementation checks periodically. This may lead to new normal suite tests or deletion of checks that are no longer useful. Choose the review criteria and automation separately.

## Minimal Nuxt Example

During implementation, an agent writes checks inside `.agents/` for the part of the application being changed. After implementation, it separately designs the normal suite tests using the application's requirements, testing principles, and existing tests. The implementation checks remain in place.

```text
# Test directory layout
test/nuxt/app/pages/
├── login.test.ts
└── .agents/
    └── sessionTiming.test.ts

layers/<name>/test/unit/server/api/
├── create.post.test.ts
└── .agents/
    └── requestProbe.test.ts
```

`sessionTiming.test.ts` and `requestProbe.test.ts` are implementation checks. `login.test.ts` and `create.post.test.ts` belong to the normal suite. Choose their behavior checks, scope, and setup from the application's requirements and testing principles rather than automatically copying the implementation probes. Both sets are tracked in Git, while CI excludes the implementation checks. The directory layout alone does not configure that exclusion.

## App Examples

- [Login page tests](../../../apps/bulletproof-nuxt/layers/auth/test/nuxt/app/pages/auth/login.test.ts) check that login completion waits for the authenticated session refresh.
- [Shared request client tests](../../../apps/bulletproof-nuxt/test/nuxt/app/composables/useAPI.test.ts) check the execution order of shared and API-call error handlers.

## Trade-offs and Limitations

A separate task does not give an agent broader context by itself. Designing the normal suite still requires examining the relevant implementation, application requirements, existing tests, and testing principles.

A directory name alone does not establish CI isolation. Test collection, linting, type checking, and build-time checks each need a verified exclusion for the tools in use.

Git tracking preserves implementation checks but does not keep them working. Checks excluded from CI can become stale, so run them deliberately when reusing them.

## Sources

- [Kent C. Dodds: I Delete Tests Every Night (On Purpose)](https://share.transistor.fm/s/78212e5c)
- [Vitest: exclude](https://vitest.dev/config/exclude)
- [Playwright TestConfig: testIgnore](https://playwright.dev/docs/api/class-testconfig#test-config-test-ignore)
- [ESLint: Ignore Files](https://eslint.org/docs/latest/use/configure/ignore)

## Related Practices

- [Organize Nuxt Tests by Application and Layer Responsibility](organize-nuxt-tests-by-application-and-layer-responsibility.md)
- [Center Nuxt Application Testing on Integration Tests](center-nuxt-application-testing-on-integration-tests.md)
- [Match Data-Fetching Tests to the Behavior They Exercise](../nuxt-use-fetch/data-fetching-test-boundaries.md)
