import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { effectScope, nextTick, reactive } from "vue";
import { clearNuxtData, useFetch } from "#app";
import type { LocationQuery } from "vue-router";
import { usePaginatedAPI } from "~~/app/composables/usePaginatedAPI";

const { useAPI, fetchPage, navigate } = vi.hoisted(() => ({
  useAPI: vi.fn(), fetchPage: vi.fn(), navigate: vi.fn(),
}));
vi.mock("~~/app/composables/useAPI", () => ({ useAPI }));
mockNuxtImport("useRoute", () => () => route);
mockNuxtImport("navigateTo", () => navigate);

// Nuxt useFetch runs, but app useAPI, router transitions and transport are replaced.
const route = reactive({ path: "/app/records", query: {} as LocationQuery, hash: "" });
const scopes: ReturnType<typeof effectScope>[] = [];

function response(page: number, entries = [{ id: `entry-${page}`, label: `Batch ${page}` }]) {
  return { entries, batch: page };
}

type Page = ReturnType<typeof response>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function consume(request = "/api/records") {
  const scope = effectScope();
  scopes.push(scope);
  return { scope, ready: scope.run(() => usePaginatedAPI<string, Page>(request, {
    query: page => ({ batch: page, size: 7 }),
    isEmpty: page => page.entries.length === 0,
  }))! };
}

const requestedPages = () => fetchPage.mock.calls.map(([, options]) => options.query.batch);

beforeEach(() => {
  clearNuxtData();
  route.query = {};
  route.hash = "";
  navigate.mockReset().mockImplementation(async (location) => {
    route.query = Object.fromEntries(Object.entries(location.query).filter(([, value]) => value !== undefined)) as LocationQuery;
    route.hash = location.hash;
    await nextTick();
  });
  fetchPage.mockReset().mockImplementation(async (_request, options) => response(options.query.batch));
  useAPI.mockReset().mockImplementation((request, options) => useFetch(request, {
    ...options,
    $fetch: ((request, options) => fetchPage(request, {
      ...options, query: { ...options?.query },
    })) as typeof $fetch,
  }));
});

afterEach(async () => {
  scopes.splice(0).forEach(scope => scope.stop());
  await nextTick();
});

test("reads the URL page through the supplied endpoint and query", async () => {
  route.query = { page: "3" };
  const result = await consume().ready;

  expect(result.currentPage.value).toBe(3);
  expect(requestedPages()).toEqual([3]);
  expect(fetchPage.mock.calls[0]![0]).toBe("/api/records");
  expect(fetchPage.mock.calls[0]![1].query).toEqual({ batch: 3, size: 7 });
  expect(result.data.value).toEqual(response(3));
  expect(navigate).not.toHaveBeenCalled();
});

test.each([
  { name: "a missing page", page: undefined },
  { name: "zero", page: "0" },
  { name: "a negative page", page: "-1" },
  { name: "a fractional page", page: "2.5" },
  { name: "a non-numeric page", page: "oops" },
  { name: "an unsafe integer", page: "9007199254740992" },
  { name: "a non-string numeric array", page: ["2"] },
])(
  "uses page one for $name", async ({ page }) => {
    route.query = page === undefined ? {} : { page };
    const result = await consume().ready;
    expect(result.currentPage.value).toBe(1);
    expect(requestedPages()).toEqual([1]);
  },
);

test("independent consumers share the URL and requests, without a local page source", async () => {
  const initial = deferred<ReturnType<typeof response>>();
  fetchPage.mockReturnValueOnce(initial.promise);
  const first = consume();
  const second = consume();
  expect(requestedPages()).toEqual([1]);
  initial.resolve(response(1));
  const [a, b] = await Promise.all([first.ready, second.ready]);

  const nextPage = deferred<ReturnType<typeof response>>();
  fetchPage.mockReturnValueOnce(nextPage.promise);
  await a.setPage(2);
  expect(route.query.page).toBe("2");
  expect(a.currentPage.value).toBe(2);
  expect(b.currentPage.value).toBe(2);
  expect(requestedPages()).toEqual([1, 2]);
  nextPage.resolve(response(2));
  await vi.waitFor(() => expect(b.data.value).toEqual(response(2)));
  expect(a.data.value).toBe(b.data.value);

  route.query = { page: "3" };
  await vi.waitFor(() => expect(a.data.value).toEqual(response(3)));
  expect(b.currentPage.value).toBe(3);
});

