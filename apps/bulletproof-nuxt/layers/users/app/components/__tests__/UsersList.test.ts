import { expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { within } from "@testing-library/vue";
import UsersList from "../UsersList.vue";

const { users } = vi.hoisted(() => ({
  users: [
    {
      id: "user-1",
      email: "admin@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      role: "ADMIN",
      bio: "",
      teamId: "team-1",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    },
  ],
}));

vi.mock("~users/app/composables/useUsers", () => ({
  useUsers: () => ({
    data: { data: users },
    isPending: false,
  }),
}));

test("UsersList renders user rows and delete action cell", async () => {
  const wrapper = await mountSuspended(UsersList, {
    global: {
      stubs: {
        DeleteUser: {
          template: "<button>Delete User</button>",
          props: ["id"],
        },
      },
    },
  });

  const screen = within(wrapper.element as HTMLElement);
  const desktopTable = screen.getByRole("table");
  const mobileCards = screen.getByRole("list", { name: "User directory cards" });

  expect(within(desktopTable).getByText("Ada")).toBeTruthy();
  expect(within(desktopTable).getByText("Lovelace")).toBeTruthy();
  expect(within(desktopTable).getByText("admin@example.com")).toBeTruthy();
  expect(within(desktopTable).getByText("Team team-1")).toBeTruthy();
  expect(within(desktopTable).getByText("ADMIN")).toBeTruthy();
  expect(within(desktopTable).getByRole("button", { name: "Delete User" })).toBeTruthy();

  expect(within(mobileCards).getByText("Ada Lovelace")).toBeTruthy();
  expect(within(mobileCards).getByText("admin@example.com")).toBeTruthy();
  expect(within(mobileCards).getByText("team-1")).toBeTruthy();
  expect(within(mobileCards).getByText("ADMIN")).toBeTruthy();
  expect(within(mobileCards).getByRole("button", { name: "Delete User" })).toBeTruthy();
});
