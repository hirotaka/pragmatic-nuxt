import type { Notification } from "#layers/base/app/composables/useNotifications";
import { extractErrorMessage } from "#layers/base/app/utils/errors";

export function resolveErrorNotification(
  error: unknown,
): Omit<Notification, "id"> | null {
  if (isAbortError(error)) {
    return null;
  }

  return {
    type: "error",
    title: "Error",
    message: extractErrorMessage(error, "Operation failed"),
  };
}

export function isAbortError(error: unknown): boolean {
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
