import { afterEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import LoginPage from "../login.vue";
import RegisterPage from "../register.vue";

vi.mock("#layers/teams/app/composables/useTeams", () => ({
  useTeams: async () => ({ data: [] }),
}));

afterEach(() => vi.restoreAllMocks());

test("navigates from login only after the form reports success", async () => {
  const wrapper = await mountSuspended(LoginPage, {
    global: {
      stubs: {
        LoginForm: {
          emits: ["success"],
          template: `<button type="button" @click="$emit('success')">Complete login</button>`,
        },
        NuxtLink: {
          props: ["to"],
          template: `<a :href="to"><slot /></a>`,
        },
      },
    },
  });

  const routerReplace = vi.spyOn(wrapper.vm.$router, "replace").mockResolvedValue(undefined);

  expect(wrapper.text()).toContain("Welcome back");
  expect(wrapper.text()).toContain("Log in to continue managing your team's discussions.");
  expect(wrapper.get("a[href=\"/auth/register\"]").text()).toContain("Register");
  expect(routerReplace).not.toHaveBeenCalled();
  await userEvent.click(wrapper.get("button").element as HTMLElement);

  expect(routerReplace).toHaveBeenCalledWith("/app");
});

test("navigates from registration only after the form reports success", async () => {
  const wrapper = await mountSuspended(RegisterPage, {
    global: {
      stubs: {
        RegisterForm: {
          emits: ["success"],
          template: `<button type="button" @click="$emit('success')">Complete registration</button>`,
        },
        NuxtLink: {
          props: ["to"],
          template: `<a :href="to"><slot /></a>`,
        },
      },
    },
  });

  const routerReplace = vi.spyOn(wrapper.vm.$router, "replace").mockResolvedValue(undefined);

  expect(wrapper.text()).toContain("Demo workspace");
  expect(wrapper.text()).toContain("Create your account");
  expect(wrapper.text()).toContain("Start a new team or join an existing one.");
  expect(wrapper.get("a[href=\"/auth/login\"]").text()).toContain("Log in");
  expect(routerReplace).not.toHaveBeenCalled();
  await userEvent.click(wrapper.get("button").element as HTMLElement);

  expect(routerReplace).toHaveBeenCalledWith("/app");
});
