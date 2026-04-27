import { fileURLToPath } from "node:url";

// Team layer configuration
export default defineNuxtConfig({
  alias: {
    "~teams": fileURLToPath(new URL("./", import.meta.url)),
  },
});
