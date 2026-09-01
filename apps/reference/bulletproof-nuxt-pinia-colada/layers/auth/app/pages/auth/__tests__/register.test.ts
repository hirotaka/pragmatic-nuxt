import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { nextTick, ref } from "vue";
import RegisterPage from "../register.vue";
import type { Team } from "~teams/shared/types";

const { queryState, useQueryMock } = vi.hoisted(() => ({
  queryState: {
    data: undefined as Team[] | undefined,
    error: undefined as unknown,
    status: "pending",
  },
  useQueryMock: vi.fn(),
}));

let activeQueryState: {
  data: ReturnType<typeof ref<Team[] | undefined>>;
  error: ReturnType<typeof ref<unknown>>;
  status: ReturnType<typeof ref<string>>;
} | undefined;

mockNuxtImport("useRoute", () => () => ({ query: {}, params: {} }));
vi.mock("~teams/app/queries/teams", () => ({
  teamsQuery: vi.fn(() => ({ key: ["teams"] })),
}));

vi.mock("@pinia/colada", async importOriginal => ({
  ...await importOriginal<typeof import("@pinia/colada")>(),
  useQuery: (options: unknown) => {
    useQueryMock(options);
    activeQueryState = {
      data: ref(queryState.data),
      error: ref(queryState.error),
      status: ref(queryState.status),
    };
    return activeQueryState;
  },
}));

const mountPage = () => mountSuspended(RegisterPage, {
  global: {
    stubs: {
      RegisterForm: {
        template: "<form data-testid='register-form' :data-team-count='teams.length' />",
        props: ["teams"],
      },
    },
  },
});

describe("Registration page Teams query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryState.data = undefined;
    queryState.error = undefined;
    queryState.status = "pending";
    activeQueryState = undefined;
  });

  test("keeps the form unmounted while the required Teams read is pending", async () => {
    const wrapper = await mountPage();

    expect(useQueryMock).toHaveBeenCalledOnce();
    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(false);
    expect(wrapper.get("[role=\"status\"]").attributes("aria-label")).toBe("Loading teams");
  });

  test("passes populated Teams to the form", async () => {
    queryState.data = [{ id: "team-1", name: "Existing Team", createdAt: "", updatedAt: "" }];
    queryState.status = "success";
    const wrapper = await mountPage();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='register-form']").attributes("data-team-count")).toBe("1");
  });

  test("mounts the form with an empty settled collection", async () => {
    queryState.data = [];
    queryState.status = "success";
    const wrapper = await mountPage();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='register-form']").attributes("data-team-count")).toBe("0");
  });

  test("does not mount the form when the required Teams read fails", async () => {
    const error = new Error("Teams unavailable");
    queryState.error = error;
    queryState.status = "error";
    const wrapper = await mountPage();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(false);
  });

  test("mounts the form after a pending read settles with populated Teams", async () => {
    const wrapper = await mountPage();

    activeQueryState!.data.value = [{ id: "team-1", name: "Existing Team", createdAt: "", updatedAt: "" }];
    activeQueryState!.status.value = "success";
    await nextTick();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(true);
  });

  test("mounts new-Team registration after a pending read settles empty", async () => {
    const wrapper = await mountPage();

    activeQueryState!.data.value = [];
    activeQueryState!.status.value = "success";
    await nextTick();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='register-form']").attributes("data-team-count")).toBe("0");
  });

  test("keeps settled form data during a background refetch", async () => {
    queryState.data = [{ id: "team-1", name: "Existing Team", createdAt: "", updatedAt: "" }];
    queryState.status = "success";
    const wrapper = await mountPage();

    activeQueryState!.status.value = "pending";
    await nextTick();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(true);
    expect(wrapper.find("[role='status']").exists()).toBe(false);
  });

  test("keeps settled form data when a background refetch fails", async () => {
    queryState.data = [{ id: "team-1", name: "Existing Team", createdAt: "", updatedAt: "" }];
    queryState.status = "success";
    const wrapper = await mountPage();

    const error = new Error("Teams unavailable");
    activeQueryState!.error.value = error;
    activeQueryState!.status.value = "error";
    await nextTick();

    expect(wrapper.find("[data-testid='register-form']").exists()).toBe(true);
  });
});
