import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import DiscussionsPage from "../index.vue";

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
  };
});

describe("Discussions Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("delegates data ownership to the discussions collection", async () => {
    const wrapper = await mountSuspended(DiscussionsPage, {
      global: {
        stubs: {
          LayoutsContentLayout: {
            template: "<section><slot name='actions' /><slot /></section>",
            props: ["title", "description"],
          },
          DiscussionsCollection: {
            template: "<div data-testid='discussions-collection' />",
          },
        },
      },
    });

    expect(wrapper.html()).toContain("discussions-collection");
  });
});
