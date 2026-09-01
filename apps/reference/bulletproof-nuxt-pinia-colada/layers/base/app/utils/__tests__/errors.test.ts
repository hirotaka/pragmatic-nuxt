import { expect, test } from "vitest";
import { extractErrorStatusCode } from "../errors";

test.each([
  [{ statusCode: 401 }, 401],
  [{ status: 403 }, 403],
  [{ response: { status: 500 } }, 500],
])("extracts the native status shape", (error, status) => {
  expect(extractErrorStatusCode(error)).toBe(status);
});

test.each([
  null,
  undefined,
  {},
  { statusCode: "401" },
  { status: Number.NaN },
  { response: { status: "401" } },
])("returns null for an unusable status shape: %o", (error) => {
  expect(extractErrorStatusCode(error)).toBeNull();
});
