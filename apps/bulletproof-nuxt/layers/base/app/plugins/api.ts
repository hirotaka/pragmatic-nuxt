import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { resolveApiErrorNotification, resolveUnexpectedApiError } from "#layers/base/app/utils/apiNotifications";

type ApiOptions = NonNullable<Parameters<typeof globalThis.$fetch>[1]>;
type AddNotification = ReturnType<typeof useNotifications>["addNotification"];

export function createApiNotificationHooks(
  addNotification: AddNotification,
  client = import.meta.client,
) {
  return {
    onRequestError({ error, options }) {
      if (!client) {
        return;
      }

      const unexpectedError = resolveUnexpectedApiError(error);
      if (unexpectedError) {
        showError(unexpectedError);
        return;
      }

      const notification = resolveApiErrorNotification(error, options.errorNotification);
      if (notification) {
        addNotification(notification);
      }
    },
    onResponseError({ options, response }) {
      if (!client) {
        return;
      }

      const unexpectedError = resolveUnexpectedApiError(response._data);
      if (unexpectedError) {
        showError(unexpectedError);
        return;
      }

      const notification = resolveApiErrorNotification(response._data, options.errorNotification);
      if (notification) {
        addNotification(notification);
      }
    },
  } satisfies Pick<ApiOptions, "onRequestError" | "onResponseError">;
}

export default defineNuxtPlugin(() => {
  const { addNotification } = useNotifications();
  const notificationHooks = createApiNotificationHooks(addNotification);
  const configuredApi = globalThis.$fetch.create(notificationHooks);
  const withNotificationHooks = (options?: ApiOptions): ApiOptions => ({
    ...options,
    onRequestError: [
      notificationHooks.onRequestError,
      ...toArray(options?.onRequestError),
    ],
    onResponseError: [
      notificationHooks.onResponseError,
      ...toArray(options?.onResponseError),
    ],
  });
  const api = Object.assign(
    (request: Parameters<typeof configuredApi>[0], options?: ApiOptions) => {
      return configuredApi(request, withNotificationHooks(options));
    },
    configuredApi,
    {
      raw: (
        request: Parameters<typeof configuredApi.raw>[0],
        options?: ApiOptions,
      ) => configuredApi.raw(request, withNotificationHooks(options)),
    },
  ) as typeof configuredApi;

  return {
    provide: {
      api,
    },
  };
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

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
