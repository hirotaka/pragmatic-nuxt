import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/test/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockServiceWorker.js",
        "**/.nuxt/**",
        "**/dist/**",
      ],
    },
    projects: [
      {
        resolve: {
          alias: {
            "~": fileURLToPath(new URL("./app", import.meta.url)),
            "~~": fileURLToPath(new URL(".", import.meta.url)),
            "#layers": fileURLToPath(new URL("./layers", import.meta.url)),
            "#server": fileURLToPath(new URL("./server", import.meta.url)),
          },
        },
        test: {
          name: "unit",
          // Request suites build NuxtHub's shared generated packages in this checkout.
          fileParallelism: false,
          environment: "node",
          include: ["test/unit/**/*.{test,spec}.ts", "layers/*/test/unit/**/*.{test,spec}.ts"],
          exclude: [...configDefaults.exclude, "**/.agents/**"],
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          environment: "nuxt",
          // Use happy-dom's Storage instead of Node's native WebStorage.
          execArgv: process.allowedNodeEnvironmentFlags.has("--no-experimental-webstorage")
            ? ["--no-experimental-webstorage"]
            : [],
          include: ["test/nuxt/**/*.{test,spec}.ts", "layers/*/test/nuxt/**/*.{test,spec}.ts"],
          globals: true,
          exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.nuxt/**",
            "**/.agents/**",
          ],
        },
      }),
    ],
  },
});
