import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { ref } from "vue";
import UpdateProfile from "../UpdateProfile.vue";

const { addNotification, fetchSession, user } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  fetchSession: vi.fn().mockResolvedValue(undefined),
  user: {
    value: {
      id: "user-1",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      bio: "Existing bio",
      role: "USER" as const,
      teamId: "team-1",
      createdAt: "2026-07-10T00:00:00.000Z",
    },
  },
}));

mockNuxtImport("useUserSession", () => () => ({
  user,
  fetch: fetchSession,
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user,
  }),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("@pinia/colada", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pinia/colada")>();
  return {
    ...actual,
    useMutation: (options: { mutation: (input: Record<string, unknown>) => Promise<unknown> }) => {
      const status = ref<"idle" | "success">("idle");
      return {
        isLoading: ref(false),
        status,
        mutateAsync: async (input: Record<string, unknown>) => {
          const result = await options.mutation(input);
          status.value = "success";
          return result;
        },
      };
    },
  };
});

beforeEach(() => {
  addNotification.mockReset();
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getInputValue(element: HTMLElement) {
  return (element as HTMLInputElement | HTMLTextAreaElement).value;
}

test("UpdateProfile populates the current session User and submits the normalized payload", async () => {
  let capturedBody: Record<string, unknown> | undefined;
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 204 });
    },
  });
  fetchSession.mockClear();

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));

  expect(getInputValue(await bodyScreen.findByLabelText(/first name/i))).toBe("Test");
  expect(getInputValue(bodyScreen.getByLabelText(/last name/i))).toBe("User");
  expect(getInputValue(bodyScreen.getByLabelText(/^email$/i))).toBe("user@example.com");
  expect(getInputValue(bodyScreen.getByLabelText(/bio/i))).toBe("Existing bio");

  await userEvent.clear(bodyScreen.getByLabelText(/bio/i));
  await userEvent.type(bodyScreen.getByLabelText(/bio/i), "Updated bio");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(capturedBody).toMatchObject({
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    bio: "Updated bio",
  }));
  await waitFor(() => expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Profile Updated" }));
  expect(fetchSession).toHaveBeenCalledTimes(1);
});

test("UpdateProfile keeps local validation before calling Profile API", async () => {
  const profileHandler = vi.fn();
  registerEndpoint("/api/profile", { method: "PATCH", handler: profileHandler });

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));
  await userEvent.clear(await bodyScreen.findByLabelText(/^email$/i));
  await userEvent.type(bodyScreen.getByLabelText(/^email$/i), "not-an-email");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await bodyScreen.findByText(/invalid email address/i);
  expect(profileHandler).not.toHaveBeenCalled();
});

test("UpdateProfile keeps the drawer open and allows retry after a write failure", async () => {
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
  fetchSession.mockClear();

  const wrapper = await mountSuspended(UpdateProfile);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  await userEvent.click(screen.getByRole("button", { name: /update profile/i }));
  const submitButton = await bodyScreen.findByRole("button", { name: /submit/i });

  await userEvent.click(submitButton);
  await waitFor(() => expect(bodyScreen.getByRole("dialog", { name: /update profile/i })).toBeTruthy());
  await userEvent.click(submitButton);
  await waitFor(() => expect(attempts).toBe(2));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Profile Updated" });
  expect(fetchSession).toHaveBeenCalledTimes(1);
});
