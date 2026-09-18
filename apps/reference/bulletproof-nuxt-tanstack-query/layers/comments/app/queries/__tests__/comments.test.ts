import type { QueryClient } from "@tanstack/vue-query";
import { beforeEach, expect, test, vi } from "vitest";
import type { PaginatedComments } from "~comments/shared/types";
import {
  COMMENT_QUERY_KEYS,
  commentsInfiniteQuery,
  createCommentMutation,
  deleteCommentMutation,
  invalidateComments,
} from "../comments";

const { api } = vi.hoisted(() => ({ api: vi.fn() }));

vi.mock("#app", async importOriginal => ({
  ...await importOriginal<typeof import("#app")>(),
  useNuxtApp: () => ({ $api: api }),
}));

const page = (pageNumber: number, ids: string[], totalPages = 2): PaginatedComments => ({
  data: ids.map(id => ({
    id,
    body: id,
    discussionId: "discussion-1",
    authorId: "user-1",
    author: { id: "user-1", firstName: "Ada", lastName: "Lovelace" },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
  meta: {
    page: pageNumber,
    limit: 10,
    total: ids.length,
    totalPages,
    hasMore: pageNumber < totalPages,
  },
});

type CommentsOptions = {
  queryKey: unknown;
  meta: unknown;
  initialPageParam: number;
  queryFn: (context: { pageParam: number; signal: AbortSignal }) => Promise<PaginatedComments>;
  getNextPageParam: (lastPage: PaginatedComments) => number | undefined;
};

const optionsFor = (discussionId: string) => commentsInfiniteQuery({ discussionId }) as unknown as CommentsOptions;

beforeEach(() => {
  api.mockReset();
});

test("uses discussion identity, initial page, and cancellation for native infinite reads", async () => {
  api.mockResolvedValue(page(2, ["comment-2"], 2));
  const options = optionsFor("discussion-1");
  const controller = new AbortController();

  expect(options.queryKey).toEqual(COMMENT_QUERY_KEYS.discussion("discussion-1"));
  expect(options.meta).toEqual({ authenticated: true });
  expect(options.initialPageParam).toBe(1);
  expect(options.getNextPageParam(page(1, ["comment-1"]))).toBe(2);
  expect(options.getNextPageParam(page(2, ["comment-2"], 2))).toBeUndefined();

  await options.queryFn({ pageParam: 2, signal: controller.signal });

  expect(api).toHaveBeenCalledWith("/api/comments", {
    signal: controller.signal,
    query: { discussionId: "discussion-1", page: 2, limit: 10 },
  });
});

test("reuses the same next page after an append failure and keeps resource identities distinct", async () => {
  const options = optionsFor("discussion-1");
  const error = new Error("page two failed");
  api
    .mockResolvedValueOnce(page(1, ["comment-1"]))
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce(page(2, ["comment-2"], 2));

  await options.queryFn({ pageParam: 1, signal: new AbortController().signal });
  await expect(options.queryFn({ pageParam: 2, signal: new AbortController().signal })).rejects.toBe(error);
  await options.queryFn({ pageParam: 2, signal: new AbortController().signal });

  expect(optionsFor("discussion-2").queryKey).not.toEqual(options.queryKey);
  expect(api).toHaveBeenNthCalledWith(2, "/api/comments", expect.objectContaining({
    query: { discussionId: "discussion-1", page: 2, limit: 10 },
  }));
  expect(api).toHaveBeenNthCalledWith(3, "/api/comments", expect.objectContaining({
    query: { discussionId: "discussion-1", page: 2, limit: 10 },
  }));
});

test("keeps comment mutation settlement scoped to the write and invalidates only its discussion", async () => {
  api.mockResolvedValue(undefined);
  const create = createCommentMutation();
  const remove = deleteCommentMutation();
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  const queryClient = { invalidateQueries } as unknown as QueryClient;

  if (!create.mutationFn || !remove.mutationFn) throw new Error("Comment mutation function is unavailable");
  expect(create.meta).toEqual({ authenticated: true });
  expect(remove.meta).toEqual({ authenticated: true });

  await expect(create.mutationFn({ body: "Created", discussionId: "discussion-1" }, {} as never)).resolves.toBeUndefined();
  await expect(remove.mutationFn({ commentId: "comment-1", discussionId: "discussion-1" }, {} as never)).resolves.toBeUndefined();
  await invalidateComments(queryClient, "discussion-1");

  expect(api).toHaveBeenNthCalledWith(1, "/api/comments", {
    method: "POST",
    body: { body: "Created", discussionId: "discussion-1" },
  });
  expect(api).toHaveBeenNthCalledWith(2, "/api/comments/comment-1", {
    method: "DELETE",
  });
  expect(invalidateQueries).toHaveBeenCalledWith({
    queryKey: COMMENT_QUERY_KEYS.discussion("discussion-1"),
  });
});
