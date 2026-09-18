import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  define: {
    "import.meta.client": "false",
    "import.meta.server": "true",
  },
  test: {
    name: "server",
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "app/plugins/__tests__/vue-query.test.ts",
      "layers/base/app/utils/__tests__/createAppApi.test.ts",
    ],
  },
});
