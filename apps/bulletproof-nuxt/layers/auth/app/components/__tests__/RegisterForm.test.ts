import { expect, test, vi } from "vitest";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody } from "h3";
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

test("should register new user and call onSuccess cb which should navigate the user to the app", async () => {
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
    createdAt: Date.now(),
  };

  let capturedBody: Record<string, unknown> | undefined;

  // Mock the teams endpoint (fetched on mount)
  registerEndpoint("/api/teams", () => []);

  // Mock the register endpoint
  registerEndpoint("/api/auth/register", {
    method: "POST",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return { user: mockUser };
    },
  });

  // Mock session refresh endpoint
  registerEndpoint("/api/_auth/session", () => ({}));

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
