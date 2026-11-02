import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { effectScope, nextTick } from "vue";
import { useFetch, useNuxtApp } from "#app";
import { useInfiniteAPI } from "~~/app/composables/useInfiniteAPI";

const { useAPI, fetchPage } = vi.hoisted(() => ({ useAPI: vi.fn(), fetchPage: vi.fn() }));
vi.mock("~~/app/composables/useAPI", () => ({ useAPI }));
mockNuxtImport<typeof useNuxtApp>("useNuxtApp", original => (...args) => new Proxy(original(...args), {
  get: (target, property, receiver) => property === "$api"
    ? fetchPage
    : Reflect.get(target, property, receiver),
}));

interface Page {
  entries: string[];
  nextPage: number | null;
}

const scopes: ReturnType<typeof effectScope>[] = [];
let sequence = 0;
let request: `/test/infinite/${number}`;
const first: Page = { entries: ["First"], nextPage: 7 };
const last: Page = { entries: ["Last"], nextPage: null };

function consumeWithScope(filter = "all", url = request) {
  const scope = effectScope();
  scopes.push(scope);
  return {
    scope,
    ready: scope.run(() => useInfiniteAPI<typeof request, Page>(url, {
      initialPageParam: 0,
      query: offset => ({ offset, filter }),
      getNextPageParam: page => page.nextPage,
    }))!,
  };
}

function consume(filter = "all") {
  return consumeWithScope(filter).ready;
}

const requestedOffsets = () => fetchPage.mock.calls.map(([, options]) => options.query.offset);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  request = `/test/infinite/${++sequence}`;
  fetchPage.mockReset().mockImplementation(async (_route, options) => options.query.offset === 0 ? first : last);
  useAPI.mockReset().mockImplementation((route, options) => useFetch(route, {
    ...options,
    $fetch: ((request, options) => fetchPage(request, options)) as typeof $fetch,
  }));
});

afterEach(async () => {
  scopes.splice(0).forEach(scope => scope.stop());
  await nextTick();
});

test("uses declared page numbers, query parameters and completion without a domain response shape", async () => {
  const list = await consume();
  expect(list).not.toHaveProperty("loadInitialPage");
  expect(list.data.value?.pages).toEqual([first]);
  expect(list.hasNextPage.value).toBe(true);
  await list.loadMore();
  await list.loadMore();
  expect(list.data.value?.pages).toEqual([first, last]);
  expect(list.hasNextPage.value).toBe(false);
  expect(fetchPage.mock.calls.map(([route, options]) => [route, options.query])).toEqual([
    [request, { offset: 0, filter: "all" }],
    [request, { offset: 7, filter: "all" }],
  ]);
});

test("query conditions separate first-page identities even at the same URL", async () => {
  const all = await consume();
  const filtered = { entries: ["Filtered"], nextPage: null };
  fetchPage.mockResolvedValueOnce(filtered);
  const active = await consume("active");
  expect(all.data.value?.pages).toEqual([first]);
  expect(active.data.value?.pages).toEqual([filtered]);
  await all.refresh();
  expect(active.data.value?.pages).toEqual([filtered]);
  expect(fetchPage.mock.calls.map(([, options]) => options.query.filter)).toEqual(["all", "active", "all"]);
});

test("different endpoints never share accumulated pages or refreshes", async () => {
  const otherRequest = `/test/infinite/${++sequence}` as const;
  const response = (url: string, offset: number): Page => ({
    entries: [`${url}:${offset}`],
    nextPage: offset === 0 ? 7 : null,
  });
  fetchPage.mockImplementation(async (url, options) => response(url, options.query.offset));

  const a = await consume();
  await a.loadMore();
  const b = await consumeWithScope("all", otherRequest).ready;
  await b.refresh();

  expect(a.data.value?.pages).toEqual([response(request, 0), response(request, 7)]);
  expect(b.data.value?.pages).toEqual([response(otherRequest, 0)]);
  expect(fetchPage.mock.calls.map(([url]) => url)).toEqual([
    request, request, otherRequest, otherRequest,
  ]);
});

