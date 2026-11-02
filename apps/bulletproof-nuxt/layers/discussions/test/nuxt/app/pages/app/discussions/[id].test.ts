import { computed, reactive } from "vue";
import { afterEach, beforeEach, expect, expectTypeOf, test, vi } from "vitest";
import type { useCommentList } from "#layers/discussions/app/composables/useCommentList";
import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
} from "@nuxt/test-utils/runtime";
import { getQuery, readBody, setResponseStatus, type H3Event } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { clearNuxtData } from "#imports";
import { formatDate } from "~~/app/utils/format";
import DiscussionPage from "#layers/discussions/app/pages/app/discussions/[id].vue";

const { notify, route, session } = vi.hoisted(() => ({
  notify: vi.fn(),
  route: { params: { id: "discussion-1" }, query: {} },
  session: { value: { user: { id: "user-1", role: "ADMIN" } } },
}));
mockNuxtImport("useRoute", () => () => reactive(route));
mockNuxtImport("useUserSession", () => () => ({
  user: computed(() => session.value.user),
  loggedIn: computed(() => true),
  fetch: vi.fn(),
}));
vi.mock("vue-sonner", () => ({ toast: { success: notify, error: notify } }));
const discussion = {
  id: "discussion-1",
  title: "Test Discussion",
  body: "This is a test discussion body",
  authorId: "user-1",
  teamId: "team-1",
  createdAt: "2026-07-28T00:00:00.000Z",
  updatedAt: "2026-07-28T00:00:00.000Z",
  author: { id: "user-1", firstName: "Test", lastName: "User" },
};
const comment = {
  id: "comment-1",
  body: "Existing comment",
  discussionId: "discussion-1",
  authorId: "user-1",
  author: { id: "user-1", firstName: "Test", lastName: "User" },
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
};
let detail: typeof discussion | undefined;
let comments: (typeof comment)[];
let hasMore: boolean;
let reads: ReturnType<typeof vi.fn<() => unknown>>;
let commentReads: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let updates: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let creates: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let commentDeletes: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let commentResponse: (page: number) => unknown;
const owners: { unmount: () => void }[] = [];
const pageResult = (items: (typeof comment)[], page = 1) => ({
  items,
  meta: {
    page,
    limit: 10,
    total: items.length,
    totalPages: hasMore ? 2 : 1,
    hasMore: hasMore && page === 1,
  },
});
beforeEach(() => {
  clearNuxtData();
  notify.mockReset();
  route.params.id = "discussion-1";
  detail = discussion;
  comments = [comment];
  hasMore = false;
  reads = vi.fn(() => detail);
  commentResponse = page =>
    pageResult(
      page === 1
        ? comments
        : [{ ...comment, id: "comment-2", body: "Next comment" }],
      page,
    );
  commentReads = vi.fn(event =>
    commentResponse(
      Number(
        new URL(event.node.req.url!, "http://localhost").searchParams.get(
          "page",
        ) || 1,
      ),
    ),
  );
  updates = vi.fn(() => new Response(null, { status: 204 }));
  creates = vi.fn(() => new Response(null, { status: 204 }));
  commentDeletes = vi.fn(() => new Response(null, { status: 204 }));
  registerEndpoint("/api/discussions/discussion-1", {
    method: "GET",
    handler: () => reads(),
  });
  registerEndpoint("/api/discussions/discussion-1", {
    method: "PATCH",
    handler: event => updates(event),
  });
  registerEndpoint("/api/discussions/discussion-1/comments", {
    method: "GET",
    handler: event => commentReads(event),
  });
  registerEndpoint("/api/discussions/discussion-1/comments", {
    method: "POST",
    handler: event => creates(event),
  });
  registerEndpoint("/api/discussions/discussion-1/comments/comment-1", {
    method: "DELETE",
    handler: event => commentDeletes(event),
  });
});
afterEach(() => {
  owners.splice(0).forEach(owner => owner.unmount());
  cleanup();
  document.body.innerHTML = "";
});
async function mountPage() {
  const wrapper = await mountSuspended(DiscussionPage);
  owners.push(wrapper);
  return within(wrapper.element as HTMLElement);
}
async function drawer(page: ReturnType<typeof within>, title: string) {
  const trigger = page.getByRole("button", { name: title });
  expect(trigger.querySelector("svg")).toBeTruthy();
  await userEvent.click(trigger);
  return within(
    await within(document.body).findByRole("dialog", { name: title }),
  );
}
async function commentDialog(page: ReturnType<typeof within>) {
  await userEvent.click(
    page.getByRole("button", { name: /open comment actions for comment 1/i }),
  );
  let menu!: HTMLElement;
  await waitFor(() => {
    menu = document.body.querySelector<HTMLElement>(
      "[role=menu][data-state=open]",
    )!;
    expect(menu).toBeTruthy();
  });
  await userEvent.click(
    within(menu).getByRole("menuitem", { name: /delete comment/i }),
  );
  const dialog = await within(document.body).findByRole("alertdialog", {
    name: /delete comment/i,
  });
  await waitFor(() => expect(menu.getAttribute("data-state")).toBe("closed"));
  return within(dialog);
}

