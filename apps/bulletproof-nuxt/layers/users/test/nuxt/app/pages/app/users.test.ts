import { computed } from "vue";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
} from "@nuxt/test-utils/runtime";
import { setResponseStatus, type H3Event } from "h3";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { clearNuxtData } from "#imports";
import UsersPage from "#layers/users/app/pages/app/users.vue";

const { notification, session } = vi.hoisted(() => ({
  notification: vi.fn(),
  session: {
    value: { user: { id: "current-user", role: "ADMIN" } } as {
      user: { id: string; role: string };
    },
  },
}));
mockNuxtImport("useUserSession", () => () => ({
  user: computed(() => session.value.user),
  loggedIn: computed(() => true),
  fetch: vi.fn(),
}));
vi.mock("vue-sonner", () => ({
  toast: { success: notification, error: notification },
}));

const ada = {
  id: "user-1",
  email: "admin@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  role: "ADMIN",
  bio: "",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};
const owners: { unmount: () => void }[] = [];
let users: (typeof ada)[];
let reads: ReturnType<typeof vi.fn<() => unknown>>;
let deletes: ReturnType<typeof vi.fn<(event: H3Event) => unknown>>;
beforeEach(() => {
  clearNuxtData();
  notification.mockReset();
  session.value = { user: { id: "current-user", role: "ADMIN" } };
  users = [ada];
  reads = vi.fn(() => users);
  deletes = vi.fn(() => new Response(null, { status: 204 }));
  registerEndpoint("/api/users", { method: "GET", handler: () => reads() });
  registerEndpoint("/api/users/user-1", {
    method: "DELETE",
    handler: event => deletes(event),
  });
});
afterEach(() => {
  owners.splice(0).forEach(owner => owner.unmount());
  cleanup();
  document.body.innerHTML = "";
});

async function mountPage() {
  const wrapper = await mountSuspended(UsersPage);
  owners.push(wrapper);
  return within(wrapper.element as HTMLElement);
}
async function openDelete(region: HTMLElement) {
  await userEvent.click(
    within(region).getByRole("button", {
      name: /open user actions for ada lovelace/i,
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
    within(menu).getByRole("menuitem", { name: /delete user/i }),
  );
  const dialog = await within(document.body).findByRole("alertdialog", {
    name: /delete user/i,
  });
  await waitFor(() => expect(menu.getAttribute("data-state")).toBe("closed"));
  return dialog;
}

test("renders the authorized desktop and mobile directory from the users read", async () => {
  const page = await mountPage();
  const table = page.getByRole("table");
  const cards = page.getByRole("list", { name: "User directory cards" });
  expect(within(table).getByText("Ada")).toBeTruthy();
  expect(within(table).getByText("Lovelace")).toBeTruthy();
  expect(within(table).getByText("admin@example.com")).toBeTruthy();
  expect(within(table).getByText("Team team-1")).toBeTruthy();
  expect(within(table).getByText("ADMIN")).toBeTruthy();
  expect(
    within(table).getByRole("button", {
      name: /open user actions for ada lovelace/i,
    }),
  ).toBeTruthy();
  expect(within(cards).getByText("Ada Lovelace")).toBeTruthy();
  expect(within(cards).getByText("admin@example.com")).toBeTruthy();
  expect(within(cards).getByText("team-1")).toBeTruthy();
  expect(within(cards).getByText("ADMIN")).toBeTruthy();
  expect(within(cards).getByRole("button", { name: /open user actions for ada lovelace/i })).toBeTruthy();
  expect(page.getByText("Administrators")).toBeTruthy();
  expect(reads).toHaveBeenCalledOnce();
});

test("shows the successful empty directory response", async () => {
  users = [];
  const page = await mountPage();
  expect(page.getAllByText(/No users found/)).toHaveLength(2);
  expect(page.getByText("No accounts yet")).toBeTruthy();
});

test("hands off from menu to dialog and cancels without deleting", async () => {
  const page = await mountPage();
  const dialog = await openDelete(page.getByRole("table"));
  await userEvent.click(
    within(dialog).getByRole("button", { name: /cancel/i }),
  );
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete user/i,
      }),
    ).toBeNull(),
  );
  expect(deletes).not.toHaveBeenCalled();
});

