import { toast } from "vue-sonner";

export const useAPI = createUseFetch((options) => {
  const nuxtApp = useNuxtApp();
  const reportError = (
    error: unknown,
    option: Parameters<typeof resolveApiErrorNotification>[1],
    responseStatus?: number,
  ) => {
    const unexpectedError = resolveUnexpectedApiError(error);
    if (unexpectedError) {
      nuxtApp.runWithContext(() => showError({
        ...unexpectedError,
        statusCode: responseStatus ?? unexpectedError.statusCode,
      }));
      return;
    }

    const notification = resolveApiErrorNotification(error, import.meta.server ? undefined : option);
    if (!notification) return;

    if (import.meta.server) {
      nuxtApp.runWithContext(() => showError({
        statusCode: responseStatus ?? 500,
        statusMessage: notification.message,
      }));
      return;
    }

    toast.error(notification.title, { description: notification.message });
  };

  return {
    onRequestError: [
      ({ error, options }) => {
        reportError(error, options.errorNotification);
      },
      ...toArray(options.onRequestError),
    ],
    onResponseError: [
      ({ options, response }) => {
        reportError(response._data, options.errorNotification, response.status);
      },
      ...toArray(options.onResponseError),
    ],
  };
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}