test("reads the route detail and composes real discussion and comment views", async () => {
  const page = await mountPage();
  expect(reads).toHaveBeenCalled();
  expect(page.getByText("Test Discussion")).toBeTruthy();
  expect(page.getByText(formatDate(discussion.createdAt))).toBeTruthy();
  expect(page.getAllByText(/by Test User/).length).toBeGreaterThan(0);
  expect(page.getByText("This is a test discussion body")).toBeTruthy();
  expect(page.getByText("Existing comment")).toBeTruthy();
  expect(commentReads).toHaveBeenCalled();
});

test("does not compose detail children before discussion data is available", async () => {
  detail = undefined;
  const page = await mountPage();
  expect(page.queryByRole("button", { name: "Update Discussion" })).toBeNull();
  expect(page.queryByRole("button", { name: "Create Comment" })).toBeNull();
  expect(commentReads).not.toHaveBeenCalled();
});

test("preloads update data, retries a failed mutation, and refreshes before closing", async () => {
  let attempts = 0;
  updates.mockImplementation(async (event) => {
    if (++attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Update failed" };
    }
    expect(await readBody(event)).toMatchObject({
      title: "Updated title",
      body: discussion.body,
    });
    detail = { ...discussion, title: "Updated title" };
    return new Response(null, { status: 204 });
  });
  const page = await mountPage();
  const form = await drawer(page, "Update Discussion");
  const title = form.getByLabelText("Title") as HTMLInputElement;
  expect(title.value).toBe(discussion.title);
  expect((form.getByLabelText("Body") as HTMLTextAreaElement).value).toBe(
    discussion.body,
  );
  await userEvent.clear(title);
  await userEvent.type(title, "Updated title");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() => expect(title.hasAttribute("disabled")).toBe(false));
  expect(form.getByLabelText("Title")).toBeTruthy();
  expect(notify).not.toHaveBeenCalledWith("Discussion Updated");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Update Discussion",
      }),
    ).toBeNull(),
  );
  expect(notify).toHaveBeenCalledWith("Discussion Updated");
  expect(notify.mock.calls.filter(([message]) => message === "Discussion Updated")).toHaveLength(1);
  expect(page.getByRole("heading", { name: "Updated title" })).toBeTruthy();
});

test("shows successful empty comments after the initial read settles", async () => {
  comments = [];
  const page = await mountPage();
  expect(page.getByRole("heading", { name: "No Comments Found" })).toBeTruthy();
});

test("loads comment pages with the configured page size and stops at the final response", async () => {
  commentResponse = page => ({
    items: [page === 1
      ? comment
      : {
          ...comment,
          id: `comment-${page}`,
          body: page === 2 ? "Next comment" : "Last comment",
        }],
    meta: { page, limit: 10, total: 21, totalPages: 3, hasMore: page < 3 },
  });
  const page = await mountPage();
  await userEvent.click(page.getByRole("button", { name: "Load More Comments" }));
  await waitFor(() => expect(page.getByText("Next comment")).toBeTruthy());
  expect(page.getByText("Existing comment")).toBeTruthy();

  await userEvent.click(page.getByRole("button", { name: "Load More Comments" }));
  await waitFor(() => expect(page.getByText("Last comment")).toBeTruthy());
  expect(page.getByText("Existing comment")).toBeTruthy();
  expect(page.getByText("Next comment")).toBeTruthy();
  expect(page.queryByRole("button", { name: "Load More Comments" })).toBeNull();
  expect(commentReads.mock.calls.map(([event]) => getQuery(event))).toEqual([
    { page: "1", limit: "10" },
    { page: "2", limit: "10" },
    { page: "3", limit: "10" },
  ]);
  type Item = NonNullable<Awaited<ReturnType<typeof useCommentList>>["data"]["value"]>["pages"][number]["items"][number];
  expectTypeOf<Item["body"]>().toEqualTypeOf<string>();
});

