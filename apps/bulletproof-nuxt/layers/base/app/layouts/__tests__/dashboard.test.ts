import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import DashboardLayout from "../dashboard.vue";

const mountDashboardLayout = (route: string) => mountSuspended(DashboardLayout, {
  route,
  slots: {
    default: "Dashboard content",
  },
  global: {
    stubs: {
      NuxtLink: {
        props: ["to"],
        template: `<a :href="to"><slot /></a>`,
      },
    },
  },
});

const { canAccessAdmin, logoutMutate, mockUser } = vi.hoisted(() => ({
  canAccessAdmin: { value: true },
  logoutMutate: vi.fn(),
  mockUser: {
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "ADMIN",
    bio: null,
    teamId: "team-1",
    createdAt: new Date(),
  },
}));

vi.mock("#layers/auth/app/composables/useAuthorization", () => ({
  ROLES: { ADMIN: "ADMIN" },
  useAuthorization: () => ({
    checkAccess: () => canAccessAdmin.value,
  }),
}));

vi.mock("#layers/auth/app/composables/useLogout", () => ({
  useLogout: () => ({
    mutate: logoutMutate,
  }),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user: mockUser,
  }),
}));

beforeEach(() => {
  canAccessAdmin.value = true;
  logoutMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
  vi.unstubAllGlobals();
});

test("dashboard layout renders role-aware primary navigation", async () => {
  const wrapper = await mountDashboardLayout("/app/discussions");

  const screen = within(wrapper.element as HTMLElement);
  const primaryNav = screen.getByRole("navigation", { name: /primary navigation/i });
  const primaryScreen = within(primaryNav);

  expect(primaryScreen.getByRole("link", { name: /dashboard/i })).toBeTruthy();
  expect(primaryScreen.getByRole("link", { name: /discussions/i })).toBeTruthy();
  expect(primaryScreen.getByRole("link", { name: /users/i })).toBeTruthy();
  expect(screen.getByText("Dashboard content")).toBeTruthy();
});

test("dashboard layout hides admin navigation for non-admin users", async () => {
  canAccessAdmin.value = false;

  const wrapper = await mountDashboardLayout("/app");

  const screen = within(wrapper.element as HTMLElement);
  const primaryNav = screen.getByRole("navigation", { name: /primary navigation/i });
  const primaryScreen = within(primaryNav);

  expect(primaryScreen.getByRole("link", { name: /dashboard/i })).toBeTruthy();
  expect(primaryScreen.getByRole("link", { name: /discussions/i })).toBeTruthy();
  expect(primaryScreen.queryByRole("link", { name: /users/i })).toBeNull();
});

test("dashboard layout exposes profile menu trigger", async () => {
  const wrapper = await mountDashboardLayout("/app");
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("button", { name: /open user menu/i })).toBeTruthy();
});

test("dashboard layout opens account menu with user identity and actions", async () => {
  const wrapper = await mountDashboardLayout("/app");
  const screen = within(wrapper.element as HTMLElement);

  await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));

  const menu = await screen.findByRole("menu");
  const menuScreen = within(menu);

  expect(menuScreen.getByText("Ada Lovelace")).toBeTruthy();
  expect(menuScreen.getByText("ada@example.com")).toBeTruthy();
  expect(menuScreen.getByRole("menuitem", { name: /your profile/i })).toBeTruthy();
  expect(menuScreen.getByRole("menuitem", { name: /sign out/i })).toBeTruthy();
});

test("dashboard layout opens mobile navigation and closes it after route click", async () => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  const wrapper = await mountDashboardLayout("/app");
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /toggle menu/i }));

  const mobileNav = await bodyScreen.findByRole("navigation", { name: /mobile navigation/i });
  const mobileScreen = within(mobileNav);
  await userEvent.click(mobileScreen.getByRole("link", { name: /discussions/i }));

  await waitFor(() => {
    expect(bodyScreen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
  });
});

test("dashboard layout collapses desktop sidebar without opening mobile navigation", async () => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  const wrapper = await mountDashboardLayout("/app");
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(wrapper.element.getAttribute("data-sidebar-open")).toBe("true");

  await userEvent.click(screen.getByRole("button", { name: /toggle menu/i }));

  await waitFor(() => {
    expect(wrapper.element.getAttribute("data-sidebar-open")).toBe("false");
  });
  expect(bodyScreen.queryByRole("navigation", { name: /mobile navigation/i })).toBeNull();
});
