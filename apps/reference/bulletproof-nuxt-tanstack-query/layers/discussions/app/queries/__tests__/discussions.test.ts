import { QueryClient } from "@tanstack/vue-query";
import { beforeEach, expect, test, vi } from "vitest";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import {
  DISCUSSION_QUERY_KEYS,
  createDiscussionMutation,
  deleteDiscussionMutation,
  discussionDetailQuery,
  discussionListQuery,
  invalidateDiscussionLists,
  invalidateUpdatedDiscussion,
  normalizeDiscussionPage,
  updateDiscussionMutation,
} from "../discussions";

const { api } = vi.hoisted(() => ({ api: vi.fn() }));

vi.mock("#app", async importOriginal => ({
  ...await importOriginal<typeof import("#app")>(),
  useNuxtApp: () => ({ $api: api }),
}));

beforeEach(() => {
  api.mockReset();
});

test("normalizes invalid route pages before creating the list identity", () => {
  expect(normalizeDiscussionPage(undefined)).toBe(1);
  expect(normalizeDiscussionPage("not-a-page")).toBe(1);
  expect(normalizeDiscussionPage("0")).toBe(1);
  expect(normalizeDiscussionPage("2")).toBe(2);

  expect(discussionListQuery({ page: normalizeDiscussionPage("not-a-page"), limit: 10 }).queryKey)
    .toEqual(DISCUSSION_QUERY_KEYS.list(1, 10));
});

test("uses normalized page and limit consistently in list keys and API parameters", async () => {
  api.mockResolvedValue({ data: [], meta: {} });
  const firstPage = discussionListQuery({ page: 1, limit: 10 });
  const secondPage = discussionListQuery({ page: 2, limit: 10 });

  expect(firstPage.queryKey).toEqual(DISCUSSION_QUERY_KEYS.list(1, 10));
  expect(secondPage.queryKey).toEqual(DISCUSSION_QUERY_KEYS.list(2, 10));
  expect(secondPage.queryKey).not.toEqual(firstPage.queryKey);
  expect(secondPage.meta).toEqual({ authenticated: true });

  if (typeof secondPage.queryFn !== "function") throw new Error("List query function is unavailable");
  await secondPage.queryFn({ signal: undefined } as never);

  expect(api).toHaveBeenCalledWith("/api/discussions", {
    signal: undefined,
    query: { page: 2, limit: 10 },
  });
});

test("uses one stable detail identity for all consumers and forwards cancellation", async () => {
  api.mockResolvedValue({ id: "discussion-1" });
  const firstConsumer = discussionDetailQuery({ id: "discussion-1" });
  const secondConsumer = discussionDetailQuery({ id: "discussion-1" });
  const controller = new AbortController();

  expect(firstConsumer.queryKey).toEqual(DISCUSSION_QUERY_KEYS.detail("discussion-1"));
  expect(secondConsumer.queryKey).toEqual(firstConsumer.queryKey);
  expect(secondConsumer.meta).toEqual({ authenticated: true });

  if (typeof secondConsumer.queryFn !== "function") throw new Error("Detail query function is unavailable");
  await secondConsumer.queryFn({ signal: controller.signal } as never);

  expect(api).toHaveBeenCalledWith("/api/discussions/discussion-1", {
    signal: controller.signal,
  });
});

test("keeps previous detail data while a different discussion loads", () => {
  const previousDiscussion: Discussion = {
    id: "discussion-1",
    title: "Discussion",
    body: "Body",
    authorId: "author-1",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    author: { id: "author-1", firstName: "Test", lastName: "User" },
  };
  const query = discussionDetailQuery({ id: "discussion-2" });

  if (typeof query.placeholderData !== "function") throw new Error("Detail placeholder data is unavailable");
  expect(query.placeholderData(previousDiscussion, {
    queryKey: DISCUSSION_QUERY_KEYS.detail("discussion-1"),
  } as never)).toBe(previousDiscussion);
});

test("keeps list and detail cache contracts distinct while retaining their shared invalidation prefix", () => {
  const queryClient = new QueryClient();
  const list = discussionListQuery({ page: 1, limit: 10 });
  const detail = discussionDetailQuery({ id: "discussion-1" });

  const cachedList: PaginatedDiscussions = {
    data: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 1, hasMore: false },
  };
  const cachedDetail: Discussion = {
    id: "discussion-1",
    title: "Discussion",
    body: "Body",
    authorId: "author-1",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    author: { id: "author-1", firstName: "Test", lastName: "User" },
  };

  queryClient.setQueryData(list.queryKey, cachedList);
  queryClient.setQueryData(detail.queryKey, cachedDetail);

  expect(queryClient.getQueryData(list.queryKey)).toEqual(cachedList);
  expect(queryClient.getQueryData(detail.queryKey)).toEqual(cachedDetail);
  expect(DISCUSSION_QUERY_KEYS.all).toEqual(["discussions"]);
});

test("preserves detail request failures for the rendering owner", async () => {
  const error = new Error("Discussion not found");
  api.mockRejectedValueOnce(error);

  const query = discussionDetailQuery({ id: "missing-discussion" });
  if (typeof query.queryFn !== "function") throw new Error("Detail query function is unavailable");

  await expect(query.queryFn({ signal: undefined } as never)).rejects.toBe(error);
});

test("keeps Discussion mutation completion scoped to the API write", async () => {
  api.mockResolvedValue(undefined);

  const create = createDiscussionMutation();
  const update = updateDiscussionMutation();
  const remove = deleteDiscussionMutation();

  if (!create.mutationFn || !update.mutationFn || !remove.mutationFn) {
    throw new Error("Discussion mutation function is unavailable");
  }
  expect(create.meta).toEqual({ authenticated: true });
  expect(update.meta).toEqual({ authenticated: true });
  expect(remove.meta).toEqual({ authenticated: true });

  await expect(create.mutationFn({ title: "Created", body: "Body" }, {} as never)).resolves.toBeUndefined();
  await expect(update.mutationFn({ id: "discussion-1", data: { title: "Updated", body: "Body" } }, {} as never)).resolves.toBeUndefined();
  await expect(remove.mutationFn("discussion-1", {} as never)).resolves.toBeUndefined();

  expect(api).toHaveBeenNthCalledWith(1, "/api/discussions", {
    method: "POST",
    body: { title: "Created", body: "Body" },
  });
  expect(api).toHaveBeenNthCalledWith(2, "/api/discussions/discussion-1", {
    method: "PATCH",
    body: { title: "Updated", body: "Body" },
  });
  expect(api).toHaveBeenNthCalledWith(3, "/api/discussions/discussion-1", {
    method: "DELETE",
  });
});

test("owns create-delete and update invalidation scopes separately", async () => {
  const invalidateQueries = vi.fn().mockResolvedValue(undefined);
  const queryClient = { invalidateQueries } as unknown as QueryClient;

  await invalidateDiscussionLists(queryClient);
  await invalidateUpdatedDiscussion(queryClient, "discussion-1");

  expect(invalidateQueries).toHaveBeenNthCalledWith(1, {
    queryKey: DISCUSSION_QUERY_KEYS.lists(),
  });
  expect(invalidateQueries).toHaveBeenNthCalledWith(2, {
    queryKey: DISCUSSION_QUERY_KEYS.lists(),
  });
  expect(invalidateQueries).toHaveBeenNthCalledWith(3, {
    queryKey: DISCUSSION_QUERY_KEYS.detail("discussion-1"),
  });
});
