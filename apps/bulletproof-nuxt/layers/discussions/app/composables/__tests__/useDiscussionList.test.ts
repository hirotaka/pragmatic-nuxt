import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { effectScope, nextTick, reactive } from "vue";
import { clearNuxtData, useFetch } from "#app";
import type { LocationQuery } from "vue-router";
import { useDiscussionList } from "../useDiscussionList";

const { useAPI, fetchPage, navigate } = vi.hoisted(() => ({
  useAPI: vi.fn(), fetchPage: vi.fn(), navigate: vi.fn(),
}));
vi.mock("~~/app/composables/useAPI", () => ({ useAPI }));
mockNuxtImport("useRoute", () => () => route);
mockNuxtImport("navigateTo", () => navigate);

// Router transitions and transport are mocked; Nuxt owns query watching and AsyncData sharing.
const route = reactive({ path: "/app/discussions", query: {} as LocationQuery, hash: "" });
const scopes: ReturnType<typeof effectScope>[] = [];

function response(page: number, items = [{ id: `discussion-${page}`, title: `Page ${page}` }]) {
  return { items, meta: { page, limit: 10, total: 21, totalPages: 3, hasMore: page < 3 } };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function consume() {
  const scope = effectScope();
  scopes.push(scope);
  return { scope, ready: scope.run(() => useDiscussionList())! };
}

const requestedPages = () => fetchPage.mock.calls.map(([, options]) => options.query.page);

beforeEach(() => {
  clearNuxtData();
  route.query = {};
  route.hash = "";
  navigate.mockReset().mockImplementation(async (location) => {
    route.query = Object.fromEntries(Object.entries(location.query).filter(([, value]) => value !== undefined)) as LocationQuery;
    route.hash = location.hash;
    await nextTick();
  });
  fetchPage.mockReset().mockImplementation(async (_request, options) => response(options.query.page));
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

test("acquires the URL page with the native generated API identity", async () => {
  route.query = { page: "3" };
  const result = await consume().ready;

  expect(result.currentPage.value).toBe(3);
  expect(requestedPages()).toEqual([3]);
  expect(fetchPage.mock.calls[0]![0]).toBe("/api/discussions");
  expect(fetchPage.mock.calls[0]![1].query).toEqual({ page: 3, limit: 10 });
  expect(useAPI.mock.calls[0]![1]).not.toHaveProperty("key");
  expect(result.data.value).toEqual(response(3));
  expect(navigate).not.toHaveBeenCalled();
});

test.each([undefined, null, "", "0", "-1", "1.5", "oops", "9007199254740992", ["2", "3"]])(
  "uses page one for a missing or invalid URL page: %j", async (page) => {
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
    path: "/app/discussions", query: { page: "3", filter: "active" }, hash: "#queue",
  });
  await result.setPage(1);
  expect(route.query).toEqual({ filter: "active" });
  expect(route.hash).toBe("#queue");
});

test("a plain list entry does not remember the previous visit's page", async () => {
  route.query = { page: "3" };
  const previous = consume();
  await previous.ready;
  previous.scope.stop();
  route.query = {};
  const next = await consume().ready;
  expect(next.currentPage.value).toBe(1);
  expect(next.data.value).toEqual(response(1));
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
  const created = response(1, [{ id: "created", title: "Created" }]);
  refreshed.resolve(created);
  await refresh;
  expect(a.currentPage.value).toBe(1);
  expect(a.data.value).toEqual(created);
  expect(b.data.value).toEqual(created);
  expect(requestedPages()).toEqual([1]);
});

test("creation on page one refreshes without navigating", async () => {
  const result = await consume().ready;
  const created = response(1, [{ id: "created", title: "Created" }]);
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
  fetchPage.mockImplementation(async (_request, options) => response(options.query.page, options.query.page === 2 ? [] : undefined));
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
  expect(result.data.value?.items).toEqual([]);
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
