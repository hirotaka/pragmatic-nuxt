import { mountSuspended } from "@nuxt/test-utils/runtime";
import { expect, test } from "vitest";
import AppSpinner from "../AppSpinner.vue";

test("announces the loading label and hides the decorative spinner", async () => {
  const wrapper = await mountSuspended(AppSpinner, {
    props: { label: "Loading discussions" },
  });

  expect(wrapper.get("[role=\"status\"]").attributes("aria-label")).toBe("Loading discussions");
  expect(wrapper.get("svg").attributes("aria-hidden")).toBe("true");
  expect(wrapper.get(".sr-only").text()).toBe("Loading discussions");
});
