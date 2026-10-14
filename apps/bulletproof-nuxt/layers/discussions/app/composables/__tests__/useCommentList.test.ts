import { afterEach, beforeEach, expect, expectTypeOf, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { effectScope, nextTick } from "vue";
import { useFetch, useNuxtApp } from "#app";
import type { Comment } from "#layers/discussions/shared/types/comment";
import type { PaginatedResult } from "~~/shared/types/pagination";
import { useCommentList } from "../useCommentList";

const { useAPI, fetchPage } = vi.hoisted(() => ({ useAPI: vi.fn(), fetchPage: vi.fn() }));
vi.mock("~~/app/composables/useAPI", () => ({ useAPI }));
mockNuxtImport<typeof useNuxtApp>("useNuxtApp", original => (...args) => new Proxy(original(...args), {
  get: (target, property, receiver) => property === "$api"
    ? fetchPage
    : Reflect.get(target, property, receiver),
}));

// Only transport is mocked; the feature, common API and Nuxt AsyncData run together.
const scopes: ReturnType<typeof effectScope>[] = [];
let sequence = 0;
let discussionId: string;

function response(id: string, page = 1): PaginatedResult<Comment> {
  return {
    items: [{
      id: `${id}-${page}`, body: `Page ${page}`, discussionId: id, authorId: "user-1",
      author: { id: "user-1", firstName: "Ada", lastName: "Lovelace" },
      createdAt: "2026-07-10T00:00:00.000Z", updatedAt: "2026-07-10T00:00:00.000Z",
    }],
    meta: { page, limit: 10, total: 21, totalPages: 3, hasMore: page < 3 },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function consume(id = discussionId) {
  const scope = effectScope();
  scopes.push(scope);
  return { scope, ready: scope.run(() => useCommentList(id))! };
}

const requestedPages = () => fetchPage.mock.calls.map(([, options]) => options.query.page);

beforeEach(() => {
  discussionId = `discussion-${++sequence}`;
  fetchPage.mockReset().mockImplementation(async (route: string, options) => {
    return response(route.split("/")[3]!, options.query.page);
  });
  useAPI.mockReset().mockImplementation((route, options) => useFetch(route, {
    ...options,
    $fetch: ((request, options) => fetchPage(request, options)) as typeof $fetch,
  }));
});

afterEach(async () => {
  scopes.splice(0).forEach(scope => scope.stop());
  await nextTick();
});

test("one feature call acquires the first page and exposes the whole list API", async () => {
  const comments = await consume().ready;
  expect(requestedPages()).toEqual([1]);
  expect(fetchPage.mock.calls[0]![0]).toBe(`/api/discussions/${discussionId}/comments`);
  expect(fetchPage.mock.calls[0]![1].query).toEqual({ page: 1, limit: 10 });
  expect(comments.data.value).toEqual({ pages: [response(discussionId)] });
  expect(comments.hasNextPage.value).toBe(true);
  expect(comments.isLoading.value).toBe(false);
  expect(comments).not.toHaveProperty("loadInitialPage");
  await comments.loadMore();
  expect(comments.data.value?.pages).toEqual([response(discussionId), response(discussionId, 2)]);
  expectTypeOf(comments.data.value!.pages[0]!.items[0]!.body).toEqualTypeOf<string>();
});

test("unrelated consumers share the initial request and response", async () => {
  const pending = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const first = consume();
  const second = consume();
  expect(fetchPage).toHaveBeenCalledOnce();
  pending.resolve(response(discussionId));
  const [a, b] = await Promise.all([first.ready, second.ready]);
  expect(a.data.value?.pages[0]).toBe(b.data.value?.pages[0]);
});

test("late consumers start at page one without disturbing another view's progress", async () => {
  const a = await consume().ready;
  await a.loadMore();
  const b = await consume().ready;
  expect(a.data.value?.pages).toHaveLength(2);
  expect(b.data.value?.pages).toEqual([response(discussionId)]);
  expect(requestedPages()).toEqual([1, 2]);
});

test("refresh replaces every consumer's pages after settling", async () => {
  const a = await consume().ready;
  const b = await consume().ready;
  await a.loadMore();
  await a.loadMore();
  await b.loadMore();
  const pending = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const refreshing = b.refresh();
  expect(a.isLoading.value).toBe(true);
  expect(a.data.value?.pages).toHaveLength(3);
  await a.loadMore();
  expect(requestedPages()).toEqual([1, 2, 3, 2, 1]);
  pending.resolve(response(discussionId));
  await refreshing;
  expect(a.data.value?.pages).toEqual([response(discussionId)]);
  expect(b.data.value?.pages).toEqual([response(discussionId)]);
  expect(a.isLoading.value).toBe(false);
});

test("failed refresh preserves each view's pages and settles the completed mutation", async () => {
  const a = await consume().ready;
  const b = await consume().ready;
  await a.loadMore();
  fetchPage.mockRejectedValueOnce(new Error("Refresh failed"));
  await expect(b.refresh()).resolves.toBeUndefined();
  expect(a.data.value?.pages).toHaveLength(2);
  expect(b.data.value?.pages).toHaveLength(1);
  expect(a.isLoading.value).toBe(false);
  await b.refresh();
  expect(a.data.value?.pages).toHaveLength(1);
});

test("load-more loading and failures are local to the initiating consumer", async () => {
  const a = await consume().ready;
  const b = await consume().ready;
  const pending = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const loading = a.loadMore();
  expect(a.isLoading.value).toBe(true);
  expect(a.isLoadingMore.value).toBe(true);
  expect(b.isLoading.value).toBe(false);
  await b.loadMore();
  pending.reject(new Error("Page failed"));
  await loading;
  expect(a.data.value?.pages).toHaveLength(1);
  expect(b.data.value?.pages).toHaveLength(2);
  expect(a.isLoading.value).toBe(false);
  await a.loadMore();
  expect(a.data.value?.pages).toHaveLength(2);
  expect(requestedPages()).toEqual([1, 2, 2, 2]);
});

test("deduplicates local clicks and stops at the final page", async () => {
  const a = await consume().ready;
  const pending = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const loading = a.loadMore();
  await a.loadMore();
  expect(requestedPages()).toEqual([1, 2]);
  pending.resolve(response(discussionId, 2));
  await loading;
  await a.loadMore();
  await a.loadMore();
  expect(requestedPages()).toEqual([1, 2, 3]);
  expect(a.hasNextPage.value).toBe(false);
});

test("refresh aborts an older page without letting its settlement disturb a new page", async () => {
  const a = await consume().ready;
  const b = await consume().ready;
  const stale = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(stale.promise);
  const loading = a.loadMore();
  const signal = fetchPage.mock.calls.at(-1)![1].signal;
  await b.refresh();
  expect(signal.aborted).toBe(true);
  expect(a.isLoadingMore.value).toBe(false);
  const next = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(next.promise);
  const nextLoading = a.loadMore();
  stale.resolve(response(discussionId, 2));
  await loading;
  expect(a.data.value?.pages).toHaveLength(1);
  expect(a.isLoadingMore.value).toBe(true);
  next.resolve(response(discussionId, 2));
  await nextLoading;
  expect(a.data.value?.pages).toHaveLength(2);
});

test("disposal aborts only local work and a fresh visit starts at page one", async () => {
  const first = consume();
  const a = await first.ready;
  const b = await consume().ready;
  const stale = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(stale.promise);
  const loading = a.loadMore();
  first.scope.stop();
  expect(fetchPage.mock.calls.at(-1)![1].signal.aborted).toBe(true);
  await b.loadMore();
  const fresh = await consume().ready;
  stale.resolve(response(discussionId, 2));
  await loading;
  expect(a.data.value?.pages).toHaveLength(1);
  expect(b.data.value?.pages).toHaveLength(2);
  expect(fresh.data.value?.pages).toHaveLength(1);
});

test("disposal does not cancel another consumer's shared refresh", async () => {
  const first = consume();
  const a = await first.ready;
  const b = await consume().ready;
  const pending = deferred<PaginatedResult<Comment>>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const refreshing = a.refresh();
  first.scope.stop();
  expect(fetchPage.mock.calls.at(-1)![1].signal.aborted).toBe(false);
  pending.resolve(response(discussionId));
  await refreshing;
  expect(b.data.value?.pages).toEqual([response(discussionId)]);
});

test("same-discussion reentry after all consumers leave fetches page one", async () => {
  const first = consume();
  const a = await first.ready;
  await a.loadMore();
  first.scope.stop();
  await nextTick();
  const b = await consume().ready;
  expect(b.data.value?.pages).toEqual([response(discussionId)]);
  expect(requestedPages()).toEqual([1, 2, 1]);
});

test("different discussions never share pages or refreshes", async () => {
  const a = await consume().ready;
  await a.loadMore();
  const otherId = `${discussionId}-other`;
  const b = await consume(otherId).ready;
  await b.refresh();
  expect(a.data.value?.pages).toEqual([response(discussionId), response(discussionId, 2)]);
  expect(b.data.value?.pages).toEqual([response(otherId)]);
});

test("hydration reuses Nuxt's first-page payload without a browser GET", async () => {
  const first = consume();
  await first.ready;
  first.scope.stop();
  const nuxtApp = useNuxtApp();
  const wasHydrating = nuxtApp.isHydrating;
  const wasServerRendered = nuxtApp.payload.serverRendered;
  nuxtApp.isHydrating = true;
  nuxtApp.payload.serverRendered = true;
  try {
    const a = await consume().ready;
    const b = await consume().ready;
    expect(a.data.value?.pages).toEqual([response(discussionId)]);
    expect(b.data.value?.pages[0]).toBe(a.data.value?.pages[0]);
    expect(fetchPage).toHaveBeenCalledOnce();
  }
  finally {
    nuxtApp.isHydrating = wasHydrating;
    nuxtApp.payload.serverRendered = wasServerRendered;
  }
});
