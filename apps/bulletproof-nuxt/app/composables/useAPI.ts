import { toast } from "vue-sonner";
import { resolveApiErrorNotification, resolveUnexpectedApiError } from "~~/app/utils/apiNotifications";

export const useAPI = createUseFetch((options) => {
  const reportError = (
    error: unknown,
    option: Parameters<typeof resolveApiErrorNotification>[1],
  ) => {
    const unexpectedError = resolveUnexpectedApiError(error);
    if (unexpectedError) {
      showError(unexpectedError);
      return;
    }

    const notification = resolveApiErrorNotification(error, option);
    if (notification) {
      toast.error(notification.title, { description: notification.message });
    }
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
        reportError(response._data, options.errorNotification);
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