test("creates a comment, retries after failure, and closes after the read refresh", async () => {
  let attempts = 0;
  creates.mockImplementation(async (event) => {
    if (++attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Create failed" };
    }
    expect(await readBody(event)).toMatchObject({ body: "New comment" });
    comments = [...comments, { ...comment, id: "created-comment", body: "New comment" }];
    return new Response(null, { status: 204 });
  });
  const page = await mountPage();
  const form = await drawer(page, "Create Comment");
  await userEvent.type(form.getByLabelText("Body"), "New comment");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() =>
    expect(form.getByLabelText("Body").hasAttribute("disabled")).toBe(false),
  );
  expect((form.getByLabelText("Body") as HTMLTextAreaElement).value).toBe(
    "New comment",
  );
  expect(notify).not.toHaveBeenCalledWith("Comment Created");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() =>
    expect(commentReads.mock.calls.length).toBeGreaterThan(1),
  );
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", { name: "Create Comment" }),
    ).toBeNull(),
  );
  expect(notify).toHaveBeenCalledWith("Comment Created");
  expect(page.getByText("New comment")).toBeTruthy();
});

test("hands off comment deletion to the dialog and cancel preserves the comment", async () => {
  const page = await mountPage();
  const dialog = await commentDialog(page);
  await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete comment/i,
      }),
    ).toBeNull(),
  );
  expect(commentDeletes).not.toHaveBeenCalled();
  expect(page.getByText("Existing comment")).toBeTruthy();
});

test("failed comment deletion keeps dialog retryable; success refreshes comments", async () => {
  let attempts = 0;
  commentDeletes.mockImplementation((event) => {
    if (++attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Delete failed" };
    }
    comments = [];
    return new Response(null, { status: 204 });
  });
  const page = await mountPage();
  const dialog = await commentDialog(page);
  await userEvent.click(
    dialog.getByRole("button", { name: /delete comment/i }),
  );
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() =>
    expect(
      dialog
        .getByRole("button", { name: /delete comment/i })
        .hasAttribute("disabled"),
    ).toBe(false),
  );
  expect(
    dialog.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
  ).toBe(false);
  await userEvent.click(
    dialog.getByRole("button", { name: /delete comment/i }),
  );
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() =>
    expect(commentReads.mock.calls.length).toBeGreaterThan(1),
  );
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete comment/i,
      }),
    ).toBeNull(),
  );
  expect(notify).toHaveBeenCalledWith("Comment Deleted");
  expect(page.getByRole("heading", { name: "No Comments Found" })).toBeTruthy();
  expect(page.queryByText("Existing comment")).toBeNull();
});

test("does not render a successful empty comment state before its initial read settles", async () => {
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  commentResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const mounting = mountSuspended(DiscussionPage, { attachTo: document.body });
  await waitFor(() => expect(commentReads).toHaveBeenCalled());
  expect(
    within(document.body).queryByRole("heading", { name: "No Comments Found" }),
  ).toBeNull();
  finish(pageResult([comment]));
  const wrapper = await mounting;
  owners.push(wrapper);
  expect(within(document.body).getByText("Existing comment")).toBeTruthy();
});

test("keeps a loaded comment visible and blocks duplicate pagination while the next page settles", async () => {
  hasMore = true;
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  commentResponse = page =>
    page === 1
      ? pageResult([comment])
      : new Promise((resolve) => {
          finish = resolve;
        });
  const page = await mountPage();
  const load = page.getByRole("button", { name: "Load More Comments" });
  await userEvent.click(load);
  await waitFor(() =>
    expect(commentReads.mock.calls.length).toBeGreaterThan(1),
  );
  expect(page.getByText("Existing comment")).toBeTruthy();
  expect(load.hasAttribute("disabled")).toBe(true);
  expect(load.textContent).not.toContain("Load More Comments");
  const count = commentReads.mock.calls.length;
  await userEvent.click(load);
  expect(commentReads).toHaveBeenCalledTimes(count);
  finish(
    pageResult([{ ...comment, id: "comment-2", body: "Next comment" }], 2),
  );
  await waitFor(() => expect(page.getByText("Next comment")).toBeTruthy());
});

