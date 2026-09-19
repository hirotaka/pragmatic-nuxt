import { beforeEach, expect, test, vi } from "vitest";
import { ref } from "vue";
import { useDiscussions } from "../useDiscussions";

const { useAPI } = vi.hoisted(() => ({
  useAPI: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useAPI", () => ({
  useAPI,
}));

beforeEach(() => {
  useAPI.mockReset();
});

test("registers the Discussions endpoint with shared pagination state", async () => {
  const data = ref({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1, hasMore: false } });
  const status = ref<"success">("success");
  const refresh = vi.fn();
  const read = { data, status, refresh };
  useAPI.mockReturnValue(Promise.resolve(read));

  const result = await useDiscussions();

  expect(useAPI).toHaveBeenCalledOnce();
  expect(useAPI.mock.calls[0]?.[0]).toBe("/api/discussions");
  const options = useAPI.mock.calls[0]?.[1];
  expect(options.key.value).toBe("discussions:1");
  expect(options.query.page).toBe(result.currentPage);
  expect(options.query.limit).toBe(10);
  result.currentPage.value = 3;
  expect(options.key.value).toBe("discussions:3");
  expect(options.query.page.value).toBe(3);
  expect(result).toEqual({
    currentPage: result.currentPage,
    data,
    refresh,
    refreshAfterCreate: expect.any(Function),
    refreshAfterDelete: expect.any(Function),
    status,
  });
  expect(result.data).toBe(data);
  expect(result.status).toBe(status);
  expect(result.refresh).toBe(refresh);
});

test("returns to page one and refreshes after creation", async () => {
  const refresh = vi.fn().mockResolvedValue(undefined);
  useAPI.mockReturnValue(Promise.resolve({
    data: ref(undefined),
    status: ref("success"),
    refresh,
  }));
  const result = await useDiscussions();
  result.currentPage.value = 3;

  await result.refreshAfterCreate();

  expect(result.currentPage.value).toBe(1);
  expect(refresh).toHaveBeenCalledOnce();
});

test("keeps creation settlement when refreshing page one fails", async () => {
  const refresh = vi.fn().mockRejectedValueOnce(new Error("Refresh failed"));
  useAPI.mockReturnValue(Promise.resolve({
    data: ref(undefined),
    status: ref("error"),
    refresh,
  }));
  const result = await useDiscussions();
  result.currentPage.value = 3;

  await expect(result.refreshAfterCreate()).resolves.toBeUndefined();

  expect(result.currentPage.value).toBe(1);
  expect(refresh).toHaveBeenCalledOnce();
});

test("moves to the previous page when deletion leaves the current page empty", async () => {
  const data = ref({
    data: [{ id: "discussion-1" }],
    meta: { page: 2, limit: 10, total: 1, totalPages: 2, hasMore: false },
  });
  const refresh = vi
    .fn()
    .mockImplementationOnce(async () => {
      data.value = {
        data: [],
        meta: { page: 2, limit: 10, total: 10, totalPages: 1, hasMore: false },
      };
    })
    .mockResolvedValueOnce(undefined);
  useAPI.mockReturnValue(Promise.resolve({
    data,
    status: ref("success"),
    refresh,
  }));
  const result = await useDiscussions();
  result.currentPage.value = 2;

  await result.refreshAfterDelete();

  expect(result.currentPage.value).toBe(1);
  expect(refresh).toHaveBeenCalledTimes(2);
});

test("keeps page one when deletion leaves it empty", async () => {
  const data = ref({
    data: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 1, hasMore: false },
  });
  const refresh = vi.fn().mockResolvedValue(undefined);
  useAPI.mockReturnValue(Promise.resolve({
    data,
    status: ref("success"),
    refresh,
  }));
  const result = await useDiscussions();
  result.currentPage.value = 1;

  await result.refreshAfterDelete();

  expect(result.currentPage.value).toBe(1);
  expect(refresh).toHaveBeenCalledOnce();
});

test("shares the current page between consumers", async () => {
  useAPI.mockReturnValue(Promise.resolve({
    data: ref(undefined),
    status: ref("idle"),
    refresh: vi.fn(),
  }));

  const first = await useDiscussions();
  const second = await useDiscussions();
  first.currentPage.value = 4;

  expect(first.currentPage.value).toBe(4);
  expect(second.currentPage.value).toBe(4);
});
