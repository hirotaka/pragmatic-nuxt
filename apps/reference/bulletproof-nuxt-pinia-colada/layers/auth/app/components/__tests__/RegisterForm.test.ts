import { expect, test, vi } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import RegisterForm from "../RegisterForm.vue";
import { createUser } from "~~/test/data-generators";
import { renderComponent, screen, userEvent, waitFor } from "~~/test/test-utils";

// Mock vue-router's useRoute
vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRoute: vi.fn(() => ({
      query: {},
      params: {},
      path: "/auth/register",
    })),
  };
});

test("registers a new user and calls the successful submit callback", async () => {
  const newUser = createUser({});
  const onSuccess = vi.fn();
  const setChooseTeam = vi.fn();

  // Mock successful register response
  const mockUser = {
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    teamId: newUser.teamId,
    role: "USER",
    createdAt: new Date().toISOString(),
  };

  let capturedBody: Record<string, unknown> | undefined;

  // Mock the register endpoint
  registerEndpoint("/api/auth/register", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 201 });
    },
  });

  // Mock session refresh endpoint
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: mockUser }));

  await renderComponent(RegisterForm, {
    url: "/auth/register",
    path: "/auth/register",
    props: {
      onSuccess,
      chooseTeam: false,
      setChooseTeam,
    },
  });

  // Fill in the form
  await userEvent.type(screen.getByLabelText(/first name/i), newUser.firstName);
  await userEvent.type(screen.getByLabelText(/last name/i), newUser.lastName);
  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);
  await userEvent.type(screen.getByLabelText(/team name/i), newUser.teamName);

  // Submit the form
  await userEvent.click(screen.getByRole("button", { name: /register/i }));

  // Wait for the onSuccess callback to be called
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));

  // Verify the request body
  expect(capturedBody).toMatchObject({
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    password: newUser.password,
    teamName: newUser.teamName,
    teamId: null,
  });
});

test("should register new user with an existing team without leaking team name", async () => {
  const newUser = createUser({});
  const onSuccess = vi.fn();
  const team = { id: "team-1", name: "Existing Team" };
  let capturedBody: Record<string, unknown> | undefined;

  registerEndpoint("/api/auth/register", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 201 });
    },
  });
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: newUser }));

  await renderComponent(RegisterForm, {
    url: "/auth/register",
    path: "/auth/register",
    props: { onSuccess, teams: [team] },
  });

  await userEvent.type(screen.getByLabelText(/first name/i), newUser.firstName);
  await userEvent.type(screen.getByLabelText(/last name/i), newUser.lastName);
  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);
  await userEvent.type(screen.getByLabelText(/team name/i), "Stale Team Name");
  await userEvent.click(screen.getByLabelText(/join existing team/i));
  await userEvent.selectOptions(screen.getByLabelText(/^team$/i), team.id);
  await userEvent.click(screen.getByRole("button", { name: /register/i }));

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  expect(capturedBody).toMatchObject({
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    password: newUser.password,
    teamName: null,
    teamId: team.id,
  });
});

test("renders register block copy and login cross-link", async () => {
  await renderComponent(RegisterForm, {
    url: "/auth/register",
    path: "/auth/register",
  });

  expect(screen.getByRole("heading", { name: /create your account/i })).toBeTruthy();
  expect(screen.getByText(/start a new team or join an existing one/i)).toBeTruthy();
  expect(screen.getByText(/demo workspace/i)).toBeTruthy();
  expect(screen.getByText(/log in/i)).toBeTruthy();
});

test("should disable submit while registration is pending", async () => {
  const newUser = createUser({});
  const onSuccess = vi.fn();
  let resolveRegister: (response: Response) => void = () => {};
  const registerResponse = new Promise<Response>((resolve) => {
    resolveRegister = resolve;
  });
  const registerHandler = vi.fn(async () => registerResponse);

  registerEndpoint("/api/auth/register", {
    method: "POST",
    handler: registerHandler,
  });
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: newUser }));

  await renderComponent(RegisterForm, {
    url: "/auth/register",
    path: "/auth/register",
    props: { onSuccess },
  });

  await userEvent.type(screen.getByLabelText(/first name/i), newUser.firstName);
  await userEvent.type(screen.getByLabelText(/last name/i), newUser.lastName);
  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);
  await userEvent.type(screen.getByLabelText(/team name/i), newUser.teamName);

  const submitButton = screen.getByRole("button", { name: /register/i });
  await userEvent.click(submitButton);

  await waitFor(() => expect((submitButton as HTMLButtonElement).disabled).toBe(true));
  await userEvent.click(submitButton);
  expect(registerHandler).toHaveBeenCalledTimes(1);

  resolveRegister(new Response(null, { status: 201 }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});

test("releases pending state after registration failure and allows retry", async () => {
  const newUser = createUser({});
  const onSuccess = vi.fn();
  let attempts = 0;
  const registerHandler = vi.fn((event) => {
    attempts++;
    if (attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Registration failed" };
    }
    return new Response(null, { status: 201 });
  });

  registerEndpoint("/api/auth/register", { method: "POST", handler: registerHandler });
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: newUser }));

  await renderComponent(RegisterForm, {
    url: "/auth/register",
    path: "/auth/register",
    props: { onSuccess },
  });
  await userEvent.type(screen.getByLabelText(/first name/i), newUser.firstName);
  await userEvent.type(screen.getByLabelText(/last name/i), newUser.lastName);
  await userEvent.type(screen.getByLabelText(/email address/i), newUser.email);
  await userEvent.type(screen.getByLabelText(/password/i), newUser.password);
  await userEvent.type(screen.getByLabelText(/team name/i), newUser.teamName);
  const submitButton = screen.getByRole("button", { name: /register/i }) as HTMLButtonElement;

  await userEvent.click(submitButton);
  await waitFor(() => expect(registerHandler).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(submitButton.disabled).toBe(false));
  expect(onSuccess).not.toHaveBeenCalled();

  await userEvent.click(submitButton);
  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  expect(registerHandler).toHaveBeenCalledTimes(2);
});
