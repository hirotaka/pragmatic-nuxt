import { beforeEach, expect, test, vi } from "vitest";
import { ref } from "vue";
import { useComments } from "../useComments";

const {
  loadMore,
  loadPage,
  useAPI,
  usePaginatedData,
} = vi.hoisted(() => ({
  loadMore: vi.fn(),
  loadPage: vi.fn(),
  useAPI: vi.fn(),
  usePaginatedData: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useAPI", () => ({
  useAPI,
}));

vi.mock("#layers/base/app/composables/usePaginatedData", () => ({
  usePaginatedData,
}));

beforeEach(() => {
  loadMore.mockReset();
  loadPage.mockReset().mockResolvedValue(undefined);
  useAPI.mockReset().mockReturnValue(Promise.resolve({
    data: ref(undefined),
    status: ref("success"),
    refresh: vi.fn(),
  }));
  usePaginatedData.mockReset().mockReturnValue({
    data: ref({
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 1, hasMore: false },
    }),
    status: ref("success"),
    isLoading: ref(false),
    loadPage,
    loadMore,
  });
});

test("settles create and delete by refreshing the first page", async () => {
  const comments = await useComments("discussion-1");

  await comments.refreshAfterCreate();
  await comments.refreshAfterDelete();

  expect(loadPage.mock.calls).toEqual([[1], [1]]);
});

test("keeps mutation settlement when refreshing comments fails", async () => {
  loadPage.mockRejectedValue(new Error("Refresh failed"));
  const comments = await useComments("discussion-1");

  await expect(comments.refreshAfterCreate()).resolves.toBeUndefined();
  await expect(comments.refreshAfterDelete()).resolves.toBeUndefined();

  expect(loadPage.mock.calls).toEqual([[1], [1]]);
});
