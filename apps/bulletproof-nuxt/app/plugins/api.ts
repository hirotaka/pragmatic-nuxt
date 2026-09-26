import { toast } from "vue-sonner";
import { resolveApiErrorNotification, resolveUnexpectedApiError } from "~~/app/utils/apiNotifications";

type ApiRequest = Parameters<typeof globalThis.$fetch>[0];
type ApiOptions = NonNullable<Parameters<typeof globalThis.$fetch>[1]>;
export function createApiNotificationHooks(client = import.meta.client) {
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
        toast.error(notification.title, { description: notification.message });
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
        toast.error(notification.title, { description: notification.message });
      }
    },
  } satisfies Pick<ApiOptions, "onRequestError" | "onResponseError">;
}

export default defineNuxtPlugin(() => {
  const notificationHooks = createApiNotificationHooks();
  const configuredApi = globalThis.$fetch.create(notificationHooks);
  // Keep route-aware typing at the public boundary, not at each delegated call.
  const transport = configuredApi as unknown as {
    (request: ApiRequest, options?: ApiOptions): Promise<unknown>;
    raw: (request: ApiRequest, options?: ApiOptions) => Promise<unknown>;
  };
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
    (request: ApiRequest, options?: ApiOptions) => {
      return transport(request, withNotificationHooks(options));
    },
    configuredApi,
    {
      raw: (
        request: ApiRequest,
        options?: ApiOptions,
      ) => transport.raw(request, withNotificationHooks(options)),
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
