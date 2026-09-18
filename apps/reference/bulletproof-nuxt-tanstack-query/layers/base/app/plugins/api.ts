import { createAppApi } from "#layers/base/app/utils/createAppApi";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: createAppApi(),
    },
  };
});
