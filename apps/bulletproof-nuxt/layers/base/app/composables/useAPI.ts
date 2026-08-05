import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { resolveApiErrorNotification } from "#layers/base/app/utils/apiNotifications";

export const useAPI = createUseFetch((options) => {
  const { addNotification } = useNotifications();
  const reportError = (
    error: unknown,
    option: Parameters<typeof resolveApiErrorNotification>[1],
  ) => {
    const notification = resolveApiErrorNotification(error, option);

    if (notification) {
      addNotification(notification);
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
