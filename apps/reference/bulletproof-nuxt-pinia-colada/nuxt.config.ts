import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const coladaOptionsPath = fileURLToPath(new URL("./colada.options.ts", import.meta.url));

const isCloudflareBuild = process.env.NITRO_PRESET === "cloudflare_module";
const isPreviewBuild = process.env.CLOUDFLARE_ENV === "preview";
const isPostgresBuild = process.env.NUXT_HUB_DB_DIALECT === "postgresql";
const isCloudflarePostgresBuild = isCloudflareBuild && isPostgresBuild;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Layers configuration
  extends: [
    "./layers/base",
    "./layers/auth",
    "./layers/discussions",
    "./layers/comments",
    "./layers/users",
    "./layers/teams",
  ],
  modules: [
    "@nuxthub/core",
    "@pinia/colada-nuxt",
    "@pinia/nuxt",
    "nuxt-auth-utils",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "@regle/nuxt",
    "shadcn-nuxt",
  ],
  components: [],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      ],
    },
  },
  css: ["~/assets/css/main.css"],
  // Nuxt 4 compatibility
  future: {
    compatibilityVersion: 4,
  },
  // Nuxt 4 experimental features
  experimental: {
    sharedPrerenderData: true,
  },
  compatibilityDate: "2025-07-15",
  nitro: {
    experimental: {
      tasks: true,
    },
  },
  hub: {
    db: isCloudflarePostgresBuild
      ? {
          dialect: "postgresql",
          driver: "neon-http",
          applyMigrationsDuringBuild: process.env.NUXT_HUB_DB_APPLY_MIGRATIONS !== "false",
        }
      : isPostgresBuild
        ? "postgresql"
        : isCloudflareBuild
          ? {
              dialect: "sqlite",
              driver: "d1",
              connection: {
                databaseId: isPreviewBuild
                  ? "e4519eb7-fe8b-4fa4-8f35-a8f33dc5eda0"
                  : "d51277bf-fa2b-4f23-a140-edafa3260319",
              },
              applyMigrationsDuringBuild: false,
            }
          : "sqlite",
    dir: process.env.NUXT_HUB_DIR || ".data",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  hooks: {
    "prepare:types": ({ tsConfig }) => {
      tsConfig.include ||= [];
      tsConfig.include.push(coladaOptionsPath);
    },
  },
  eslint: {
    config: {
      stylistic: {
        quotes: "double",
        semi: true,
      },
    },
  },
  shadcn: {
    prefix: "",
    componentDir: "@/components/ui",
  },
});
