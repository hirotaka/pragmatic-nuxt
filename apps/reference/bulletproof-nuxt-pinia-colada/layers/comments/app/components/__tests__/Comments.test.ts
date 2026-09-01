import { afterEach, expect, test } from "vitest";
import { cleanup, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Comments from "../Comments.vue";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("passes discussion identity to the comments list", async () => {
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
    global: { stubs: { CommentsList: { template: "<div>{{ discussionId }}</div>", props: ["discussionId"] } } },
  });

  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("discussion-1")).toBeTruthy();
});
