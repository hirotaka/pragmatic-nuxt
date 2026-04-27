import { expect, test, vi } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody } from "h3";
import LoginForm from "../LoginForm.vue";
import { createUser } from "~~/test/data-generators";
import { renderComponent, screen, userEvent, waitFor } from "~~/test/test-utils";

test("should login new user and call onSuccess cb which should navigate the user to the app", async () => {
  const newUser = createUser({ teamId: undefined });
  const onSuccess = vi.fn();

  // Mock successful login response
  const mockUser = {
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    teamId: newUser.teamId,
    role: "USER",
    createdAt: Date.now(),
  };

  let capturedBody: Record<string, unknown> | undefined;

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return { user: mockUser };
    },
  });

  // Mock session refresh endpoint
  registerEndpoint("/api/_auth/session", () => ({}));

  await renderComponent(LoginForm, {
    props: { onSuccess },
  });

  // Fill in the form
  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);

  // Submit the form
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  // Wait for the onSuccess callback to be called
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

  // Verify the request body
  expect(capturedBody).toMatchObject({
    email: newUser.email,
    password: newUser.password,
  });
});

test("should display validation errors for invalid input", async () => {
  await renderComponent(LoginForm, {
    props: { onSuccess: vi.fn() },
  });

  // Type invalid email and short password
  await userEvent.type(screen.getByLabelText(/email address/i), "invalid");
  await userEvent.type(screen.getByLabelText(/password/i), "ab");

  // Submit the form
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  // Validation errors should appear
  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeDefined();
  });
});

test("should display validation errors for empty fields", async () => {
  await renderComponent(LoginForm, {
    props: { onSuccess: vi.fn() },
  });

  // Submit without filling any fields
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  // Required errors should appear
  await waitFor(() => {
    const requiredErrors = screen.getAllByText(/required/i);
    expect(requiredErrors.length).toBeGreaterThanOrEqual(2);
  });
});