test("a failed initial read is not an empty success and can be refreshed", async () => {
  fetchPage.mockRejectedValueOnce(new Error("Unavailable"));
  const list = await consume();
  expect(list.data.value).toBeUndefined();
  expect(list.isLoading.value).toBe(false);
  expect(list.hasNextPage.value).toBe(false);
  await list.loadMore();
  expect(fetchPage).toHaveBeenCalledOnce();
  await list.refresh();
  expect(list.data.value?.pages).toEqual([first]);
});

test("the latest overlapping refresh wins even if a cancelled transport settles later", async () => {
  const a = await consume();
  const b = await consume();
  await a.loadMore();
  const stale = deferred<Page>();
  fetchPage.mockReturnValueOnce(stale.promise);
  const refreshing = a.refresh();
  const signal = fetchPage.mock.calls.at(-1)![1].signal;
  const fresh = { entries: ["Fresh"], nextPage: null };
  fetchPage.mockResolvedValueOnce(fresh);
  await b.refresh();
  expect(signal.aborted).toBe(true);
  stale.resolve(first);
  await refreshing;
  expect(a.data.value?.pages).toEqual([fresh]);
  expect(b.data.value?.pages).toEqual([fresh]);
});

test("a failed refresh aborts pending additional pages without discarding existing pages", async () => {
  const a = await consume();
  const b = await consume();
  const pending = deferred<Page>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const loading = a.loadMore();
  const signal = fetchPage.mock.calls.at(-1)![1].signal;
  fetchPage.mockRejectedValueOnce(new Error("Refresh failed"));
  await b.refresh();
  expect(signal.aborted).toBe(true);
  pending.resolve(last);
  await loading;
  expect(a.data.value?.pages).toEqual([first]);
  expect(a.isLoading.value).toBe(false);
  await a.loadMore();
  expect(a.data.value?.pages).toEqual([first, last]);
});

test("concurrent consumers share the initial request and first page", async () => {
  const pending = deferred<Page>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const a = consume();
  const b = consume();
  expect(fetchPage).toHaveBeenCalledOnce();
  pending.resolve(first);
  const [firstConsumer, secondConsumer] = await Promise.all([a, b]);
  expect(firstConsumer.data.value?.pages[0]).toBe(secondConsumer.data.value?.pages[0]);
});

test("late consumers start at the first page without disturbing another view's progress", async () => {
  const a = await consume();
  await a.loadMore();
  const b = await consume();
  expect(a.data.value?.pages).toEqual([first, last]);
  expect(b.data.value?.pages).toEqual([first]);
  expect(requestedOffsets()).toEqual([0, 7]);
});

test("refresh retains accumulated pages while pending and then replaces every consumer's pages", async () => {
  const middle: Page = { entries: ["Middle"], nextPage: 11 };
  fetchPage.mockImplementation(async (_route, options) => {
    if (options.query.offset === 0) return first;
    return options.query.offset === 7 ? middle : last;
  });
  const a = await consume();
  const b = await consume();
  await a.loadMore();
  await a.loadMore();
  await b.loadMore();
  const pending = deferred<Page>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const refreshing = b.refresh();
  expect(a.isLoading.value).toBe(true);
  expect(a.data.value?.pages).toEqual([first, middle, last]);
  await a.loadMore();
  expect(requestedOffsets()).toEqual([0, 7, 11, 7, 0]);
  pending.resolve(first);
  await refreshing;
  expect(a.data.value?.pages).toEqual([first]);
  expect(b.data.value?.pages).toEqual([first]);
  expect(a.isLoading.value).toBe(false);
});

test("a failed refresh preserves each view's pages and a later refresh recovers", async () => {
  const a = await consume();
  const b = await consume();
  await a.loadMore();
  fetchPage.mockRejectedValueOnce(new Error("Refresh failed"));
  await expect(b.refresh()).resolves.toBeUndefined();
  expect(a.data.value?.pages).toEqual([first, last]);
  expect(b.data.value?.pages).toEqual([first]);
  expect(a.isLoading.value).toBe(false);
  await b.refresh();
  expect(a.data.value?.pages).toEqual([first]);
  expect(b.data.value?.pages).toEqual([first]);
});

