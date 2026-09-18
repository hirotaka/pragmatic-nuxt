import { ref } from "vue";
import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import LoginPage from "../login.vue";
import RegisterPage from "../register.vue";

const { mockRoute, routerReplace } = vi.hoisted(() => ({
  mockRoute: {
    query: {} as Record<string, string>,
  },
  routerReplace: vi.fn(),
}));

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRoute: () => mockRoute,
    useRouter: () => ({ replace: routerReplace }),
  };
});

vi.mock("@tanstack/vue-query", async importOriginal => ({
  ...await importOriginal<typeof import("@tanstack/vue-query")>(),
  useQuery: () => ({
    data: ref([]),
    refetch: vi.fn(),
    status: ref("success"),
    suspense: () => Promise.resolve(),
  }),
}));
vi.mock("#layers/teams/app/queries/teams", () => ({
  teamsQuery: () => ({ queryKey: ["teams"] }),
}));

beforeEach(() => {
  mockRoute.query = {};
  routerReplace.mockReset().mockResolvedValue(undefined);
});

test("navigates from login only after the form reports success", async () => {
  const wrapper = await mountSuspended(LoginPage, {
    global: {
      stubs: {
        LoginForm: {
          emits: ["success"],
          template: `<button type="button" @click="$emit('success')">Complete login</button>`,
        },
      },
    },
  });

  expect(routerReplace).not.toHaveBeenCalled();
  await userEvent.click(wrapper.element as HTMLElement);

  expect(routerReplace).toHaveBeenCalledWith("/app");
});

test("navigates from registration only after the form reports success", async () => {
  const wrapper = await mountSuspended(RegisterPage, {
    global: {
      stubs: {
        RegisterForm: {
          emits: ["success"],
          template: `<button type="button" @click="$emit('success')">Complete registration</button>`,
        },
      },
    },
  });

  expect(routerReplace).not.toHaveBeenCalled();
  await userEvent.click(wrapper.element as HTMLElement);

  expect(routerReplace).toHaveBeenCalledWith("/app");
});
