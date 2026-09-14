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
      "layers/base/app/utils/__tests__/createAppApi.test.ts",
      "layers/auth/server/__tests__/replaceUserSessionContract.test.ts",
      "layers/auth/server/__tests__/loginRoute.test.ts",
      "layers/auth/server/__tests__/registerRoute.test.ts",
      "layers/auth/server/plugins/__tests__/sessionPlugin.test.ts",
      "layers/auth/server/utils/__tests__/requireCurrentUser.test.ts",
      "layers/auth/server/__tests__/protectedEventHandler.test.ts",
      "layers/discussions/server/__tests__/discussionCollectionAuth.test.ts",
    ],
  },
});
