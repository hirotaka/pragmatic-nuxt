/**
 * Extracts error message from unknown error object
 * Handles various error formats including Nuxt $fetch errors and standard Error objects
 * @param err - Unknown error object
 * @param defaultMessage - Default message to return if extraction fails
 * @returns Extracted error message or default message
 */
export function extractErrorMessage(
  err: unknown,
  defaultMessage: string,
): string {
  if (!err || typeof err !== "object") {
    return defaultMessage;
  }

  // Handle Nuxt $fetch error format: err.data.message
  if (
    "data" in err
    && err.data
    && typeof err.data === "object"
    && "message" in err.data
    && typeof err.data.message === "string"
  ) {
    return err.data.message;
  }

  // Handle Nuxt $fetch error format: err.statusMessage (from createError)
  if ("statusMessage" in err && typeof err.statusMessage === "string") {
    return err.statusMessage;
  }

  // Handle standard Error object: err.message
  if ("message" in err && typeof err.message === "string") {
    return err.message;
  }

  return defaultMessage;
}

export function extractErrorStatusCode(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  if ("statusCode" in error && isFiniteStatus(error.statusCode)) {
    return error.statusCode;
  }

  if ("status" in error && isFiniteStatus(error.status)) {
    return error.status;
  }

  if (
    "response" in error
    && error.response
    && typeof error.response === "object"
    && "status" in error.response
    && isFiniteStatus(error.response.status)
  ) {
    return error.response.status;
  }

  return null;
}

function isFiniteStatus(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
