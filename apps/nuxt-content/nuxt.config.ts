import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/content", "@nuxt/icon", "@nuxtjs/color-mode", "shadcn-nuxt"],
  components: [
    {
      path: "~/components",
      pathPrefix: false,
      ignore: ["ui/**"],
    },
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  colorMode: {
    classSuffix: "",
  },
  content: {
    experimental: { sqliteConnector: "native" },
  },
  routeRules: {
    "/docs": { redirect: "/docs/getting-started", prerender: false },
    "/": { prerender: true },
    "/pricing": { prerender: true },
    "/blog": { prerender: true },
    "/login": { prerender: true },
    "/signup": { prerender: true },
    "/docs/**": { prerender: true },
    "/changelog": { prerender: true },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-07-15",
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        "/docs/getting-started",
        "/docs/getting-started/installation",
        "/docs/getting-started/usage",
        "/docs/essentials",
        "/docs/essentials/markdown-syntax",
        "/docs/essentials/code-blocks",
        "/docs/essentials/prose-components",
        "/docs/essentials/images-embeds",
        "/blog/asian-cuisine",
        "/blog/pyrenees",
        "/blog/james-webb",
        "/blog/meditation",
        "/blog/animals",
        "/blog/cryptocurrencies",
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    tsConfig: {
      include: ["../test/unit/**/*.ts", "../test/e2e/**/*.ts"],
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
    prefix: "Ui",
    componentDir: "./app/components/ui",
  },
});
