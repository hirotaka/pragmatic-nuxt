import { fileURLToPath } from "node:url";

// Auth layer configuration
export default defineNuxtConfig({
  alias: {
    "~auth": fileURLToPath(new URL("./", import.meta.url)),
  },
});
