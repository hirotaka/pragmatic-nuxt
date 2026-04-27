// Provide a fallback $fetch to prevent ReferenceError from Nuxt's internal
// manifest timer firing after the test environment has been torn down.
if (typeof globalThis.$fetch === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).$fetch = () => Promise.resolve();
}
