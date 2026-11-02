import type { H3Event } from "h3";
import { expect, test, vi } from "vitest";
import { getAuthApplication } from "#layers/auth/server/utils/authApplication";

test("returns the authentication port from the current event without invoking it", () => {
  const findCredentials = vi.fn();
  const port = { findCredentials };

  expect(getAuthApplication({ context: { authApplication: port } } as unknown as H3Event)).toBe(port);
  expect(findCredentials).not.toHaveBeenCalled();
});

test.each([undefined, null, false, "unavailable", 42])(
  "rejects a missing or non-object authentication port: %j",
  (authApplication) => {
    expect(() => getAuthApplication({ context: { authApplication } } as unknown as H3Event))
      .toThrow(expect.objectContaining({
        statusCode: 500,
        statusMessage: "Authentication is unavailable",
      }));
  },
);
