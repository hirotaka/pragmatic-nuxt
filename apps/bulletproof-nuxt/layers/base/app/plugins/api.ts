import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { resolveApiErrorNotification } from "#layers/base/app/utils/apiNotifications";

export default defineNuxtPlugin(() => {
  const { addNotification } = useNotifications();
  const api = $fetch.create({
    onRequestError({ error, options }) {
      if (!import.meta.client) {
        return;
      }

      const notification = resolveApiErrorNotification(
        error,
        options.errorNotification,
      );

      if (notification) {
        addNotification(notification);
      }
    },
    onResponseError({ options, response }) {
      if (!import.meta.client) {
        return;
      }

      const notification = resolveApiErrorNotification(
        response._data,
        options.errorNotification,
      );

      if (notification) {
        addNotification(notification);
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});

declare module "#app" {
  interface NuxtApp {
    $api: typeof globalThis.$fetch;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api: typeof globalThis.$fetch;
  }
}
