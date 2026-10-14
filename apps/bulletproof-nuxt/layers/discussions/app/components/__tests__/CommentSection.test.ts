import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CommentSection from "../CommentSection.vue";

const {
  createCommentMutate,
  refresh,
  useCommentList,
} = vi.hoisted(() => ({
  createCommentMutate: vi.fn(),
  refresh: vi.fn(),
  useCommentList: vi.fn(),
}));

vi.mock("vue-sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("#layers/discussions/app/composables/useCommentList", () => ({
  useCommentList,
}));

mockNuxtImport("useCommentCreate", () => () => createCommentMutate);

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  createCommentMutate.mockReset().mockResolvedValue(undefined);
  refresh.mockReset().mockResolvedValue(undefined);
  useCommentList.mockReset().mockResolvedValue({ refresh });
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const mountCommentSection = (discussionId = "discussion-1") => mountSuspended(CommentSection, {
  props: { discussionId },
  global: {
    stubs: {
      CommentList: {
        name: "CommentList",
        props: ["discussionId"],
        template: "<div data-testid='comments-list' />",
      },
    },
  },
});

test("renders the list as the comments data owner", async () => {
  const wrapper = await mountCommentSection();
  const list = wrapper.findComponent({ name: "CommentList" });

  expect(list.props("discussionId")).toBe("discussion-1");
  expect(useCommentList).toHaveBeenCalledOnce();
  expect(useCommentList).toHaveBeenCalledWith("discussion-1");
  expect(within(wrapper.element as HTMLElement).getByRole("button", { name: /create comment/i }).querySelector("svg")).toBeTruthy();
});

test("discards an open creation draft when discussion identity changes", async () => {
  const wrapper = await mountCommentSection();
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "Draft for discussion one");

  await wrapper.setProps({ discussionId: "discussion-2" });

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  const freshBody = await bodyScreen.findByLabelText(/body/i) as HTMLTextAreaElement;
  expect(freshBody.value).toBe("");
});

test("settles creation before closing the drawer", async () => {
  const refreshSettlement = deferred();
  refresh.mockReturnValueOnce(refreshSettlement.promise);
  const wrapper = await mountCommentSection();
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
});
