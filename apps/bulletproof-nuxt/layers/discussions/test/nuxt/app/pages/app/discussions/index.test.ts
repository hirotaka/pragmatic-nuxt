import { computed } from "vue";
import { afterEach, beforeEach, expect, expectTypeOf, test, vi } from "vitest";
import type { useDiscussionList } from "#layers/discussions/app/composables/useDiscussionList";
import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
} from "@nuxt/test-utils/runtime";
import { getQuery, readBody, setResponseStatus, type H3Event } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { clearNuxtData, useRouter } from "#imports";
import DiscussionsPage from "#layers/discussions/app/pages/app/discussions/index.vue";

const { notify, session } = vi.hoisted(() => ({
  notify: vi.fn(),
  session: { value: { user: { id: "user-1", role: "ADMIN" } } },
}));
mockNuxtImport("useUserSession", () => () => ({
  user: computed(() => session.value.user),
  loggedIn: computed(() => true),
  fetch: vi.fn(),
}));
vi.mock("vue-sonner", () => ({ toast: { success: notify, error: notify } }));
const discussion = {
  id: "discussion-1",
  title: "Existing title",
  body: "Existing body",
  authorId: "user-1",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  author: { id: "user-1", firstName: "Test", lastName: "User" },
};
const owners: { unmount: () => void }[] = [];
let items: (typeof discussion)[];
let reads: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let creates: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let deletes: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
let readResponse: (event: H3Event) => Promise<unknown> | unknown;
const pageResult = () => ({
  items,
  meta: {
    page: 1,
    limit: 10,
    total: items.length,
    totalPages: 1,
    hasMore: false,
  },
});
beforeEach(() => {
  clearNuxtData();
  notify.mockReset();
  items = [discussion];
  readResponse = () => pageResult();
  reads = vi.fn((event: H3Event) => readResponse(event));
  creates = vi.fn(() => new Response(null, { status: 204 }));
  deletes = vi.fn(() => new Response(null, { status: 204 }));
  registerEndpoint("/api/discussions", {
    method: "GET",
    handler: event => reads(event),
  });
  registerEndpoint("/api/discussions", {
    method: "POST",
    handler: event => creates(event),
  });
  registerEndpoint("/api/discussions/discussion-1", {
    method: "DELETE",
    handler: event => deletes(event),
  });
});
afterEach(() => {
  owners.splice(0).forEach(owner => owner.unmount());
  cleanup();
  document.body.innerHTML = "";
});
async function mountPage(route = "/app/discussions") {
  const wrapper = await mountSuspended(DiscussionsPage, { route });
  owners.push(wrapper);
  return within(wrapper.element as HTMLElement);
}
async function createDrawer(page: ReturnType<typeof within>) {
  const trigger = page.getByRole("button", { name: "Create Discussion" });
  expect(trigger.querySelector("svg")).toBeTruthy();
  await userEvent.click(trigger);
  return within(
    await within(document.body).findByRole("dialog", {
      name: "Create Discussion",
    }),
  );
}
async function deleteDialog(page: ReturnType<typeof within>) {
  await userEvent.click(
    page.getByRole("button", {
      name: /open discussion actions for existing title/i,
    }),
  );
  let menu!: HTMLElement;
  await waitFor(() => {
    menu = document.body.querySelector<HTMLElement>(
      "[role=menu][data-state=open]",
    )!;
    expect(menu).toBeTruthy();
  });
  await userEvent.click(
    within(menu).getByRole("menuitem", { name: /delete discussion/i }),
  );
  const dialog = await within(document.body).findByRole("alertdialog", {
    name: /delete discussion/i,
  });
  await waitFor(() => expect(menu.getAttribute("data-state")).toBe("closed"));
  return within(dialog);
}

