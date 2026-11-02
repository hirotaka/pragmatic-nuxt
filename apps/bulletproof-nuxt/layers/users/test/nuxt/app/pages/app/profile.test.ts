import { computed } from "vue";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
} from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ProfilePage from "#layers/users/app/pages/app/profile.vue";

const { notify, refreshSession, session } = vi.hoisted(() => ({
  notify: vi.fn(),
  refreshSession: vi.fn(),
  session: { value: null as Record<string, unknown> | null },
}));

const profile = {
  id: "user-1",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  role: "USER",
  bio: "Existing bio",
  teamId: "team-1",
  createdAt: "2026-07-10T00:00:00.000Z",
};

mockNuxtImport("useUserSession", () => () => ({
  session,
  user: computed(() => session.value?.user ?? null),
  loggedIn: computed(() => Boolean(session.value?.user)),
  fetch: refreshSession,
}));
vi.mock("vue-sonner", () => ({ toast: { success: notify, error: notify } }));

beforeEach(() => {
  notify.mockClear();
  refreshSession.mockReset().mockResolvedValue(undefined);
  session.value = { id: "session-1", user: profile };
});
const owners: { unmount: () => void }[] = [];
afterEach(() => {
  owners.splice(0).forEach(owner => owner.unmount());
  cleanup();
  document.body.innerHTML = "";
});

async function openProfile() {
  const wrapper = await mountSuspended(ProfilePage);
  owners.push(wrapper);
  const page = within(wrapper.element as HTMLElement);
  await userEvent.click(page.getByRole("button", { name: "Update Profile" }));
  const drawer = await within(document.body).findByRole("dialog", {
    name: "Update Profile",
  });
  return { page, drawer: within(drawer) };
}

test("shows the signed-in profile and populates the real update drawer", async () => {
  const { page, drawer } = await openProfile();
  expect(
    page.getByText("Manage the account details used across this workspace."),
  ).toBeTruthy();
  expect(page.getByText("User Information")).toBeTruthy();
  expect(page.getByText("Existing bio")).toBeTruthy();
  expect((drawer.getByLabelText("First Name") as HTMLInputElement).value).toBe(
    "Test",
  );
  expect((drawer.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe(
    "Existing bio",
  );
  expect(
    page.getByRole("button", { name: "Update Profile" }).querySelector("svg"),
  ).toBeTruthy();
});

test("validates the update before API, then sends the edited profile and closes the drawer", async () => {
  let body: Record<string, unknown> | undefined;
  const handler = vi.fn(async (event) => {
    body = await readBody(event);
    return new Response(null, { status: 204 });
  });
  registerEndpoint("/api/profile", { method: "PATCH", handler });
  const { drawer } = await openProfile();
  await userEvent.clear(drawer.getByLabelText("Email"));
  await userEvent.type(drawer.getByLabelText("Email"), "not-an-email");
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await drawer.findByText(/invalid email address/i);
  expect(handler).not.toHaveBeenCalled();
  await userEvent.clear(drawer.getByLabelText("Email"));
  await userEvent.type(drawer.getByLabelText("Email"), profile.email);
  await userEvent.clear(drawer.getByLabelText("Bio"));
  await userEvent.type(drawer.getByLabelText("Bio"), "Updated bio");
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(body).toMatchObject({
      email: profile.email,
      bio: "Updated bio",
      firstName: "Test",
      lastName: "User",
    }),
  );
  await waitFor(() => expect(notify).toHaveBeenCalledWith("Profile Updated"));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", { name: "Update Profile" }),
    ).toBeNull(),
  );
});

test("keeps the drawer open when session refresh settles logged out", async () => {
  refreshSession.mockImplementationOnce(async () => {
    session.value = null;
  });
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: () => new Response(null, { status: 204 }),
  });
  const { drawer } = await openProfile();
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
  expect(
    within(document.body).getByRole("dialog", { name: "Update Profile" }),
  ).toBeTruthy();
  expect(notify).toHaveBeenCalledWith("Session Unavailable", {
    description:
      "The request completed, but the session could not be refreshed. Please try again.",
  });
});

test("keeps the draft retryable after an API failure", async () => {
  let attempts = 0;
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: (event) => {
      if (++attempts === 1) {
        setResponseStatus(event, 500);
        return { message: "Profile update failed" };
      }
      return new Response(null, { status: 204 });
    },
  });
  const { drawer } = await openProfile();
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() =>
    expect(drawer.getByLabelText("Email").hasAttribute("disabled")).toBe(false),
  );
  expect(notify).not.toHaveBeenCalledWith("Profile Updated");
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", { name: "Update Profile" }),
    ).toBeNull(),
  );
});