test("validates a comment draft before calling the create endpoint", async () => {
  const form = await drawer(await mountPage(), "Create Comment");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(form.getByLabelText("Body").getAttribute("aria-invalid")).toBe(
      "true",
    ),
  );
  expect(creates).not.toHaveBeenCalled();
});

test("keeps the comment draft open until its successful refresh settles", async () => {
  const page = await mountPage();
  const form = await drawer(page, "Create Comment");
  await userEvent.type(form.getByLabelText("Body"), "New comment");
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  commentResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(creates).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(commentReads.mock.calls.length).toBeGreaterThan(1),
  );
  expect(
    within(document.body).getByRole("dialog", { name: "Create Comment" }),
  ).toBeTruthy();
  finish(pageResult([comment]));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", { name: "Create Comment" }),
    ).toBeNull(),
  );
});

test("recreates the comment scope when the routed discussion identity changes", async () => {
  hasMore = true;
  const page = await mountPage();
  await userEvent.click(page.getByRole("button", { name: "Load More Comments" }));
  await waitFor(() => expect(page.getByText("Next comment")).toBeTruthy());
  const draft = await drawer(page, "Create Comment");
  await userEvent.type(
    draft.getByLabelText("Body"),
    "Draft for discussion one",
  );
  const other = {
    ...discussion,
    id: "discussion-2",
    title: "Second discussion",
  };
  registerEndpoint("/api/discussions/discussion-2", {
    method: "GET",
    handler: () => other,
  });
  const otherComments = vi.fn(() => pageResult([{
    ...comment, id: "other-comment", discussionId: other.id, body: "Other discussion comment",
  }]));
  registerEndpoint("/api/discussions/discussion-2/comments", {
    method: "GET",
    handler: otherComments,
  });
  reactive(route).params.id = "discussion-2";
  await waitFor(() => expect(page.getByText("Second discussion")).toBeTruthy());
  await waitFor(() => expect(page.getByText("Other discussion comment")).toBeTruthy());
  expect(page.queryByText("Existing comment")).toBeNull();
  expect(page.queryByText("Next comment")).toBeNull();
  expect(otherComments).toHaveBeenCalledOnce();
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", { name: "Create Comment" }),
    ).toBeNull(),
  );
  await page.findByRole("button", { name: "Create Comment" });
  const fresh = await drawer(page, "Create Comment");
  expect((fresh.getByLabelText("Body") as HTMLTextAreaElement).value).toBe("");
});

test("retains the existing comment during a page-one refresh", async () => {
  const page = await mountPage();
  const form = await drawer(page, "Create Comment");
  await userEvent.type(form.getByLabelText("Body"), "New comment");
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  commentResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(commentReads.mock.calls.length).toBeGreaterThan(1),
  );
  expect(page.getByText("Existing comment")).toBeTruthy();
  expect(page.queryByRole("heading", { name: "No Comments Found" })).toBeNull();
  finish(pageResult([comment]));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", { name: "Create Comment" }),
    ).toBeNull(),
  );
});

test("waits for detail refresh before closing the update drawer", async () => {
  const page = await mountPage();
  const form = await drawer(page, "Update Discussion");
  let finish!: (response: typeof discussion) => void;
  reads.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  expect(
    within(document.body).getByRole("dialog", { name: "Update Discussion" }),
  ).toBeTruthy();
  finish(discussion);
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Update Discussion",
      }),
    ).toBeNull(),
  );
});

test("does not compose detail children while the initial route read is pending", async () => {
  let finish!: (response: typeof discussion) => void;
  reads.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const mounting = mountSuspended(DiscussionPage, { attachTo: document.body });
  await waitFor(() => expect(reads).toHaveBeenCalledOnce());
  expect(
    within(document.body).queryByRole("button", { name: "Create Comment" }),
  ).toBeNull();
  expect(
    within(document.body).queryByRole("button", { name: "Update Discussion" }),
  ).toBeNull();
  finish(discussion);
  const wrapper = await mounting;
  owners.push(wrapper);
  expect(
    within(document.body).getByRole("button", {
      name: "Create Comment",
    }),
  ).toBeTruthy();
});