test("renders the real discussion table and its settled empty state", async () => {
  items = [discussion, { ...discussion, id: "discussion-2", title: "Second discussion" }];
  const page = await mountPage();
  expect(page.getByText("Existing title")).toBeTruthy();
  expect(page.getByText("Second discussion")).toBeTruthy();
  expect(page.getAllByRole("link", { name: "View" }).map(link => link.getAttribute("href"))).toEqual([
    "/app/discussions/discussion-1",
    "/app/discussions/discussion-2",
  ]);
  expect(reads).toHaveBeenCalledOnce();
  items = [];
  // Dispose the first page before a fresh owner reads the empty response.
  owners.splice(0).forEach(owner => owner.unmount());
  clearNuxtData();
  const emptyPage = await mountPage();
  expect(emptyPage.getByText("No Entries Found")).toBeTruthy();
});

test("reads the URL page with the discussion endpoint, page size and inferred item type", async () => {
  readResponse = () => ({
    ...pageResult(),
    meta: { ...pageResult().meta, page: 3, totalPages: 3 },
  });
  const page = await mountPage("/app/discussions?page=3");

  expect(page.getByText("Existing title")).toBeTruthy();
  expect(reads.mock.calls.map(([event]) => getQuery(event))).toEqual([
    { page: "3", limit: "10" },
  ]);
  type Item = NonNullable<Awaited<ReturnType<typeof useDiscussionList>>["data"]["value"]>["items"][number];
  expectTypeOf<Item["title"]>().toEqualTypeOf<string>();
  expectTypeOf<Item["id"]>().toEqualTypeOf<string>();
});

test.each([
  { name: "keeps the current page when rows remain", empty: false },
  { name: "returns to the previous page when the last row is deleted", empty: true },
])("$name after deleting through the page", async ({ empty }) => {
  const remaining = { ...discussion, id: "discussion-2", title: "Remaining discussion" };
  const previous = { ...discussion, id: "previous-discussion", title: "Previous page discussion" };
  readResponse = (event) => {
    const page = Number(getQuery(event).page || 1);
    return {
      items: page === 2 ? items : [previous],
      meta: { page, limit: 10, total: 11, totalPages: 2, hasMore: page < 2 },
    };
  };
  deletes.mockImplementation(() => {
    items = empty ? [] : [remaining];
    return new Response(null, { status: 204 });
  });
  const page = await mountPage("/app/discussions?page=2");
  const dialog = await deleteDialog(page);
  await userEvent.click(dialog.getByRole("button", { name: "Delete" }));

  await waitFor(() => expect(
    within(document.body).queryByRole("alertdialog", { name: /delete discussion/i }),
  ).toBeNull());
  await waitFor(() => expect(useRouter().currentRoute.value.query.page).toBe(empty ? undefined : "2"));
  await waitFor(() => expect(page.getByText(empty ? previous.title : remaining.title)).toBeTruthy());
  expect(reads.mock.calls.map(([event]) => Number(getQuery(event).page || 1))).toEqual(
    empty ? [2, 2, 1] : [2, 2],
  );
});

test("blocks invalid creation, sends valid form data, and closes only after the list refresh", async () => {
  let capturedBody: Record<string, unknown> | undefined;
  creates.mockImplementation(async (event) => {
    capturedBody = await readBody(event);
    items = [...items, { ...discussion, id: "created-discussion", title: "New discussion", body: "Discussion body" }];
    return new Response(null, { status: 204 });
  });
  const page = await mountPage();
  const table = page.getByRole("table");
  const drawer = await createDrawer(page);
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(drawer.getAllByRole("alert")).toHaveLength(2));
  expect(drawer.getByLabelText("Title").getAttribute("aria-invalid")).toBe("true");
  expect(drawer.getByLabelText("Body").getAttribute("aria-invalid")).toBe("true");
  for (const error of drawer.getAllByRole("alert")) {
    expect(error.textContent?.trim()).not.toBe("");
  }
  expect(creates).not.toHaveBeenCalled();
  await userEvent.type(drawer.getByLabelText("Title"), "New discussion");
  await userEvent.type(drawer.getByLabelText("Body"), "Discussion body");
  await waitFor(() => expect(drawer.queryAllByRole("alert")).toHaveLength(0));
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() =>
    expect(capturedBody).toMatchObject({
      title: "New discussion",
      body: "Discussion body",
    }),
  );
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  expect(page.getByRole("table")).toBe(table);
  expect(notify).toHaveBeenCalledWith("Discussion Created");
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Create Discussion",
      }),
    ).toBeNull(),
  );
  expect(page.getByText("New discussion")).toBeTruthy();
});

