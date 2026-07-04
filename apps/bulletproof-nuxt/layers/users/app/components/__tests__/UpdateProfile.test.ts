import { afterEach, expect, test, vi, beforeEach } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import UpdateProfile from "../UpdateProfile.vue";

const { mockUser, addNotification, fetchSession } = vi.hoisted(() => ({
  mockUser: {
    value: {
      id: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      role: "USER",
      bio: "Existing bio",
      teamId: "team-1",
      createdAt: new Date(),
    },
  },
  addNotification: vi.fn(),
  fetchSession: vi.fn(),
}));

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    useUserSession: () => ({
      fetch: fetchSession,
    }),
  };
});

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user: mockUser,
  }),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

beforeEach(() => {
  addNotification.mockClear();
  fetchSession.mockClear();
  mockUser.value = {
    id: "user-1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER",
    bio: "Existing bio",
    teamId: "team-1",
    createdAt: new Date(),
  };
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getInputValue(element: HTMLElement) {
  return (element as HTMLInputElement | HTMLTextAreaElement).value;
}

test("UpdateProfile populates current user values and submits normalized payload", async () => {
  let capturedBody: Record<string, unknown> | undefined;

  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return { data: { ...mockUser.value, ...(capturedBody ?? {}) } };
    },
  });

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));

  const firstName = await bodyScreen.findByLabelText(/first name/i);
  expect(getInputValue(firstName)).toBe("Test");
  expect(getInputValue(bodyScreen.getByLabelText(/last name/i))).toBe("User");
  expect(getInputValue(bodyScreen.getByLabelText(/^email$/i))).toBe("user@example.com");
  expect(getInputValue(bodyScreen.getByLabelText(/bio/i))).toBe("Existing bio");

  await userEvent.clear(bodyScreen.getByLabelText(/bio/i));
  await userEvent.type(bodyScreen.getByLabelText(/bio/i), "Updated bio");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(capturedBody).toBeDefined());
  expect(capturedBody).toMatchObject({
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    bio: "Updated bio",
  });
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Profile Updated",
  });
});

test("UpdateProfile blocks invalid input before calling profile API", async () => {
  const profileHandler = vi.fn();

  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: profileHandler,
  });

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));
  await userEvent.clear(await bodyScreen.findByLabelText(/^email$/i));
  await userEvent.type(bodyScreen.getByLabelText(/^email$/i), "not-an-email");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await bodyScreen.findByText(/invalid email address/i);
  expect(profileHandler).toHaveBeenCalledTimes(0);
});

test("UpdateProfile keeps drawer open and notifies on API failure", async () => {
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: (event) => {
      setResponseStatus(event, 500);
      return { message: "Profile update failed" };
    },
  });

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await waitFor(() => expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({
    type: "error",
    title: "Failed to update profile",
  })));
  expect(bodyScreen.getByRole("dialog", { name: /update profile/i })).toBeTruthy();
});
