import { afterEach, expect, test, vi, beforeEach } from "vitest";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import UpdateProfile from "../UpdateProfile.vue";

const { mockUser, addNotification, refreshSession, session } = vi.hoisted(() => ({
  mockUser: {
    value: {
      id: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      role: "USER",
      bio: "Existing bio",
      teamId: "team-1",
      createdAt: "2026-07-10T00:00:00.000Z",
    },
  },
  addNotification: vi.fn(),
  refreshSession: vi.fn(),
  session: { value: null as Record<string, unknown> | null },
}));

mockNuxtImport("useUserSession", () => () => ({
  session,
  fetch: refreshSession,
}));

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
  refreshSession.mockReset().mockResolvedValue(undefined);
  session.value = null;
  mockUser.value = {
    id: "user-1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER",
    bio: "Existing bio",
    teamId: "team-1",
    createdAt: "2026-07-10T00:00:00.000Z",
  };
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getInputValue(element: HTMLElement) {
  return (element as HTMLInputElement | HTMLTextAreaElement).value;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

test("UpdateProfile populates current user values and submits normalized payload", async () => {
  let capturedBody: Record<string, unknown> | undefined;
  const sessionSettlement = deferred();
  refreshSession.mockReturnValueOnce(sessionSettlement.promise);

  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 204 });
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
  const closeButton = bodyScreen
    .getAllByRole("button", { name: /close/i })
    .find(button => button.hasAttribute("disabled"));
  expect(closeButton).toBeTruthy();
  await userEvent.click(closeButton!);
  await userEvent.keyboard("{Escape}");
  expect(bodyScreen.getByRole("dialog", { name: /update profile/i })).toBeTruthy();
  expect(addNotification).not.toHaveBeenCalled();

  sessionSettlement.resolve();

  await waitFor(() => expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Profile Updated",
  }));
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /update profile/i })).toBeNull());
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

test("UpdateProfile keeps the drawer open and allows retry after API failure", async () => {
  let attempts = 0;
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: (event) => {
      attempts++;
      if (attempts === 1) {
        setResponseStatus(event, 500);
        return { message: "Profile update failed" };
      }
      return new Response(null, { status: 204 });
    },
  });
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: mockUser.value }));

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  const submitButton = bodyScreen.getByRole("button", { name: /submit/i }) as HTMLButtonElement;
  await waitFor(() => expect(submitButton.disabled).toBe(false));
  expect(bodyScreen.getByRole("dialog", { name: /update profile/i })).toBeTruthy();
  const closeButton = bodyScreen.getAllByRole("button", { name: /close/i })[0]!;
  expect(closeButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(submitButton);
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /update profile/i })).toBeNull());
});
