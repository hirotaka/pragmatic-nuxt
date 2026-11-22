import type { ModuleOptions } from "nuxt-skew-protection";
import type { NuxtConfig } from "nuxt/schema";

export const e2eNuxtConfig: NuxtConfig & { skewProtection: Partial<ModuleOptions> } = {
  skewProtection: {
    storage: {
      driver: "fs-lite",
      base: "node_modules/.cache/nuxt-seo/skew-protection-e2e",
    },
  },
};
