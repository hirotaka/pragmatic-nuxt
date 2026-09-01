import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { cleanup, within } from "@testing-library/vue";
import UsersList from "../UsersList.vue";
import type { User } from "~users/shared/types";

const { queryState, sessionUser } = vi.hoisted(() => ({
  queryState: {
    data: { __v_isRef: true, value: undefined as User[] | undefined },
    error: { __v_isRef: true, value: undefined as Error | undefined },
    status: { __v_isRef: true, value: "success" },
  },
  sessionUser: { __v_isRef: true, value: { id: "current-user" } as { id: string } | null },
}));

const users = [
  {
    id: "current-user",
    email: "admin@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "ADMIN",
    bio: "",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-1",
    email: "member@example.com",
    firstName: "Grace",
    lastName: "Hopper",
    role: "USER",
    bio: "",
    teamId: "team-1",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
] as User[];

vi.mock("~users/app/queries/users", () => ({
  usersQuery: vi.fn(),
}));
vi.mock("@pinia/colada", () => ({
  useQuery: () => queryState,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));
vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: sessionUser }),
}));

beforeEach(() => {
  queryState.data.value = users;
  queryState.error.value = undefined;
  queryState.status.value = "success";
  sessionUser.value = { id: "current-user" };
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const mountUsersList = () => mountSuspended(UsersList, {
  global: {
    stubs: {
      DeleteUser: { template: "<button :aria-label=\"actionLabel\">Delete</button>", props: ["actionLabel"] },
    },
  },
});

test("renders shared populated data and hides current-user delete actions", async () => {
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("table")).toBeTruthy();
  expect(screen.getByText("2 users")).toBeTruthy();
  expect(screen.getByRole("button", { name: /open user actions for member@example.com/i })).toBeTruthy();
  expect(screen.getByText("member@example.com")).toBeTruthy();
});

test("shows loading without presenting an empty directory before data settles", async () => {
  queryState.data.value = undefined;
  queryState.status.value = "pending";
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  const loading = (wrapper.element as HTMLElement).matches("[role=\"status\"]")
    ? wrapper.element as HTMLElement
    : (wrapper.element as HTMLElement).querySelector("[role=\"status\"]");
  expect(loading?.getAttribute("aria-label")).toBe("Loading users");
  expect(screen.queryByText(/no users found/i)).toBeNull();
});

test("preserves existing data during background loading", async () => {
  queryState.status.value = "pending";
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("member@example.com")).toBeTruthy();
  expect(screen.queryByRole("status", { name: "Loading users" })).toBeNull();
});

test("renders a successful empty directory", async () => {
  queryState.data.value = [];
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("No users found")).toBeTruthy();
});