test("prevents duplicate creation while pending and waits for refresh before closing", async () => {
  let finishCreate!: (response: Response) => void;
  creates.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finishCreate = resolve;
      }),
  );
  const page = await mountPage();
  const drawer = await createDrawer(page);
  await userEvent.type(drawer.getByLabelText("Title"), "New discussion");
  await userEvent.type(drawer.getByLabelText("Body"), "Discussion body");
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(creates).toHaveBeenCalledOnce());
  expect(drawer.getByLabelText("Title").hasAttribute("disabled")).toBe(true);
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  expect(creates).toHaveBeenCalledOnce();
  let finishRefresh!: (response: unknown) => void;
  readResponse = () =>
    new Promise((resolve) => {
      finishRefresh = resolve;
    });
  finishCreate(new Response(null, { status: 204 }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  expect(
    within(document.body).getByRole("dialog", { name: "Create Discussion" }),
  ).toBeTruthy();
  finishRefresh(pageResult());
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Create Discussion",
      }),
    ).toBeNull(),
  );
});

test("keeps creation draft retryable after failed mutation", async () => {
  let attempts = 0;
  creates.mockImplementation((event) => {
    if (++attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Create failed" };
    }
    return new Response(null, { status: 204 });
  });
  const drawer = await createDrawer(await mountPage());
  await userEvent.type(drawer.getByLabelText("Title"), "New discussion");
  await userEvent.type(drawer.getByLabelText("Body"), "Discussion body");
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() =>
    expect(drawer.getByLabelText("Title").hasAttribute("disabled")).toBe(false),
  );
  expect((drawer.getByLabelText("Title") as HTMLInputElement).value).toBe(
    "New discussion",
  );
  expect(notify).not.toHaveBeenCalledWith("Discussion Created");
  await userEvent.click(drawer.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(attempts).toBe(2));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Create Discussion",
      }),
    ).toBeNull(),
  );
});

test("hands off deletion from the dropdown, then cancel leaves the list intact", async () => {
  const page = await mountPage();
  const dialog = await deleteDialog(page);
  await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete discussion/i,
      }),
    ).toBeNull(),
  );
  expect(deletes).not.toHaveBeenCalled();
  expect(page.getByText("Existing title")).toBeTruthy();
});

test("deletion stays pending until transport settles, then refreshes the page", async () => {
  let finish!: (response: Response) => void;
  deletes.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
  );
  const page = await mountPage();
  const dialog = await deleteDialog(page);
  await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deletes).toHaveBeenCalledOnce());
  expect(
    dialog.getByRole("button", { name: "Delete" }).getAttribute("aria-busy"),
  ).toBe("true");
  expect(
    dialog.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
  ).toBe(true);
  await userEvent.keyboard("{Escape}");
  expect(
    within(document.body).getByRole("alertdialog", {
      name: /delete discussion/i,
    }),
  ).toBeTruthy();
  finish(new Response(null, { status: 204 }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete discussion/i,
      }),
    ).toBeNull(),
  );
  expect(notify).toHaveBeenCalledWith("Discussion Deleted");
});

