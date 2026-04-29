import { fileURLToPath } from "node:url";

// Users layer configuration
export default defineNuxtConfig({
  alias: {
    "~users": fileURLToPath(new URL("./", import.meta.url)),
  },
});
