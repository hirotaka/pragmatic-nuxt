import { expect, expectTypeOf, test } from "vitest";
import { serializeSessionIdentity, serializeSessionUser } from "../serializeUser";

expectTypeOf(serializeSessionIdentity).returns.toEqualTypeOf<{ id: string }>();

test("serializes an ID-only session identity", () => {
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

  expect(serializeSessionIdentity(user)).toEqual({ id: "user-1" });
});

test("serializes a public current User response", () => {
  const createdAt = new Date("2026-07-10T01:02:03.456Z");
  const user = {
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    bio: "Mathematician",
    role: "ADMIN" as const,
    teamId: "team-1",
    password: "secret",
    createdAt,
    updatedAt: new Date("2026-07-11T01:02:03.456Z"),
  };

  expect(serializeSessionUser(user)).toEqual({
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
