import { beforeEach, expect, test, vi } from "vitest";
import { commentsQuery, COMMENT_QUERY_KEYS, createCommentMutation, deleteCommentMutation } from "../comments";
import type { CreateCommentInput } from "~comments/shared/schemas";
import type { PaginatedComments } from "~comments/shared/types";

const { fetchMock, invalidateQueries } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));
vi.mock("@pinia/colada", () => ({
  defineInfiniteQueryOptions: (factory: unknown) => factory,
  defineMutationOptions: (factory: () => unknown) => factory,
  useQueryCache: () => ({ invalidateQueries }),
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));
vi.mock("#imports", async importOriginal => ({
  ...await importOriginal<typeof import("#imports")>(),
  $fetch: fetchMock,
}));
vi.mock("#build/fetch.mjs", () => ({ $fetch: fetchMock }));

beforeEach(() => {
  fetchMock.mockReset();
  invalidateQueries.mockClear();
  Object.assign(useNuxtApp(), { $api: fetchMock });
});

test("uses discussion identity and pageParam for infinite comments reads", async () => {
  fetchMock.mockResolvedValue({ data: [], meta: { page: 2, totalPages: 2, hasMore: false } });
  const options = commentsQuery({ discussionId: "discussion-1" }) as unknown as {
    key: unknown;
    delay: number;
    query: (context: { pageParam: number; signal: AbortSignal }) => Promise<PaginatedComments>;
    getNextPageParam: (page: PaginatedComments) => number | undefined;
  };
  const result = await options.query({ pageParam: 2, signal: new AbortController().signal });

  expect(options.key).toEqual(COMMENT_QUERY_KEYS.discussion("discussion-1"));
  expect(options.delay).toBe(0);
  expect(fetchMock).toHaveBeenCalledWith("/api/comments", expect.objectContaining({ query: { discussionId: "discussion-1", page: 2, limit: 10 } }));
  expect(options.getNextPageParam(result)).toBeUndefined();
});

test("invalidates the discussion comments query after successful mutations", async () => {
  fetchMock.mockResolvedValue(undefined);
  const create = createCommentMutation() as unknown as {
    mutation: (input: CreateCommentInput, context: unknown) => Promise<void>;
    onSuccess: (data: undefined, input: CreateCommentInput, context: unknown) => void;
  };
  const input = { body: "Comment", discussionId: "discussion-1" };
  await create.mutation(input, {});
  create.onSuccess(undefined, input, {});

  const remove = deleteCommentMutation() as unknown as {
    mutation: (input: { commentId: string; discussionId: string }, context: unknown) => Promise<void>;
    onSuccess: (data: undefined, input: { commentId: string; discussionId: string }, context: unknown) => void;
  };
  const deleteInput = { commentId: "comment-1", discussionId: "discussion-1" };
  await remove.mutation(deleteInput, {});
  remove.onSuccess(undefined, deleteInput, {});

  expect(invalidateQueries).toHaveBeenCalledTimes(2);
  expect(invalidateQueries).toHaveBeenCalledWith({ key: COMMENT_QUERY_KEYS.discussion("discussion-1") });
});
