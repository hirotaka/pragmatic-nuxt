import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { waitFor } from "@testing-library/vue";
import DiscussionsPage from "../index.vue";

const { refreshAfterCreate, useDiscussionsSettlement } = vi.hoisted(() => ({
  refreshAfterCreate: vi.fn(),
  useDiscussionsSettlement: vi.fn(),
}));

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
  };
});

vi.mock("~discussions/app/composables/useDiscussions", () => ({
  useDiscussionsSettlement,
}));

beforeEach(() => {
  vi.clearAllMocks();
  refreshAfterCreate.mockReset().mockResolvedValue(undefined);
  useDiscussionsSettlement.mockReset().mockReturnValue({ refreshAfterCreate });
});

const mountPage = () => mountSuspended(DiscussionsPage, {
  global: {
    stubs: {
      LayoutsContentLayout: {
        template: "<section><slot name='actions' /><slot /></section>",
      },
      CreateDiscussionForm: {
        name: "CreateDiscussionForm",
        emits: ["success"],
        template: "<div />",
      },
      DiscussionsList: {
        name: "DiscussionsList",
        template: "<div data-testid='discussions-list' />",
      },
    },
  },
});

test("renders the discussions list as the data owner", async () => {
  const wrapper = await mountPage();

  expect(wrapper.find("[data-testid='discussions-list']").exists()).toBe(true);
  expect(wrapper.findComponent({ name: "DiscussionsList" }).props()).toEqual({});
});

test("settles creation and closes the create drawer", async () => {
  const wrapper = await mountPage();
  const originalList = wrapper.get("[data-testid='discussions-list']").element;
  const createTrigger = wrapper.findAll("button").find(button => button.text().includes("Create Discussion"));
  await createTrigger!.trigger("click");

  wrapper.findComponent({ name: "CreateDiscussionForm" }).vm.$emit("success");

  await waitFor(() => expect(refreshAfterCreate).toHaveBeenCalledOnce());
  expect(wrapper.get("[data-testid='discussions-list']").element).toBe(originalList);
  await waitFor(() => expect(wrapper.findComponent({ name: "CreateDiscussionForm" }).exists()).toBe(false));
});
