import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/e2e/**",
      "**/__tests__/integration/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockServiceWorker.js",
        "**/.nuxt/**",
        "**/dist/**",
      ],
    },
    onConsoleLog(log) {
      // Suppress known warnings that can't be fixed at the moment
      if (
        log.includes("<Suspense> is an experimental feature")
        || log.includes("injection \"Symbol(regle)\" not found")
        || log.includes("Regle Devtools are not available")
      ) {
        return false;
      }
    },
  },
});
