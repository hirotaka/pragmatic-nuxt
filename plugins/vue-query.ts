import { defineNuxtPlugin } from "nuxt/app";
import { VueQueryPlugin } from "@tanstack/vue-query";
import type { VueQueryPluginOptions } from "@tanstack/vue-query";

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        useErrorBoundary: true,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, vueQueryPluginOptions);
});
