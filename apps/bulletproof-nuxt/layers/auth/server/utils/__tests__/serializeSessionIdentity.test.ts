import type { SessionIdentity } from "~auth/shared/types";
import { expect, expectTypeOf, test } from "vitest";
import { serializeSessionIdentity } from "../serializeSessionIdentity";

expectTypeOf<SessionIdentity>().toEqualTypeOf<{ id: string }>();

test("serializes a repository user as identity-only session data", () => {
  const identity = serializeSessionIdentity({
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    bio: "Mathematician",
    role: "ADMIN",
    teamId: "team-1",
    createdAt: new Date("2026-07-10T01:02:03.456Z"),
  });

  expect(identity).toEqual({ id: "user-1" });
});
