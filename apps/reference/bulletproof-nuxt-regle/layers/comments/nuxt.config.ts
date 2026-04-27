import { fileURLToPath } from "node:url";

// Comments layer configuration
export default defineNuxtConfig({
  alias: {
    "~comments": fileURLToPath(new URL("./", import.meta.url)),
  },
});
