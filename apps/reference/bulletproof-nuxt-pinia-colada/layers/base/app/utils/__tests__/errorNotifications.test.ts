import { expect, test } from "vitest";
import { resolveErrorNotification } from "../errorNotifications";

test("builds a concise notification from a native api error body", () => {
  expect(resolveErrorNotification({
    statusCode: 404,
    statusMessage: "Discussion not found",
    message: "Discussion not found",
  })).toEqual({
    type: "error",
    title: "Error",
    message: "Discussion not found",
  });
});

test("uses a safe fallback for an unstructured failure", () => {
  expect(resolveErrorNotification(null)).toEqual({
    type: "error",
    title: "Error",
    message: "Operation failed",
  });
});

test("suppresses AbortError cancellation", () => {
  expect(resolveErrorNotification(
    new DOMException("This operation was aborted", "AbortError"),
  )).toBeNull();
});

test("suppresses a wrapped AbortError cancellation", () => {
  expect(resolveErrorNotification({
    name: "FetchError",
    cause: new DOMException("This operation was aborted", "AbortError"),
  })).toBeNull();
});
