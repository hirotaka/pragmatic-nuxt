import { expect, test } from "vitest";
import { loginInputSchema } from "#layers/auth/shared/utils/login";

const credentials = { email: "ada@example.com", password: "12345" };

test("accepts valid credentials at the password boundary and strips unrelated fields", () => {
  expect(loginInputSchema.parse({ ...credentials, role: "ADMIN" })).toEqual(credentials);
});

test.each([
  { changes: { email: "" }, field: "email", message: "Required" },
  { changes: { email: "invalid-email" }, field: "email", message: "Invalid email" },
  { changes: { password: "1234" }, field: "password", message: "Required" },
  { changes: { password: "" }, field: "password", message: "Required" },
])("rejects invalid credentials for $field: $changes", ({ changes, field, message }) => {
  expect(loginInputSchema.safeParse({ ...credentials, ...changes })).toMatchObject({
    success: false,
    error: { issues: expect.arrayContaining([expect.objectContaining({ path: [field], message })]) },
  });
});
