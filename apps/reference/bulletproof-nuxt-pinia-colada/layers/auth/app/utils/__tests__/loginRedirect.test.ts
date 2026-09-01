import { expect, test } from "vitest";
import { resolveLoginRedirect } from "../loginRedirect";

test.each([
  ["/app", "/app"],
  ["/app/discussions/123?page=2#comments", "/app/discussions/123?page=2#comments"],
])("preserves a safe protected destination: %s", (value, expected) => {
  expect(resolveLoginRedirect(value)).toBe(expected);
});

test.each([
  undefined,
  null,
  "",
  ["/app"],
  "https://example.com/app",
  "//example.com/app",
  "javascript:alert(1)",
  "/auth/login",
  "/auth/register",
  "/public",
  "/app/../auth/login",
  "/app\\/../auth/login",
])("falls back for an unsafe destination: %o", (value) => {
  expect(resolveLoginRedirect(value)).toBe("/app");
});
