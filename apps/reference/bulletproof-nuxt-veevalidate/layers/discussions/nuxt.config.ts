import { fileURLToPath } from "node:url";

// Discussions layer configuration
export default defineNuxtConfig({
  alias: {
    "~discussions": fileURLToPath(new URL("./", import.meta.url)),
  },
});
