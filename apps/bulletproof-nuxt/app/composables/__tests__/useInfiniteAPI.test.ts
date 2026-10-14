import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { effectScope, nextTick } from "vue";
import { useFetch, type useNuxtApp } from "#app";
import { useInfiniteAPI } from "../useInfiniteAPI";

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

function consume(filter = "all") {
  const scope = effectScope();
  scopes.push(scope);
  return scope.run(() => useInfiniteAPI<typeof request, Page>(request, {
    initialPageParam: 0,
    query: offset => ({ offset, filter }),
    getNextPageParam: page => page.nextPage,
  }))!;
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
