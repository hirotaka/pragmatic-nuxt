import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "e2e",
          fileParallelism: false,
          include: ["test/e2e/**/*.test.ts"],
          environment: "node",
          testTimeout: 30000,
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.test.ts"],
          environment: "nuxt",
          // Use happy-dom's storage rather than Node's native WebStorage.
          execArgv: ["--no-experimental-webstorage"],
        },
      }),
    ],
  },
});
