import { expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import MarkdownPreview from "../MarkdownPreview.vue";

test("MarkdownPreview renders markdown content", async () => {
  const wrapper = await mountSuspended(MarkdownPreview, {
    props: {
      value: "**Hello** markdown",
    },
  });

  expect(wrapper.text()).toContain("Hello markdown");
  expect(wrapper.html()).toContain("<strong>Hello</strong>");
});
