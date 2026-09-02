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

test("registers the Discussions endpoint with reactive query inputs and returns native AsyncData", async () => {
  const page = ref(2);
  const limit = ref(25);
  const data = ref({ data: [], meta: { page: 2, limit: 25, total: 0, totalPages: 1, hasMore: false } });
  const status = ref<"success">("success");
  const refresh = vi.fn();
  const read = { data, status, refresh };
  useAPI.mockReturnValue(Promise.resolve(read));

  const result = await useDiscussions({ page, limit });

  expect(useAPI).toHaveBeenCalledOnce();
  expect(useAPI.mock.calls[0]?.[0]).toBe("/api/discussions");
  const options = useAPI.mock.calls[0]?.[1];
  expect(options).not.toHaveProperty("key");
  const query = options.query;
  expect(query.page.value).toBe(2);
  expect(query.limit.value).toBe(25);
  page.value = 3;
  limit.value = 50;
  expect(query.page.value).toBe(3);
  expect(query.limit.value).toBe(50);
  expect(result).toBe(read);
  expect(result.data).toBe(data);
  expect(result.status).toBe(status);
  expect(result.refresh).toBe(refresh);
});

test("uses page and limit defaults without adding a shared key", async () => {
  useAPI.mockReturnValue(Promise.resolve({
    data: ref(undefined),
    status: ref("idle"),
    refresh: vi.fn(),
  }));

  await useDiscussions();

  const options = useAPI.mock.calls[0]?.[1];
  expect(options.query.page.value).toBe(1);
  expect(options.query.limit.value).toBe(10);
  expect(options).not.toHaveProperty("key");
  expect(options).not.toHaveProperty("watch");
});
