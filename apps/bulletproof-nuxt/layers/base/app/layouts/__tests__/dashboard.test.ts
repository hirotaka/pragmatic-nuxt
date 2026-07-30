import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import DashboardLayout from "../dashboard.vue";

const mountDashboardLayout = (route: string) => {
  mockRoute.path = route;
  mockRoute.fullPath = route;

  return mountSuspended(DashboardLayout, {
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
};

const { addNotification, canAccessAdmin, clearSession, mockRoute, mockUser, routerPush } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  canAccessAdmin: { value: true },
  clearSession: vi.fn(),
  mockRoute: {
    path: "/app",
    fullPath: "/app",
  },
  mockUser: {
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "ADMIN",
    bio: null,
    teamId: "team-1",
    createdAt: "2026-07-10T00:00:00.000Z",
  },
  routerPush: vi.fn(),
}));

mockNuxtImport("useRoute", () => () => mockRoute);
mockNuxtImport("useRouter", () => () => ({
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  beforeResolve: vi.fn(),
  push: routerPush,
  replace: vi.fn(),
}));

vi.mock("#layers/auth/app/composables/useAuthorization", () => ({
  ROLES: { ADMIN: "ADMIN" },
  useAuthorization: () => ({
    checkAccess: () => canAccessAdmin.value,
  }),
}));

mockNuxtImport("useUserSession", () => () => ({ clear: clearSession }));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user: mockUser,
  }),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

beforeEach(() => {
  canAccessAdmin.value = true;
  addNotification.mockReset();
  clearSession.mockReset().mockResolvedValue(undefined);
  routerPush.mockReset().mockResolvedValue(undefined);
  mockRoute.path = "/app";
  mockRoute.fullPath = "/app";
});

function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

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

test("dashboard layout logs out before redirecting to login", async () => {
  const logoutDone = deferred();
  clearSession.mockReturnValueOnce(logoutDone.promise);
  const wrapper = await mountDashboardLayout("/app/discussions");
  const screen = within(wrapper.element as HTMLElement);

  await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
  const menu = await screen.findByRole("menu");
  await userEvent.click(within(menu).getByRole("menuitem", { name: /sign out/i }));

  await waitFor(() => {
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
  expect(routerPush).not.toHaveBeenCalled();

  logoutDone.resolve();

  await waitFor(() => {
    expect(routerPush).toHaveBeenCalledWith("/auth/login?redirectTo=%2Fapp%2Fdiscussions");
  });
  expect(clearSession.mock.invocationCallOrder[0]).toBeLessThan(
    routerPush.mock.invocationCallOrder[0]!,
  );
});

test("dashboard layout ignores duplicate logout events while the action is pending", async () => {
  const logoutDone = deferred();
  clearSession.mockReturnValueOnce(logoutDone.promise);
  const wrapper = await mountDashboardLayout("/app/discussions");
  const sidebar = wrapper.findComponent({ name: "AppSidebar" });

  sidebar.vm.$emit("logout");
  sidebar.vm.$emit("logout");
  await waitFor(() => expect(clearSession).toHaveBeenCalledTimes(1));
  expect(routerPush).not.toHaveBeenCalled();

  logoutDone.resolve();
  await waitFor(() => expect(routerPush).toHaveBeenCalledOnce());
});

test("dashboard layout releases failed logout and allows retry without redirecting early", async () => {
  clearSession
    .mockRejectedValueOnce(new Error("Logout failed"))
    .mockResolvedValueOnce(undefined);
  const wrapper = await mountDashboardLayout("/app/discussions");
  const screen = within(wrapper.element as HTMLElement);

  const signOut = async () => {
    await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
    const menu = await screen.findByRole("menu");
    await userEvent.click(within(menu).getByRole("menuitem", { name: /sign out/i }));
  };

  await signOut();
  await waitFor(() => expect(clearSession).toHaveBeenCalledTimes(1));
  expect(routerPush).not.toHaveBeenCalled();

  await signOut();
  await waitFor(() => expect(clearSession).toHaveBeenCalledTimes(2));
  await waitFor(() => {
    expect(routerPush).toHaveBeenCalledWith("/auth/login?redirectTo=%2Fapp%2Fdiscussions");
  });
});

test("dashboard layout reports navigation failure separately after logout", async () => {
  routerPush.mockRejectedValueOnce(new Error("Navigation failed"));
  const wrapper = await mountDashboardLayout("/app/discussions");
  const screen = within(wrapper.element as HTMLElement);

  await userEvent.click(screen.getByRole("button", { name: /open user menu/i }));
  const menu = await screen.findByRole("menu");
  await userEvent.click(within(menu).getByRole("menuitem", { name: /sign out/i }));

  await waitFor(() => expect(clearSession).toHaveBeenCalledOnce());
  await waitFor(() => expect(addNotification).toHaveBeenCalledWith({
    type: "error",
    title: "Navigation Failed",
    message: "You are logged out, but the login page could not be opened.",
  }));
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
