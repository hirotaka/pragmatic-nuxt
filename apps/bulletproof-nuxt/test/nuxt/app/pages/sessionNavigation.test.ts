import { afterEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import LoginPage from "#layers/auth/app/pages/auth/login.vue";

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
  expect(wrapper.text()).toContain("Log in to continue.");
  expect(wrapper.get("a[href=\"/register\"]").text()).toContain("Register");
  expect(routerReplace).not.toHaveBeenCalled();
  await userEvent.click(wrapper.get("button").element as HTMLElement);

  expect(routerReplace).toHaveBeenCalledWith("/app");
});
