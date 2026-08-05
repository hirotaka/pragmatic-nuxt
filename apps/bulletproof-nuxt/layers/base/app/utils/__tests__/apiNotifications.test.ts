import { expect, test } from "vitest";
import { resolveApiErrorNotification } from "../apiNotifications";

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
    { message: "Original failure" },
    { title: "Could not create discussion", message: "Try again" },
  )).toEqual({
    type: "error",
    title: "Could not create discussion",
    message: "Try again",
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