test("failed deletion leaves controls available for cancellation", async () => {
  deletes.mockImplementation((event) => {
    setResponseStatus(event, 500);
    return { message: "Delete failed" };
  });
  const page = await mountPage();
  const dialog = await deleteDialog(page);
  await userEvent.click(dialog.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deletes).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(
      dialog.getByRole("button", { name: "Cancel" }).hasAttribute("disabled"),
    ).toBe(false),
  );
  expect(reads).toHaveBeenCalledOnce();
  await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete discussion/i,
      }),
    ).toBeNull(),
  );
});

test("does not show successful empty discussions while the first read is pending", async () => {
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  readResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const mounting = mountSuspended(DiscussionsPage, { attachTo: document.body });
  await waitFor(() => expect(reads).toHaveBeenCalled());
  expect(within(document.body).queryByText("No Entries Found")).toBeNull();
  finish(pageResult());
  const wrapper = await mounting;
  owners.push(wrapper);
  expect(within(document.body).getByText("Existing title")).toBeTruthy();
});

test("retains the fetched table and reserved refresh message while a new read is pending", async () => {
  const page = await mountPage();
  const table = page.getByRole("table");
  const message = page.getByText("", { selector: "[aria-live='polite']" });
  expect(message.classList.contains("min-h-5")).toBe(true);
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  readResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const form = await createDrawer(page);
  await userEvent.type(form.getByLabelText("Title"), "New discussion");
  await userEvent.type(form.getByLabelText("Body"), "Discussion body");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  expect(page.getByRole("table")).toBe(table);
  expect(page.getByText("Existing title")).toBeTruthy();
  expect(message.textContent).toContain("Refreshing discussions...");
  finish(pageResult());
  await waitFor(() => expect(message.textContent).toBe(""));
  expect(page.getByRole("table")).toBe(table);
});

test("closes the create drawer after a failed list refresh without undoing creation", async () => {
  readResponse = () =>
    reads.mock.calls.length > 1
      ? Promise.reject(new Error("Refresh failed"))
      : pageResult();
  const form = await createDrawer(await mountPage());
  await userEvent.type(form.getByLabelText("Title"), "New discussion");
  await userEvent.type(form.getByLabelText("Body"), "Discussion body");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(creates).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Create Discussion",
      }),
    ).toBeNull(),
  );
  expect(notify).toHaveBeenCalledWith("Discussion Created");
});

test("selects a discussion page through URL navigation and requests its rows", async () => {
  readResponse = (event) => {
    const page = Number(getQuery(event).page || 1);
    return {
      items: [{ ...discussion, title: page === 1 ? discussion.title : "Second page discussion" }],
      meta: { ...pageResult().meta, page, totalPages: 2, hasMore: page < 2 },
    };
  };
  const page = await mountPage();
  const next = page.getByRole("button", { name: /next page/i });
  await userEvent.click(next);
  await waitFor(() => expect(page.getByText("Second page discussion")).toBeTruthy());
  expect(useRouter().currentRoute.value.query.page).toBe("2");
  expect(reads.mock.calls.map(([event]) => getQuery(event))).toEqual([
    { page: "1", limit: "10" },
    { page: "2", limit: "10" },
  ]);
});

test("keeps the fetched empty queue mounted during refresh instead of returning to initial pending", async () => {
  items = [];
  const page = await mountPage();
  const empty = page.getByText("No Entries Found");
  let finish!: (response: ReturnType<typeof pageResult>) => void;
  readResponse = () =>
    new Promise((resolve) => {
      finish = resolve;
    });
  const form = await createDrawer(page);
  await userEvent.type(form.getByLabelText("Title"), "New discussion");
  await userEvent.type(form.getByLabelText("Body"), "Discussion body");
  await userEvent.click(form.getByRole("button", { name: "Submit" }));
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  expect(page.getByText("No Entries Found")).toBe(empty);
  expect(page.getByText("Refreshing discussions...")).toBeTruthy();
  finish(pageResult());
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("dialog", {
        name: "Create Discussion",
      }),
    ).toBeNull(),
  );
});
