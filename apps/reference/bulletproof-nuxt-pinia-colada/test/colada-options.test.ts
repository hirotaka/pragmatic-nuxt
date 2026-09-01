import { expect, test } from "vitest";
import { shouldHandleColadaQueryError, shouldRetryQuery } from "../colada.options";

test.each([
  [0, { status: 500 }, true],
  [1, { status: 500 }, true],
  [2, { status: 500 }, false],
  [0, { statusCode: 401 }, false],
  [1, { response: { status: 401 } }, false],
])("bounds non-401 Query retries and excludes 401: %o", (failureCount, error, expected) => {
  expect(shouldRetryQuery(failureCount, error)).toBe(expected);
});

test("silences errors from inactive prefetch entries", () => {
  expect(shouldHandleColadaQueryError({
    active: false,
    ext: { isPrefetch: true },
  })).toBe(false);
});

test("keeps active prefetch entries on the normal error policy", () => {
  expect(shouldHandleColadaQueryError({
    active: true,
    ext: { isPrefetch: true },
  })).toBe(true);
});

test("keeps ordinary inactive Query errors on the normal error policy", () => {
  expect(shouldHandleColadaQueryError({ active: false, ext: {} })).toBe(true);
});
