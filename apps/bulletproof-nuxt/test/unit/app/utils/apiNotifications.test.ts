import { expect, test } from "vitest";
import { resolveApiErrorNotification, resolveUnexpectedApiError } from "~/utils/apiNotifications";

test("builds a concise notification from a native api error body", () => {
  expect(resolveApiErrorNotification({
    statusCode: 404,
    statusMessage: "Discussion not found",
    message: "Generic request failure",
  })).toEqual({
    title: "Error",
    message: "Discussion not found",
  });
});

test("allows api error notification title and message overrides", () => {
  expect(resolveApiErrorNotification(
    { statusCode: 422, message: "Original failure" },
    { title: "Could not create discussion", message: "Try again" },
  )).toEqual({
    title: "Could not create discussion",
    message: "Try again",
  });
});

test("routes server errors to the unexpected error presentation", () => {
  const error = {
    statusCode: 500,
    statusMessage: "Database unavailable",
    message: "Database unavailable",
  };

  expect(resolveUnexpectedApiError(error)).toEqual({
    statusCode: 500,
    statusMessage: "Database unavailable",
    fatal: true,
  });
  expect(resolveApiErrorNotification(error)).toBeNull();
});

test("routes transport errors to the unexpected error presentation", () => {
  expect(resolveUnexpectedApiError(new Error("Network unavailable"))).toEqual({
    statusCode: 500,
    statusMessage: "Network unavailable",
    fatal: true,
  });
});

test("allows api error notification suppression", () => {
  expect(resolveApiErrorNotification(
    { statusCode: 422, message: "Original failure" },
    false,
  )).toBeNull();
});

test("suppresses AbortError cancellation", () => {
  const error = new DOMException("This operation was aborted", "AbortError");

  expect(resolveApiErrorNotification(error)).toBeNull();
  expect(resolveUnexpectedApiError(error)).toBeNull();
});

test("suppresses a wrapped AbortError cancellation", () => {
  const error = {
    name: "FetchError",
    cause: new DOMException("This operation was aborted", "AbortError"),
  };

  expect(resolveApiErrorNotification(error)).toBeNull();
  expect(resolveUnexpectedApiError(error)).toBeNull();
});

test("uses response details ahead of status and transport summaries", () => {
  expect(resolveApiErrorNotification({
    statusCode: 422,
    data: { message: "The title is required" },
    statusMessage: "Unprocessable Entity",
    message: "Request failed",
  })).toEqual({ title: "Error", message: "The title is required" });
});

test.each([
  { option: { title: "Cannot save" }, expected: { title: "Cannot save", message: "Invalid title" } },
  { option: { message: "Try another title" }, expected: { title: "Error", message: "Try another title" } },
])("preserves the default for an unspecified override: $option", ({ option, expected }) => {
  expect(resolveApiErrorNotification({ statusCode: 422, message: "Invalid title" }, option)).toEqual(expected);
});

test("uses the operation fallback when a client error has no message", () => {
  expect(resolveApiErrorNotification({ statusCode: 400 }))
    .toEqual({ title: "Error", message: "Operation failed" });
});

test.each([undefined, null, {}, "failure"])("uses the unexpected fallback for %j", (error) => {
  expect(resolveUnexpectedApiError(error)).toEqual({
    statusCode: 500,
    statusMessage: "Unexpected error",
    fatal: true,
  });
  expect(resolveApiErrorNotification(error)).toBeNull();
});

test.each([
  { error: { status: 422, message: "Invalid title" } },
  { error: { statusCode: 499, message: "Invalid title" } },
  { error: { statusCode: 422, status: 503, message: "Invalid title" } },
])("keeps a client error out of the fatal presentation: $error", ({ error }) => {
  expect(resolveUnexpectedApiError(error)).toBeNull();
  expect(resolveApiErrorNotification(error)).toEqual({ title: "Error", message: "Invalid title" });
});

test.each([
  { error: { status: 503, message: "Unavailable" }, statusCode: 503 },
  { error: { statusCode: 503, status: 422, message: "Unavailable" }, statusCode: 503 },
])("preserves a server status and prioritizes statusCode: $error", ({ error, statusCode }) => {
  expect(resolveUnexpectedApiError(error)).toEqual({ statusCode, statusMessage: "Unavailable", fatal: true });
  expect(resolveApiErrorNotification(error)).toBeNull();
});

test("terminates a cyclic non-abort cause chain without suppressing a client error", () => {
  const error = { statusCode: 422, message: "Invalid title", cause: undefined as unknown };
  error.cause = error;

  expect(resolveUnexpectedApiError(error)).toBeNull();
  expect(resolveApiErrorNotification(error)).toEqual({ title: "Error", message: "Invalid title" });
});
