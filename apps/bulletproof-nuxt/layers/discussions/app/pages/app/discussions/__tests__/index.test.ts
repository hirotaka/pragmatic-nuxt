import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { waitFor } from "@testing-library/vue";
import DiscussionsPage from "../index.vue";

const { refreshAfterCreate, useDiscussionList } = vi.hoisted(() => ({
  refreshAfterCreate: vi.fn(),
  useDiscussionList: vi.fn(),
}));

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
  };
});

mockNuxtImport("useDiscussionList", () => useDiscussionList);

beforeEach(() => {
  vi.clearAllMocks();
  refreshAfterCreate.mockReset().mockResolvedValue(undefined);
  useDiscussionList.mockReset().mockResolvedValue({ refreshAfterCreate });
});

const mountPage = () => mountSuspended(DiscussionsPage, {
  global: {
    stubs: {
      PageContent: {
        template: "<section><slot name='actions' /><slot /></section>",
      },
      DiscussionCreateForm: {
        name: "DiscussionCreateForm",
        emits: ["success"],
        template: "<div />",
      },
      DiscussionList: {
        name: "DiscussionList",
        template: "<div data-testid='discussions-list' />",
      },
    },
  },
});

test("renders the discussions list as the data owner", async () => {
  const wrapper = await mountPage();

  expect(wrapper.find("[data-testid='discussions-list']").exists()).toBe(true);
  expect(wrapper.findComponent({ name: "DiscussionList" }).props()).toEqual({});
});

test("settles creation and closes the create drawer", async () => {
  const wrapper = await mountPage();
  const originalList = wrapper.get("[data-testid='discussions-list']").element;
  const createTrigger = wrapper.findAll("button").find(button => button.text().includes("Create Discussion"));
  expect(createTrigger!.find("svg").exists()).toBe(true);
  await createTrigger!.trigger("click");

  wrapper.findComponent({ name: "DiscussionCreateForm" }).vm.$emit("success");

  await waitFor(() => expect(refreshAfterCreate).toHaveBeenCalledOnce());
  expect(wrapper.get("[data-testid='discussions-list']").element).toBe(originalList);
  await waitFor(() => expect(wrapper.findComponent({ name: "DiscussionCreateForm" }).exists()).toBe(false));
});
