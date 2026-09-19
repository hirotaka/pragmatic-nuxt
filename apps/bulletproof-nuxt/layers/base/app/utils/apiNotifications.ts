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
  if (option === false || isAbortError(error) || resolveUnexpectedApiError(error)) {
    return null;
  }

  return {
    type: "error",
    title: option?.title ?? "Error",
    message: option?.message ?? extractErrorMessage(error, "Operation failed"),
  };
}

export function resolveUnexpectedApiError(error: unknown) {
  if (isAbortError(error)) return null;

  const statusCode = getStatusCode(error);
  if (statusCode !== undefined && statusCode < 500) return null;

  return {
    statusCode: statusCode ?? 500,
    statusMessage: extractErrorMessage(error, "Unexpected error"),
    fatal: true,
  };
}

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  return undefined;
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
