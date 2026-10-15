import { provideSSRWidth } from "@vueuse/core";

export default defineNuxtPlugin((nuxtApp) => {
  // Match the server's desktop render until viewport-dependent components mount.
  provideSSRWidth(1024, nuxtApp.vueApp);
});
