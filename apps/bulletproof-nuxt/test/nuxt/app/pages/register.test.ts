import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { registerEndpoint, renderSuspended } from "@nuxt/test-utils/runtime";
import { cleanup, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { readBody, setResponseStatus } from "h3";
import { clearNuxtData, useRouter, useUserSession } from "#imports";
import RegisterPage from "~~/app/pages/register.vue";

const { successNotification, errorNotification } = vi.hoisted(() => ({
  successNotification: vi.fn(),
  errorNotification: vi.fn(),
}));
vi.mock("vue-sonner", () => ({ toast: { success: successNotification, error: errorNotification } }));

const input = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  password: "Password123!",
  teamName: "Analytical Engines",
};
const signedInUser = {
  id: "user-1",
  firstName: input.firstName,
  lastName: input.lastName,
  email: input.email,
  teamId: "team-1",
  role: "ADMIN",
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  successNotification.mockReset();
  errorNotification.mockReset();
  clearNuxtData();
  useUserSession().session.value = null;
  registerEndpoint("/api/teams", () => []);
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: signedInUser }));
});

afterEach(() => {
  cleanup();
  useUserSession().session.value = null;
  clearNuxtData();
  vi.restoreAllMocks();
});

async function openRegistration() {
  await renderSuspended(RegisterPage, { route: "/register" });
  return vi.spyOn(useRouter(), "replace").mockResolvedValue(undefined);
}

async function fillNewTeamForm() {
  await userEvent.type(screen.getByLabelText(/first name/i), input.firstName);
  await userEvent.type(screen.getByLabelText(/last name/i), input.lastName);
  await userEvent.type(screen.getByLabelText(/email address/i), input.email);
  await userEvent.type(screen.getByLabelText(/password/i), input.password);
  await userEvent.type(screen.getByLabelText(/team name/i), input.teamName);
}

test("registers a new team and navigates only after the authenticated session refresh", async () => {
  let capturedBody: Record<string, unknown> | undefined;
  registerEndpoint("/api/register", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 201 });
    },
  });
  const session = Promise.withResolvers<Record<string, unknown>>();
  const sessionHandler = vi.fn(() => session.promise);
  registerEndpoint("/api/_auth/session", sessionHandler);
  const replace = await openRegistration();

  expect(screen.getByText("Demo workspace")).toBeTruthy();
  expect(screen.getByText("Create your account")).toBeTruthy();
  expect(screen.getByText(/Start a new team or join an existing one\./)).toBeTruthy();
  expect(screen.getByRole("link", { name: "Log in" }).getAttribute("href")).toBe("/auth/login");
  expect(replace).not.toHaveBeenCalled();
  await fillNewTeamForm();
  await userEvent.click(screen.getByRole("button", { name: /register/i }));

  try {
    await waitFor(() => expect(capturedBody).toBeDefined());
    await waitFor(() => expect(sessionHandler).toHaveBeenCalledTimes(1));
    expect(replace).not.toHaveBeenCalled();
    expect(successNotification).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: /register/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(capturedBody).toMatchObject({ ...input, teamId: null });
  }
  finally {
    session.resolve({ id: "session-1", user: signedInUser });
  }
  await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith("/app"));
  expect(successNotification).toHaveBeenCalledExactlyOnceWith("Account Created");
});

test("releases pending state without navigating when the session refresh settles logged out", async () => {
  const registerHandler = vi.fn(() => new Response(null, { status: 201 }));
  const sessionHandler = vi.fn(() => null);
  registerEndpoint("/api/register", { method: "POST", handler: registerHandler });
  registerEndpoint("/api/_auth/session", sessionHandler);
  const replace = await openRegistration();
  await fillNewTeamForm();
  const submit = screen.getByRole("button", { name: /register/i });

  await userEvent.click(submit);

  await waitFor(() => expect(registerHandler).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(sessionHandler).toHaveBeenCalledTimes(1));
  await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
  expect(replace).not.toHaveBeenCalled();
});

test("loads the page's teams and submits the selected team without a stale team name", async () => {
  const team = {
    id: "team-1",
    name: "Existing Team",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  registerEndpoint("/api/teams", () => [team]);
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: { ...signedInUser, role: "USER" } }));
  let capturedBody: Record<string, unknown> | undefined;
  registerEndpoint("/api/register", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 201 });
    },
  });
  const replace = await openRegistration();
  await fillNewTeamForm();

  const chooseTeam = screen.getByRole("checkbox", { name: /join existing team/i });
  await userEvent.click(chooseTeam);
  expect(chooseTeam.getAttribute("data-state")).toBe("checked");
  const select = screen.getByLabelText(/^team$/i);
  expect(screen.getByRole("option", { name: team.name })).toBeTruthy();
  await userEvent.selectOptions(select, team.id);
  await userEvent.click(screen.getByRole("button", { name: /register/i }));

  await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith("/app"));
  expect(capturedBody).toMatchObject({ ...input, teamName: null, teamId: team.id });
});

test("disables submit and prevents duplicate registration while the request is pending", async () => {
  const response = Promise.withResolvers<Response>();
  const registerHandler = vi.fn(() => response.promise);
  registerEndpoint("/api/register", { method: "POST", handler: registerHandler });
  const replace = await openRegistration();
  await fillNewTeamForm();
  const submit = screen.getByRole("button", { name: /register/i });

  try {
    await userEvent.click(submit);
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(true));
    await userEvent.click(submit);
    expect(registerHandler).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  }
  finally {
    response.resolve(new Response(null, { status: 201 }));
  }
  await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith("/app"));
});

test("keeps the draft editable after an email conflict and navigates after a corrected retry", async () => {
  const sessionHandler = vi.fn(() => ({ id: "session-1", user: signedInUser }));
  registerEndpoint("/api/_auth/session", sessionHandler);
  let attempts = 0;
  const registerHandler = vi.fn((event) => {
    if (++attempts === 1) {
      setResponseStatus(event, 409);
      return { message: "Email already registered" };
    }
    return new Response(null, { status: 201 });
  });
  registerEndpoint("/api/register", { method: "POST", handler: registerHandler });
  const replace = await openRegistration();
  await fillNewTeamForm();
  const submit = screen.getByRole("button", { name: /register/i });

  await userEvent.click(submit);

  await waitFor(() => expect(registerHandler).toHaveBeenCalledTimes(1));
  await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
  expect(replace).not.toHaveBeenCalled();
  const email = screen.getByLabelText(/email address/i);
  expect((email as HTMLInputElement).value).toBe(input.email);
  expect(sessionHandler).not.toHaveBeenCalled();
  expect(successNotification).not.toHaveBeenCalled();
  await userEvent.clear(email);
  await userEvent.type(email, "available@example.com");
  registerEndpoint("/api/_auth/session", () => ({
    id: "session-1",
    user: { ...signedInUser, email: "available@example.com" },
  }));
  await userEvent.click(submit);

  await waitFor(() => expect(replace).toHaveBeenCalledExactlyOnceWith("/app"));
  expect(registerHandler).toHaveBeenCalledTimes(2);
});
