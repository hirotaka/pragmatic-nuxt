import tailwindcss from "@tailwindcss/vite";

const cloudflare = process.env.NITRO_PRESET === "cloudflare_module";
const databaseId = process.env.NUXT_CONTENT_D1_DATABASE_ID ?? "";
const previewDatabaseId = process.env.NUXT_CONTENT_PREVIEW_D1_DATABASE_ID;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxtjs/seo", "@nuxt/content", "@nuxt/icon", "@nuxtjs/color-mode", "shadcn-nuxt"],
  components: [
    {
      path: "~/components",
      pathPrefix: false,
      ignore: ["ui/**"],
    },
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  site: {
    name: "Nuxt Content Showcase",
    description: "A Nuxt Content showcase with documentation, sample blog articles, and editable SaaS pages built with Nuxt and shadcn-vue.",
    trailingSlash: false,
  },
  colorMode: {
    classSuffix: "",
  },
  content: {
    experimental: { sqliteConnector: "native" },
  },
  routeRules: {
    "/**": {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
    // Preserve Nuxt's stricter policy when HTML errors are rendered internally.
    "/__nuxt_error": {
      headers: { "Referrer-Policy": "no-referrer" },
    },
    "/docs": {
      redirect: { to: "/docs/getting-started", statusCode: 308 },
      prerender: false,
    },
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
  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: "remove",
      },
    },
  },
  compatibilityDate: "2025-07-15",
  nitro: {
    cloudflare: cloudflare
      ? {
          deployConfig: true,
          wrangler: {
            name: "nuxt-content",
            d1_databases: [{ binding: "DB", database_name: "nuxt-content", database_id: databaseId }],
            assets: { html_handling: "drop-trailing-slash" },
            ...(previewDatabaseId && {
              previews: {
                d1_databases: [{ binding: "DB", database_name: "nuxt-content-preview", database_id: previewDatabaseId }],
              },
            }),
          },
        }
      : undefined,
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
  aiReady: {
    llmsTxt: {
      sections: [{
        title: "Blog articles",
        links: [
          { title: "Exploring the Culinary Wonders of Asia", href: "/blog/asian-cuisine.md" },
          { title: "Pyrenees: Mountains, culture, and outdoor adventures", href: "/blog/pyrenees.md" },
          { title: "James Webb Space Telescope: From design to launch", href: "/blog/james-webb.md" },
          { title: "The Benefits of Meditation", href: "/blog/meditation.md" },
          { title: "The 10 Most Dangerous Creatures on Earth", href: "/blog/animals.md" },
          { title: "The Rise of Cryptocurrencies", href: "/blog/cryptocurrencies.md" },
        ],
      }],
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
  seo: {
    canonicalQueryWhitelist: [],
  },
  shadcn: {
    prefix: "Ui",
    componentDir: "./app/components/ui",
  },
  skewProtection: {
    ...(cloudflare && { bundleAssets: false }),
    storage: {
      driver: "fs-lite",
      base: cloudflare ? "node_modules/.cache/nuxt-seo/skew-protection-worker" : "node_modules/.cache/nuxt-seo/skew-protection-production",
    },
  },
});
