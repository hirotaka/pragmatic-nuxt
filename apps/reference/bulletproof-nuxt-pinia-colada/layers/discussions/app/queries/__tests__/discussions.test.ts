import { beforeEach, expect, test, vi } from "vitest";
import type { CreateDiscussionInput, UpdateDiscussionInput } from "~discussions/shared/schemas";
import type { PaginatedDiscussions } from "~discussions/shared/types";
import {
  createDiscussionMutation,
  deleteDiscussionMutation,
  discussionDetailQuery,
  discussionListQuery,
  updateDiscussionMutation,
} from "../discussions";

const { invalidateQueries, fetchMock } = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("#imports", async importOriginal => ({
  ...await importOriginal<typeof import("#imports")>(),
  $fetch: fetchMock,
}));

vi.mock("#build/fetch.mjs", () => ({
  $fetch: fetchMock,
}));

vi.mock("@pinia/colada", async importOriginal => ({
  ...await importOriginal<typeof import("@pinia/colada")>(),
  useQueryCache: () => ({ invalidateQueries }),
}));

beforeEach(() => {
  invalidateQueries.mockReset().mockResolvedValue(undefined);
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  Object.assign(useNuxtApp(), { $api: fetchMock });
});

test("create mutation sends the write through $api", async () => {
  const input: CreateDiscussionInput = {
    title: "New discussion",
    body: "Discussion body",
  };
  const mutation = createDiscussionMutation();

  await mutation.mutation(input, {} as never);

  expect(fetchMock).toHaveBeenCalledWith("/api/discussions", {
    method: "POST",
    body: input,
  });
});

test("delete mutation sends the write through $api", async () => {
  const mutation = deleteDiscussionMutation();

  await mutation.mutation("discussion-1", {} as never);

  expect(fetchMock).toHaveBeenCalledWith("/api/discussions/discussion-1", {
    method: "DELETE",
  });
});

test("detail query sends the resource ID through $api", async () => {
  const query = discussionDetailQuery({ id: "discussion-1" });

  await query.query({} as never);

  expect(fetchMock).toHaveBeenCalledWith("/api/discussions/discussion-1", {
    signal: undefined,
  });
});

test("detail query keeps one identity for destination reads and prefetch", () => {
  const query = discussionDetailQuery({ id: "discussion-1" });

  expect(query.key).toEqual(["discussions", "discussion-1"]);
});

test("list query uses page and limit in its key and API query", async () => {
  const query = discussionListQuery({ page: 2, limit: 10 });

  await query.query({ signal: undefined } as never);

  expect(query.key).toEqual(["discussions", { page: 2, limit: 10 }]);
  expect(fetchMock).toHaveBeenCalledWith("/api/discussions", {
    signal: undefined,
    query: { page: 2, limit: 10 },
  });
});

test("list query keeps previous data as placeholder data", () => {
  const previousData = {
    data: [],
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasMore: false,
    },
  } satisfies PaginatedDiscussions;
  const query = discussionListQuery({ page: 2, limit: 10 });
  const placeholderData = query.placeholderData;

  expect(typeof placeholderData).toBe("function");
  if (typeof placeholderData !== "function") return;

  expect(placeholderData(previousData, undefined)).toBe(previousData);
});

test("update mutation sends the write through $api", async () => {
  const data: UpdateDiscussionInput = {
    title: "Updated discussion",
    body: "Updated body",
  };
  const mutation = updateDiscussionMutation();

  await mutation.mutation({ id: "discussion-1", data }, {} as never);

  expect(fetchMock).toHaveBeenCalledWith("/api/discussions/discussion-1", {
    method: "PATCH",
    body: data,
  });
});

test("successful mutations invalidate the Discussions list without awaiting it", async () => {
  const createMutation = createDiscussionMutation();
  const deleteMutation = deleteDiscussionMutation();

  createMutation.onSuccess?.(undefined, { title: "new", body: "body" }, {} as never);
  deleteMutation.onSuccess?.(undefined, "discussion-1", {} as never);

  expect(invalidateQueries).toHaveBeenNthCalledWith(1, { key: ["discussions"] });
  expect(invalidateQueries).toHaveBeenNthCalledWith(2, { key: ["discussions"] });
});

test("successful updates invalidate the detail and Discussions list scopes", async () => {
  const mutation = updateDiscussionMutation();
  const data: UpdateDiscussionInput = {
    title: "Updated discussion",
    body: "Updated body",
  };

  mutation.onSuccess?.(undefined, { id: "discussion-1", data }, {} as never);

  expect(invalidateQueries).toHaveBeenCalledWith({ key: ["discussions"] });
  expect(invalidateQueries).toHaveBeenCalledTimes(1);
});

test("invalidation failure does not reject the mutation success callback", async () => {
  invalidateQueries.mockRejectedValueOnce(new Error("Refresh failed"));
  const mutation = createDiscussionMutation();

  expect(() => mutation.onSuccess?.(undefined, { title: "new", body: "body" }, {} as never)).not.toThrow();
  await Promise.resolve();
  expect(invalidateQueries).toHaveBeenCalledOnce();
});

test("detail query preserves API errors", async () => {
  const error = Object.assign(new Error("Discussion not found"), { statusCode: 404 });
  fetchMock.mockRejectedValueOnce(error);

  await expect(discussionDetailQuery({ id: "discussion-1" }).query({} as never)).rejects.toBe(error);
});