test("deletes from the mobile directory, closes dialog, and refreshes the owner", async () => {
  deletes.mockImplementationOnce(() => {
    users = [];
    return new Response(null, { status: 204 });
  });
  const page = await mountPage();
  const dialog = await openDelete(
    page.getByRole("list", { name: "User directory cards" }),
  );
  await userEvent.click(
    within(dialog).getByRole("button", { name: /delete user/i }),
  );
  await waitFor(() => expect(deletes).toHaveBeenCalledOnce());
  await waitFor(() => expect(reads.mock.calls.length).toBeGreaterThan(1));
  expect(notification).toHaveBeenCalledWith("User Deleted");
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete user/i,
      }),
    ).toBeNull(),
  );
  await waitFor(() => expect(page.getAllByText("No users found")).toHaveLength(2));
  expect(page.queryByText("Ada Lovelace")).toBeNull();
});

test("keeps failed deletion retryable in the dialog", async () => {
  let attempts = 0;
  deletes.mockImplementation((event) => {
    if (++attempts === 1) {
      setResponseStatus(event, 500);
      return { message: "Delete failed" };
    }
    return new Response(null, { status: 204 });
  });
  const page = await mountPage();
  const dialog = await openDelete(page.getByRole("table"));
  await userEvent.click(
    within(dialog).getByRole("button", { name: /delete user/i }),
  );
  await waitFor(() => expect(attempts).toBe(1));
  await waitFor(() =>
    expect(
      within(dialog)
        .getByRole("button", { name: /delete user/i })
        .hasAttribute("disabled"),
    ).toBe(false),
  );
  expect(reads).toHaveBeenCalledOnce();
  expect(notification).not.toHaveBeenCalledWith("User Deleted");
  await userEvent.click(
    within(dialog).getByRole("button", { name: /delete user/i }),
  );
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
});

test("does not show a successful empty directory before the initial read settles", async () => {
  let finish!: (value: (typeof ada)[]) => void;
  reads.mockImplementationOnce(
    () =>
      new Promise<(typeof ada)[]>((resolve) => {
        finish = resolve;
      }),
  );
  const mounting = mountSuspended(UsersPage, { attachTo: document.body });
  await waitFor(() => expect(reads).toHaveBeenCalledOnce());
  expect(within(document.body).queryByText(/No users found/i)).toBeNull();
  expect(within(document.body).queryByText("Administrators")).toBeNull();
  finish([ada]);
  const wrapper = await mounting;
  expect(within(document.body).getByText("Ada")).toBeTruthy();
  wrapper.unmount();
});

test("closes deletion without waiting for a pending owner refresh", async () => {
  let finishRefresh!: (value: (typeof ada)[]) => void;
  reads
    .mockImplementationOnce(() => [ada])
    .mockImplementationOnce(
      () =>
        new Promise<(typeof ada)[]>((resolve) => {
          finishRefresh = resolve;
        }),
    );
  const page = await mountPage();
  const dialog = await openDelete(page.getByRole("table"));
  await userEvent.click(
    within(dialog).getByRole("button", { name: /delete user/i }),
  );
  await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete user/i,
      }),
    ).toBeNull(),
  );
  finishRefresh([ada]);
});

test("preserves deletion success if the directory refresh reports an error", async () => {
  reads
    .mockImplementationOnce(() => [ada])
    .mockImplementationOnce(() => {
      throw new Error("Users refresh failed");
    });
  const page = await mountPage();
  const dialog = await openDelete(page.getByRole("table"));
  await userEvent.click(
    within(dialog).getByRole("button", { name: /delete user/i }),
  );
  await waitFor(() => expect(reads.mock.calls.length).toBeGreaterThan(1));
  expect(notification).toHaveBeenCalledWith("User Deleted");
  await waitFor(() =>
    expect(
      within(document.body).queryByRole("alertdialog", {
        name: /delete user/i,
      }),
    ).toBeNull(),
  );
});

test("does not refresh a remounted owner after an earlier deletion settles", async () => {
  let finishDelete!: (response: Response) => void;
  deletes.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finishDelete = resolve;
      }),
  );
  const first = await mountSuspended(UsersPage);
  const page = within(first.element as HTMLElement);
  const dialog = await openDelete(page.getByRole("table"));
  await userEvent.click(
    within(dialog).getByRole("button", { name: /delete user/i }),
  );
  await waitFor(() => expect(deletes).toHaveBeenCalledOnce());
  first.unmount();
  clearNuxtData();
  const second = await mountSuspended(UsersPage);
  const readsBeforeSettlement = reads.mock.calls.length;
  finishDelete(new Response(null, { status: 204 }));
  await waitFor(() =>
    expect(notification).toHaveBeenCalledWith("User Deleted"),
  );
  expect(reads).toHaveBeenCalledTimes(readsBeforeSettlement);
  second.unmount();
});
