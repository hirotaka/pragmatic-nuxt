import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { expect, test } from "vitest";
import HomePage from "../index.vue";

mockNuxtImport("useUser", () => () => ({ user: { value: null } }));

test("home actions render Lucide by default and a Nuxt Icon for the GitHub brand", async () => {
  const wrapper = await mountSuspended(HomePage);
  const start = wrapper.findAll("button").find(button => button.text().includes("Get started"));
  expect(start?.find("svg").exists()).toBe(true);

  const repo = wrapper.find("a[href='https://github.com/hirotaka/bulletproof-vue']");
  expect(repo.text()).toContain("Github Repo");
  const brandIcon = repo.find("[data-icon='inline-start']");
  expect(brandIcon.exists()).toBe(true);
  expect(brandIcon.classes()).toContain("iconify--uil");
  expect(brandIcon.attributes("aria-hidden")).toBe("true");
});