test("page navigation preserves other query parameters and the hash, and omits page one", async () => {
  route.query = { page: "2", filter: "active" };
  route.hash = "#queue";
  const result = await consume().ready;
  await result.setPage(3);
  expect(navigate).toHaveBeenLastCalledWith({
    path: "/app/records", query: { page: "3", filter: "active" }, hash: "#queue",
  });
  await result.setPage(1);
  expect(route.query).toEqual({ filter: "active" });
  expect(route.hash).toBe("#queue");
});

test("creation returns both consumers to page one and awaits its new read", async () => {
  const a = await consume().ready;
  const b = await consume().ready;
  await a.setPage(3);
  await vi.waitFor(() => expect(a.data.value).toEqual(response(3)));
  fetchPage.mockClear();
  const refreshed = deferred<ReturnType<typeof response>>();
  fetchPage.mockReturnValue(refreshed.promise);
  let settled = false;
  const refresh = b.refreshAfterCreate().then(() => {
    settled = true;
  });
  await nextTick();
  expect(route.query.page).toBeUndefined();
  expect(settled).toBe(false);
  const created = response(1, [{ id: "created", label: "Created" }]);
  refreshed.resolve(created);
  await refresh;
  expect(a.currentPage.value).toBe(1);
  expect(a.data.value).toEqual(created);
  expect(b.data.value).toEqual(created);
  expect(requestedPages()).toEqual([1]);
});

test("creation on page one refreshes without navigating", async () => {
  const result = await consume().ready;
  const created = response(1, [{ id: "created", label: "Created" }]);
  fetchPage.mockResolvedValueOnce(created);
  await result.refreshAfterCreate();
  expect(navigate).not.toHaveBeenCalled();
  expect(result.data.value).toEqual(created);
  expect(requestedPages()).toEqual([1, 1]);
});

test("a failed post-create refresh still settles the completed mutation", async () => {
  route.query = { page: "3" };
  const result = await consume().ready;
  fetchPage.mockRejectedValue(new Error("Refresh failed"));
  await expect(result.refreshAfterCreate()).resolves.toBeUndefined();
  expect(result.currentPage.value).toBe(1);
  expect(result.status.value).toBe("error");
});

test("deletion moves the URL back when the current page becomes empty", async () => {
  route.query = { page: "2" };
  const result = await consume().ready;
  fetchPage.mockImplementation(async (_request, options) => response(options.query.batch, options.query.batch === 2 ? [] : undefined));
  await result.refreshAfterDelete();
  expect(route.query.page).toBeUndefined();
  expect(result.currentPage.value).toBe(1);
  expect(result.data.value).toEqual(response(1));
});

test.each([1, 2])("deletion does not navigate away from a populated page %i", async (page) => {
  route.query = { page: String(page) };
  const result = await consume().ready;
  await result.refreshAfterDelete();
  expect(result.currentPage.value).toBe(page);
  expect(navigate).not.toHaveBeenCalled();
  expect(requestedPages()).toEqual([page, page]);
});

test("deletion keeps page one when the list becomes empty", async () => {
  const result = await consume().ready;
  fetchPage.mockResolvedValueOnce(response(1, []));
  await result.refreshAfterDelete();
  expect(result.currentPage.value).toBe(1);
  expect(result.data.value?.entries).toEqual([]);
  expect(navigate).not.toHaveBeenCalled();
});

test("a failed post-delete refresh does not move to a previous page", async () => {
  route.query = { page: "2" };
  const result = await consume().ready;
  fetchPage.mockRejectedValueOnce(new Error("Refresh failed"));
  await expect(result.refreshAfterDelete()).resolves.toBeUndefined();
  expect(result.currentPage.value).toBe(2);
  expect(navigate).not.toHaveBeenCalled();
});

test("different endpoints do not share reads or refreshes", async () => {
  fetchPage.mockImplementation(async (request, options) => response(options.query.batch, [{ id: request, label: request }]));
  const a = await consume("/api/records").ready;
  const b = await consume("/api/tasks").ready;
  await b.refresh();
  expect(a.data.value?.entries).toEqual([{ id: "/api/records", label: "/api/records" }]);
  expect(b.data.value?.entries).toEqual([{ id: "/api/tasks", label: "/api/tasks" }]);
  expect(fetchPage.mock.calls.map(([request, options]) => [request, options.query])).toEqual([
    ["/api/records", { batch: 1, size: 7 }],
    ["/api/tasks", { batch: 1, size: 7 }],
    ["/api/tasks", { batch: 1, size: 7 }],
  ]);
});
