import type { Notification } from "#layers/base/app/composables/useNotifications";
import { extractErrorMessage } from "#layers/base/app/utils/errors";

export type ApiErrorNotificationOption = false | {
  title?: string;
  message?: string;
};

declare module "ofetch" {
  interface FetchOptions {
    errorNotification?: ApiErrorNotificationOption;
  }
}

export function resolveApiErrorNotification(
  error: unknown,
  option?: ApiErrorNotificationOption,
): Omit<Notification, "id"> | null {
  if (option === false || isAbortError(error)) {
    return null;
  }

  return {
    type: "error",
    title: option?.title ?? "Error",
    message: option?.message ?? extractErrorMessage(error, "Operation failed"),
  };
}

function isAbortError(error: unknown): boolean {
  const visited = new Set<object>();
  let current = error;

  while (typeof current === "object" && current !== null && !visited.has(current)) {
    if ("name" in current && current.name === "AbortError") {
      return true;
    }

    visited.add(current);
    current = "cause" in current ? current.cause : undefined;
  }

  return false;
}
