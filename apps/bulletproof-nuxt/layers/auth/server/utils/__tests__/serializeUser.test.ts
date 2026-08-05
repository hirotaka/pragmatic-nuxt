import type { User } from "~auth/shared/types";
import { expect, expectTypeOf, test } from "vitest";
import { serializeUser } from "../serializeUser";

expectTypeOf<User["createdAt"]>().toEqualTypeOf<string>();

test("serializes a repository user datetime as an ISO string", () => {
  const createdAt = new Date("2026-07-10T01:02:03.456Z");
  const user = {
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    bio: "Mathematician",
    role: "ADMIN" as const,
    teamId: "team-1",
    password: "server-only",
    createdAt,
    updatedAt: new Date("2026-07-11T01:02:03.456Z"),
  };

  expect(serializeUser(user)).toEqual({
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    bio: "Mathematician",
    role: "ADMIN",
    teamId: "team-1",
    createdAt: createdAt.toISOString(),
  });
});
