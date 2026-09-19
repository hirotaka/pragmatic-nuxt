import { expect, test } from "vitest";
import { resolveApiErrorNotification, resolveUnexpectedApiError } from "../apiNotifications";

test("builds a concise notification from a native api error body", () => {
  expect(resolveApiErrorNotification({
    statusCode: 404,
    statusMessage: "Discussion not found",
    message: "Discussion not found",
  })).toEqual({
    type: "error",
    title: "Error",
    message: "Discussion not found",
  });
});

test("allows api error notification title and message overrides", () => {
  expect(resolveApiErrorNotification(
    { statusCode: 422, message: "Original failure" },
    { title: "Could not create discussion", message: "Try again" },
  )).toEqual({
    type: "error",
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
    { message: "Original failure" },
    false,
  )).toBeNull();
});

test("suppresses AbortError cancellation", () => {
  expect(resolveApiErrorNotification(
    new DOMException("This operation was aborted", "AbortError"),
  )).toBeNull();
});

test("suppresses a wrapped AbortError cancellation", () => {
  expect(resolveApiErrorNotification({
    name: "FetchError",
    cause: new DOMException("This operation was aborted", "AbortError"),
  })).toBeNull();
});
