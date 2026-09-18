import { defineVitestConfig } from "@nuxt/test-utils/config";

const lifecycle = process.env.TEST_EVIDENCE_LIFECYCLE;

if (lifecycle !== "exploration" && lifecycle !== "characterization") {
  throw new Error("TEST_EVIDENCE_LIFECYCLE must be exploration or characterization");
}

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [`**/__evidence__/${lifecycle}/**/*.test.ts`],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/e2e/**",
    ],
  },
});
