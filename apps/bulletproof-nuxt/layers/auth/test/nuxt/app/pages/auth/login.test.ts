import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { registerEndpoint, renderSuspended } from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import LoginPage from "#layers/auth/app/pages/auth/login.vue";
import type { User } from "#layers/users/shared/types/user";
import { cleanup, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";

import { clearNuxtData, useRouter, useUserSession } from "#imports";

const { successNotification, errorNotification } = vi.hoisted(() => ({
  successNotification: vi.fn(),
  errorNotification: vi.fn(),
}));
vi.mock("vue-sonner", () => ({ toast: { success: successNotification, error: errorNotification } }));

const input = { email: "ada@example.com", password: "Password123!" };
const signedInUser: User = {
  id: "user-1",
  email: input.email,
  firstName: "Ada",
  lastName: "Lovelace",
  role: "USER",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  clearNuxtData();
  useUserSession().session.value = null;
  successNotification.mockReset();
  errorNotification.mockReset();
});

afterEach(() => {
  cleanup();
  useUserSession().session.value = null;
  clearNuxtData();
  vi.restoreAllMocks();
});

test("logs in and navigates only after the authenticated session refresh", async () => {
  let capturedBody: Record<string, unknown> | undefined;

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 204 });
    },
  });

  // Hold the session refresh so the completion callback cannot run early.
  const session = Promise.withResolvers<Record<string, unknown>>();
  const sessionHandler = vi.fn(() => session.promise);
  registerEndpoint("/api/_auth/session", sessionHandler);

  await renderSuspended(LoginPage);
  const replace = vi.spyOn(useRouter(), "replace");

  await userEvent.type(screen.getByLabelText(/email address/i), input.email);
  await userEvent.type(screen.getByLabelText(/password/i), input.password);

  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() => expect(capturedBody).toBeDefined());
  await waitFor(() => expect(sessionHandler).toHaveBeenCalledTimes(1));
  expect(replace).not.toHaveBeenCalledWith("/app");
  expect(successNotification).not.toHaveBeenCalled();
  expect((screen.getByRole("button", { name: /log in/i }) as HTMLButtonElement).disabled).toBe(true);

  session.resolve({ id: "session-1", user: signedInUser });
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/app"));

  expect(capturedBody).toMatchObject({
    email: input.email,
    password: input.password,
  });
  expect(successNotification).toHaveBeenCalledExactlyOnceWith("Logged In");
});

test("keeps the form retryable when session refresh settles logged out", async () => {
  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: () => new Response(null, { status: 204 }),
  });
  registerEndpoint("/api/_auth/session", () => null);

  await renderSuspended(LoginPage);
  const replace = vi.spyOn(useRouter(), "replace");
  await userEvent.type(screen.getByLabelText(/email address/i), input.email);
  await userEvent.type(screen.getByLabelText(/password/i), input.password);

  const submitButton = screen.getByRole("button", {
    name: /log in/i,
  }) as HTMLButtonElement;
  await userEvent.click(submitButton);

  await waitFor(() => expect(submitButton.disabled).toBe(false));
  expect(replace).not.toHaveBeenCalledWith("/app");
});

test("validates lazily on blur and updates the field error while editing", async () => {
  await renderSuspended(LoginPage);

  const email = screen.getByLabelText(/email address/i);
  const password = screen.getByLabelText(/password/i);

  await userEvent.type(email, "not-an-email");
  expect(email.hasAttribute("aria-invalid")).toBe(false);

  await userEvent.tab();
  await waitFor(() => expect(email.getAttribute("aria-invalid")).toBe("true"));
  expect(password.hasAttribute("aria-invalid")).toBe(false);

  await userEvent.clear(email);
  await userEvent.type(email, "user@example.com");
  await waitFor(() => expect(email.hasAttribute("aria-invalid")).toBe(false));
});

test("should block login when validation fails", async () => {
  const loginHandler = vi.fn();

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: loginHandler,
  });

  await renderSuspended(LoginPage);
  const replace = vi.spyOn(useRouter(), "replace");

  await userEvent.type(screen.getByLabelText(/email address/i), "not-an-email");
  await userEvent.click(screen.getByRole("button", { name: /log in/i }));

  await screen.findByText(/invalid email/i);
  expect(loginHandler).toHaveBeenCalledTimes(0);
  expect(replace).not.toHaveBeenCalledWith("/app");
});

test("should disable submit while login is pending", async () => {
  let resolveLogin: (response: Response) => void = () => {};
  const loginResponse = new Promise<Response>((resolve) => {
    resolveLogin = resolve;
  });
  const loginHandler = vi.fn(async () => loginResponse);

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: loginHandler,
  });
  registerEndpoint("/api/_auth/session", () => ({
    id: "session-1",
    user: signedInUser,
  }));

  await renderSuspended(LoginPage);
  const replace = vi.spyOn(useRouter(), "replace");

  await userEvent.type(screen.getByLabelText(/email address/i), input.email);
  await userEvent.type(screen.getByLabelText(/password/i), input.password);

  const submitButton = screen.getByRole("button", { name: /log in/i });
  await userEvent.click(submitButton);

  await waitFor(() =>
    expect((submitButton as HTMLButtonElement).disabled).toBe(true),
  );
  await userEvent.click(submitButton);
  expect(loginHandler).toHaveBeenCalledTimes(1);

  resolveLogin(new Response(null, { status: 204 }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/app"));
});

test("releases pending state after login failure and allows retry", async () => {
  const sessionHandler = vi.fn(() => ({ id: "session-1", user: signedInUser }));
  let attempts = 0;
  const loginHandler = vi.fn((event) => {
    attempts++;
    if (attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Login failed" };
    }
    return new Response(null, { status: 204 });
  });

  registerEndpoint("/api/auth/login", {
    method: "POST",
    handler: loginHandler,
  });
  registerEndpoint("/api/_auth/session", sessionHandler);

  await renderSuspended(LoginPage);
  const replace = vi.spyOn(useRouter(), "replace");
  await userEvent.type(screen.getByLabelText(/email address/i), input.email);
  await userEvent.type(screen.getByLabelText(/password/i), input.password);
  const submitButton = screen.getByRole("button", {
    name: /log in/i,
  }) as HTMLButtonElement;

  await userEvent.click(submitButton);
  await waitFor(() => expect(loginHandler).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(submitButton.disabled).toBe(false));
  expect(replace).not.toHaveBeenCalledWith("/app");
  expect(sessionHandler).not.toHaveBeenCalled();
  expect(successNotification).not.toHaveBeenCalled();

  await userEvent.click(submitButton);
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/app"));
  expect(loginHandler).toHaveBeenCalledTimes(2);
});