test("load-more loading and failures are local to the initiating consumer", async () => {
  const a = await consume();
  const b = await consume();
  const pending = deferred<Page>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const loading = a.loadMore();
  expect(a.isLoading.value).toBe(true);
  expect(a.isLoadingMore.value).toBe(true);
  expect(b.isLoading.value).toBe(false);
  await b.loadMore();
  pending.reject(new Error("Page failed"));
  await loading;
  expect(a.data.value?.pages).toEqual([first]);
  expect(b.data.value?.pages).toEqual([first, last]);
  expect(a.isLoading.value).toBe(false);
  await a.loadMore();
  expect(a.data.value?.pages).toEqual([first, last]);
  expect(requestedOffsets()).toEqual([0, 7, 7, 7]);
});

test("deduplicates local load-more calls and stops at the final page", async () => {
  const a = await consume();
  const pending = deferred<Page>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const loading = a.loadMore();
  await a.loadMore();
  expect(requestedOffsets()).toEqual([0, 7]);
  pending.resolve(last);
  await loading;
  await a.loadMore();
  await a.loadMore();
  expect(requestedOffsets()).toEqual([0, 7]);
  expect(a.data.value?.pages).toEqual([first, last]);
  expect(a.hasNextPage.value).toBe(false);
});

test("refresh aborts an older load-more without its settlement disturbing a new one", async () => {
  const a = await consume();
  const b = await consume();
  const stale = deferred<Page>();
  fetchPage.mockReturnValueOnce(stale.promise);
  const loading = a.loadMore();
  const signal = fetchPage.mock.calls.at(-1)![1].signal;
  await b.refresh();
  expect(signal.aborted).toBe(true);
  expect(a.isLoadingMore.value).toBe(false);
  const next = deferred<Page>();
  fetchPage.mockReturnValueOnce(next.promise);
  const nextLoading = a.loadMore();
  stale.resolve(last);
  await loading;
  expect(a.data.value?.pages).toEqual([first]);
  expect(a.isLoadingMore.value).toBe(true);
  next.resolve(last);
  await nextLoading;
  expect(a.data.value?.pages).toEqual([first, last]);
});

test("disposal aborts only local work and a fresh consumer starts at the first page", async () => {
  const initial = consumeWithScope();
  const a = await initial.ready;
  const b = await consume();
  const stale = deferred<Page>();
  fetchPage.mockReturnValueOnce(stale.promise);
  const loading = a.loadMore();
  initial.scope.stop();
  expect(fetchPage.mock.calls.at(-1)![1].signal.aborted).toBe(true);
  await b.loadMore();
  const fresh = await consume();
  stale.resolve(last);
  await loading;
  expect(a.data.value?.pages).toEqual([first]);
  expect(b.data.value?.pages).toEqual([first, last]);
  expect(fresh.data.value?.pages).toEqual([first]);
});

test("disposal does not cancel another consumer's shared refresh", async () => {
  const initial = consumeWithScope();
  const a = await initial.ready;
  const b = await consume();
  const pending = deferred<Page>();
  fetchPage.mockReturnValueOnce(pending.promise);
  const refreshing = a.refresh();
  initial.scope.stop();
  expect(fetchPage.mock.calls.at(-1)![1].signal.aborted).toBe(false);
  pending.resolve(first);
  await refreshing;
  expect(b.data.value?.pages).toEqual([first]);
});

test("reentry after all consumers leave fetches the first page again", async () => {
  const initial = consumeWithScope();
  const a = await initial.ready;
  await a.loadMore();
  initial.scope.stop();
  await nextTick();
  const b = await consume();
  expect(b.data.value?.pages).toEqual([first]);
  expect(requestedOffsets()).toEqual([0, 7, 0]);
});

test("simulated hydration reuses the first-page payload without another transport call", async () => {
  const initial = consumeWithScope();
  await initial.ready;
  initial.scope.stop();
  const nuxtApp = useNuxtApp();
  const wasHydrating = nuxtApp.isHydrating;
  const wasServerRendered = nuxtApp.payload.serverRendered;
  nuxtApp.isHydrating = true;
  nuxtApp.payload.serverRendered = true;
  try {
    const a = await consume();
    const b = await consume();
    expect(a.data.value?.pages).toEqual([first]);
    expect(b.data.value?.pages[0]).toBe(a.data.value?.pages[0]);
    expect(fetchPage).toHaveBeenCalledOnce();
  }
  finally {
    nuxtApp.isHydrating = wasHydrating;
    nuxtApp.payload.serverRendered = wasServerRendered;
  }
});
