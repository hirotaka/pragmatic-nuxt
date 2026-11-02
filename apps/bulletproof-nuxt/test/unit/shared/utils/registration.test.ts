import { expect, test } from "vitest";
import { registerInputSchema } from "~~/shared/utils/registration";

const account = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  password: "12345",
};

test("accepts an existing team and supplies a null team name", () => {
  expect(registerInputSchema.parse({ ...account, teamId: "team-1", role: "ADMIN" }))
    .toEqual({ ...account, teamId: "team-1", teamName: null });
});

test("accepts a new team and supplies a null team ID", () => {
  expect(registerInputSchema.parse({ ...account, teamName: "Analytical Engine" }))
    .toEqual({ ...account, teamName: "Analytical Engine", teamId: null });
});

test.each([
  { changes: { email: "" }, field: "email" },
  { changes: { email: "invalid-email" }, field: "email" },
  { changes: { firstName: "" }, field: "firstName" },
  { changes: { lastName: "" }, field: "lastName" },
  { changes: { password: "1234" }, field: "password" },
])("rejects an invalid $field", ({ changes, field }) => {
  expect(registerInputSchema.safeParse({ ...account, teamId: "team-1", ...changes })).toMatchObject({
    success: false,
    error: { issues: expect.arrayContaining([expect.objectContaining({ path: [field] })]) },
  });
});

test.each([
  {},
  { teamId: "", teamName: null },
  { teamId: null, teamName: "" },
  { teamId: "team-1", teamName: "Another team" },
  { teamId: null, teamName: null },
])("requires exactly one nonempty team choice: %j", (team) => {
  expect(registerInputSchema.safeParse({ ...account, ...team }).success).toBe(false);
});
