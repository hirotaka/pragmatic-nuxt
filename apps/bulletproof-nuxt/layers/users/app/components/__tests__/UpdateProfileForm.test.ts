import { computed } from "vue";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { readBody, setResponseStatus } from "h3";
import { cleanup, waitFor } from "@testing-library/vue";
import UpdateProfileForm from "../UpdateProfileForm.vue";

const { addNotification, refreshSession, session } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  refreshSession: vi.fn(),
  session: { value: null as Record<string, unknown> | null },
}));

const profile = {
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  bio: "Existing bio",
};

mockNuxtImport("useUserSession", () => () => ({
  session,
  loggedIn: computed(() => Boolean(session.value?.user)),
  fetch: refreshSession,
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

beforeEach(() => {
  addNotification.mockClear();
  refreshSession.mockReset().mockResolvedValue(undefined);
  session.value = { id: "session-1", user: profile };
});

afterEach(() => cleanup());

const mountForm = () => mountSuspended(UpdateProfileForm, { props: { profile } });

test("UpdateProfileForm populates values and submits normalized payload", async () => {
  let capturedBody: Record<string, unknown> | undefined;
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: async (event) => {
      capturedBody = await readBody(event);
      return new Response(null, { status: 204 });
    },
  });
  const wrapper = await mountForm();

  expect((wrapper.get("input[name='firstName']").element as HTMLInputElement).value).toBe("Test");
  expect((wrapper.get("textarea[name='bio']").element as HTMLTextAreaElement).value).toBe("Existing bio");
  await wrapper.get("textarea[name='bio']").setValue("Updated bio");
  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(capturedBody).toBeDefined());
  expect(capturedBody).toMatchObject({ ...profile, bio: "Updated bio" });
  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Profile Updated" });
});

test("UpdateProfileForm does not emit success when session refresh settles empty", async () => {
  refreshSession.mockImplementationOnce(async () => {
    session.value = null;
  });
  registerEndpoint("/api/profile", {
    method: "PATCH",
    handler: () => new Response(null, { status: 204 }),
  });
  const wrapper = await mountForm();

  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
  expect(session.value).toBeNull();
  expect(wrapper.emitted("success")).toBeUndefined();
  expect(addNotification).toHaveBeenCalledWith({
    type: "error",
    title: "Session Unavailable",
    message: "The request completed, but the session could not be refreshed. Please try again.",
  });
});

test("UpdateProfileForm blocks invalid input before calling profile API", async () => {
  const profileHandler = vi.fn();
  registerEndpoint("/api/profile", { method: "PATCH", handler: profileHandler });
  const wrapper = await mountForm();

  await wrapper.get("input[name='email']").setValue("not-an-email");
  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(wrapper.text()).toMatch(/invalid email address/i));
  expect(profileHandler).not.toHaveBeenCalled();
});

test("UpdateProfileForm remains retryable after API failure", async () => {
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
  registerEndpoint("/api/_auth/session", () => ({ id: "session-1", user: profile }));
  const wrapper = await mountForm();

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() => expect(wrapper.get("input[name='email']").attributes("disabled")).toBeUndefined());
  expect(wrapper.emitted("success")).toBeUndefined();

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
});
