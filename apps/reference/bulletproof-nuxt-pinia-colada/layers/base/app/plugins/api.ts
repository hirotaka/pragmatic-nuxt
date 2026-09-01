import { createAppApi } from "../utils/createAppApi";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: createAppApi(),
    },
  };
});
