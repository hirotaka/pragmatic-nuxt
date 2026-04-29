# 🧪 Testing

The efficacy of testing lies in the comprehensive coverage provided by integration and end-to-end (e2e) tests. While unit tests serve a purpose in isolating and validating individual components, the true value and confidence in application functionality stem from robust integration and e2e testing strategies.

## Types of Tests

### Unit Tests

Unit tests are the smallest tests you can write. They test individual parts of your application in isolation. They are useful for testing shared components, composables, and utility functions that are used throughout the entire application. They are also useful for testing complex logic in a single component. They are fast to run and easy to write.

[Unit Test Example Code](../layers/auth/app/components/LoginForm.spec.ts)

### Integration Tests

Integration testing checks how different parts of your application work together. It's crucial to focus on integration tests for most of your testing, as they provide significant benefits and boost confidence in your application's reliability. While unit tests are helpful for individual parts, passing them doesn't guarantee your app will function correctly if the connections between parts are flawed. Testing various features with integration tests is vital to ensure that your application works smoothly and consistently.

[Integration Test Example Code](../layers/discussions/app/components/CreateDiscussionForm.spec.ts)

### E2E Tests

End-to-End Testing is a method that evaluates an application as a whole. These tests involve automating the complete application, including both the frontend and backend, to confirm that the entire system functions correctly. End-to-End tests simulate how a user would interact with the application.

[E2E Test Example Code](../e2e/smoke.spec.ts)

## Recommended Tooling

### [Vitest](https://vitest.dev)

Vitest is a powerful testing framework with features similar to Jest, but it's more up-to-date and works well with modern tools. It offers native TypeScript support, watch mode with HMR, and built-in coverage reporting. It's highly customizable and flexible, making it a popular option for testing JavaScript code.

### [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro)

Testing Library is a set of libraries and tools that makes testing easier than ever before. Its philosophy is to test your app in a way it is being used by a real world user instead of testing implementation details. For example, don't test what is the current state value in a component, but test what that component renders on the screen for its user.

### [Playwright](https://playwright.dev)

Playwright is a tool for running e2e tests in an automated way. You define all the commands a real world user would execute when using the app and then start the test. It can be started in two modes:

- **Browser mode** - Opens a dedicated browser and runs your application. You get tools to visualize and inspect your application on each step. Run this locally when developing.
- **Headless mode** - Starts a headless browser and runs your application. Useful for integrating with CI/CD to run on every deploy.

### [@nuxt/test-utils](https://nuxt.com/docs/getting-started/testing)

Official Nuxt testing utilities that integrate with both Vitest and Playwright. It provides helpers for mounting components with Nuxt context, SSR testing support, and hydration-aware navigation for e2e tests.

## Test Structure

Tests should be colocated with their source files for unit and integration tests. E2E tests live in a dedicated `e2e/` directory:

- Unit/integration tests: `ComponentName.spec.ts` next to `ComponentName.vue`
- E2E tests: `e2e/*.spec.ts` for full workflow tests

[Test Utilities Example Code](../test/test-utils.ts)

[Data Generators Example Code](../test/data-generators.ts)
