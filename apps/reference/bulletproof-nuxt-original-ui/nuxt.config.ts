import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

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
    "@pinia/nuxt",
    "nuxt-auth-utils",
    "@nuxt/eslint",
    "@nuxt/test-utils/module",
    "@regle/nuxt",
  ],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      ],
    },
  },
  css: ["./app/assets/css/main.css"],
  alias: {
    "@": fileURLToPath(new URL("./", import.meta.url)),
  },
  // Nuxt 4 compatibility
  future: {
    compatibilityVersion: 4,
  },
  // Nuxt 4 experimental features
  experimental: {
    sharedPrerenderData: true,
  },
  compatibilityDate: "2025-07-15",
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  eslint: {
    config: {
      stylistic: {
        quotes: "double",
        semi: true,
      },
    },
  },
});
