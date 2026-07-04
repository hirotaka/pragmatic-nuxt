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

test("should block login when validation fails", async () => {
  const onSuccess = vi.fn();
  const loginHandler = vi.fn();

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: loginHandler,
  });

  await renderComponent(LoginForm, {
    props: { onSuccess },
  });

  await userEvent.type(screen.getByLabelText(/email address/i), "not-an-email");
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  await screen.findByText(/invalid email/i);
  expect(loginHandler).toHaveBeenCalledTimes(0);
  expect(onSuccess).toHaveBeenCalledTimes(0);
});

test("renders login block copy and register cross-link", async () => {
  await renderComponent(LoginForm);

  expect(screen.getByRole("heading", { name: /welcome back/i })).toBeTruthy();
  expect(screen.getByText(/continue managing your team's discussions/i)).toBeTruthy();
  expect(screen.getByText(/register/i)).toBeTruthy();
});

test("should disable submit while login is pending", async () => {
  const newUser = createUser({ teamId: undefined });
  const onSuccess = vi.fn();
  let resolveLogin: (value: { user: unknown }) => void = () => {};
  const loginResponse = new Promise<{ user: unknown }>((resolve) => {
    resolveLogin = resolve;
  });
  const loginHandler = vi.fn(async () => loginResponse);

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: loginHandler,
  });
  registerEndpoint("/api/_auth/session", () => ({}));

  await renderComponent(LoginForm, {
    props: { onSuccess },
  });

  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);

  const submitButton = screen.getByRole("button", { name: /log in/i });
  await userEvent.click(submitButton);

  await waitFor(() => expect((submitButton as HTMLButtonElement).disabled).toBe(true));
  await userEvent.click(submitButton);
  expect(loginHandler).toHaveBeenCalledTimes(1);

  resolveLogin({ user: { id: newUser.id } });
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
