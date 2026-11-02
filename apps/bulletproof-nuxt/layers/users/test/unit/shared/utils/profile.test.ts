import { expect, test } from "vitest";
import { updateProfileInputSchema } from "#layers/users/shared/utils/profile";

const profile = { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace" };

test("accepts a profile without a bio and strips unrelated fields", () => {
  expect(updateProfileInputSchema.parse({ ...profile, role: "ADMIN" })).toEqual(profile);
});

test.each(["", "Mathematician"])("accepts the optional bio %j", (bio) => {
  expect(updateProfileInputSchema.parse({ ...profile, bio })).toEqual({ ...profile, bio });
});

test.each([
  { changes: { email: "" }, field: "email", message: "Email is required" },
  { changes: { email: "invalid-email" }, field: "email", message: "Invalid email address" },
  { changes: { firstName: "" }, field: "firstName", message: "First name is required" },
  { changes: { lastName: "" }, field: "lastName", message: "Last name is required" },
])("rejects an invalid $field: $changes", ({ changes, field, message }) => {
  expect(updateProfileInputSchema.safeParse({ ...profile, ...changes })).toMatchObject({
    success: false,
    error: { issues: expect.arrayContaining([expect.objectContaining({ path: [field], message })]) },
  });
});
