import type { PaginatedResult } from "#layers/base/shared/types/pagination";
import { effectScope, nextTick, ref } from "vue";
import { expect, test, vi } from "vitest";
import { usePaginatedData } from "../usePaginatedData";

interface Item {
  id: string;
}

const page = (pageNumber: number, ids: string[], totalPages = 2): PaginatedResult<Item> => ({
  data: ids.map(id => ({ id })),
  meta: {
    page: pageNumber,
    limit: 10,
    total: ids.length,
    totalPages,
    hasMore: pageNumber < totalPages,
  },
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function createRead(
  initial: PaginatedResult<Item> | undefined,
  request: () => Promise<PaginatedResult<Item>>,
) {
  const data = ref(initial);
  const status = ref<"idle" | "pending" | "success" | "error">(initial ? "success" : "idle");
  const refresh = vi.fn(async () => {
    status.value = "pending";
    try {
      data.value = await request();
      status.value = "success";
    }
    catch {
      data.value = undefined;
      status.value = "error";
    }
  });
  const clear = vi.fn();

  return { data, status, refresh, clear };
}

test("append strategy keeps page one and appends later pages", async () => {
  const currentPage = ref(1);
  const read = createRead(page(1, ["one"]), async () => page(currentPage.value, ["two"], 1));
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "append",
    page: currentPage,
  }))!;

  await state.loadMore();

  expect(state.data.value?.data).toEqual([{ id: "one" }, { id: "two" }]);
  expect(state.data.value?.meta.page).toBe(2);
  expect(currentPage.value).toBe(2);
  scope.stop();
});

test("append strategy does not append an already loaded page twice", async () => {
  const currentPage = ref(2);
  const read = createRead(page(2, ["one", "two"]), async () => page(2, ["two"]));
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "append",
    page: currentPage,
  }))!;

  await state.refresh();

  expect(state.data.value?.data).toEqual([{ id: "one" }, { id: "two" }]);
  scope.stop();
});

test("append strategy preserves accumulated rows when a later page fails", async () => {
  const currentPage = ref(1);
  const read = createRead(page(1, ["one"]), async () => {
    throw new Error("Request failed");
  });
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "append",
    page: currentPage,
  }))!;

  await state.loadMore();

  expect(state.data.value?.data).toEqual([{ id: "one" }]);
  expect(state.data.value?.meta.page).toBe(1);
  expect(state.status.value).toBe("error");
  scope.stop();
});

test("tracks an automatic lazy refresh after cached data is reused", async () => {
  const currentPage = ref(1);
  const read = createRead(page(1, ["cached"]), async () => page(1, ["fresh"]));
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "append",
    page: currentPage,
  }))!;

  read.status.value = "pending";
  read.data.value = page(1, ["fresh"]);
  read.status.value = "success";

  expect(state.data.value?.data).toEqual([{ id: "fresh" }]);
  expect(state.status.value).toBe("success");
  scope.stop();
});

test("replace strategy keeps existing rows while refresh is pending", async () => {
  const currentPage = ref(1);
  const pending = deferred<PaginatedResult<Item>>();
  const read = createRead(page(1, ["existing"]), () => pending.promise);
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "replace",
    page: currentPage,
  }))!;

  const refresh = state.refresh();

  expect(state.status.value).toBe("pending");
  expect(state.isLoading.value).toBe(true);
  expect(state.data.value?.data).toEqual([{ id: "existing" }]);

  pending.resolve(page(1, ["refreshed"], 1));
  await refresh;

  expect(state.status.value).toBe("success");
  expect(state.isLoading.value).toBe(false);
  expect(state.data.value?.data).toEqual([{ id: "refreshed" }]);
  scope.stop();
});

test("replace strategy clamps an out-of-range initial response", async () => {
  const currentPage = ref(3);
  const requestedPages: number[] = [];
  const read = createRead(page(3, [], 2), async () => {
    requestedPages.push(currentPage.value);
    return page(2, ["last-valid-page"], 2);
  });
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "replace",
    page: currentPage,
  }))!;

  await vi.waitFor(() => expect(state.data.value?.meta.page).toBe(2));

  expect(requestedPages).toEqual([2]);
  expect(currentPage.value).toBe(2);
  expect(state.data.value?.data).toEqual([{ id: "last-valid-page" }]);
  scope.stop();
});

test("replace strategy clamps an out-of-range response to the last valid page", async () => {
  const currentPage = ref(3);
  const requestedPages: number[] = [];
  const read = createRead(page(3, ["existing-page-three"], 3), async () => {
    const requestedPage = currentPage.value;
    requestedPages.push(requestedPage);
    return requestedPage === 3
      ? page(3, [], 2)
      : page(2, ["last-valid-page"], 2);
  });
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "replace",
    page: currentPage,
  }))!;

  await state.refresh();

  expect(requestedPages).toEqual([3, 2]);
  expect(currentPage.value).toBe(2);
  expect(state.status.value).toBe("success");
  expect(state.data.value?.meta.page).toBe(2);
  expect(state.data.value?.data).toEqual([{ id: "last-valid-page" }]);
  scope.stop();
});

test("a newer page releases a refresh waiting on a superseded clamp target", async () => {
  const currentPage = ref(3);
  const pageThree = deferred<PaginatedResult<Item>>();
  const pageTwo = deferred<PaginatedResult<Item>>();
  const pageOne = deferred<PaginatedResult<Item>>();
  const requestedPages: number[] = [];
  const read = createRead(page(3, ["existing-page-three"], 3), () => {
    const requestedPage = currentPage.value;
    requestedPages.push(requestedPage);
    if (requestedPage === 3) return pageThree.promise;
    if (requestedPage === 2) return pageTwo.promise;
    return pageOne.promise;
  });
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "replace",
    page: currentPage,
  }))!;

  let originalRefreshSettled = false;
  const originalRefresh = state.refresh().then(() => {
    originalRefreshSettled = true;
  });
  pageThree.resolve(page(3, [], 2));
  await vi.waitFor(() => expect(requestedPages).toEqual([3, 2]));

  const latestRequest = state.loadPage(1);
  pageOne.resolve(page(1, ["current-page-one"], 1));
  await latestRequest;

  await vi.waitFor(() => expect(originalRefreshSettled).toBe(true));
  expect(state.data.value?.meta.page).toBe(1);
  expect(state.data.value?.data).toEqual([{ id: "current-page-one" }]);

  pageTwo.resolve(page(2, ["obsolete-page-two"], 2));
  await originalRefresh;
  expect(state.data.value?.meta.page).toBe(1);
  scope.stop();
});

test("disposal releases a refresh waiting on a pending clamp target", async () => {
  const currentPage = ref(3);
  const pageThree = deferred<PaginatedResult<Item>>();
  const pendingPageTwo = deferred<PaginatedResult<Item>>();
  const requestedPages: number[] = [];
  const read = createRead(page(3, ["existing-page-three"], 3), () => {
    requestedPages.push(currentPage.value);
    return currentPage.value === 3 ? pageThree.promise : pendingPageTwo.promise;
  });
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "replace",
    page: currentPage,
  }))!;

  let refreshSettled = false;
  const refresh = state.refresh().then(() => {
    refreshSettled = true;
  });
  pageThree.resolve(page(3, [], 2));
  await vi.waitFor(() => expect(requestedPages).toEqual([3, 2]));

  scope.stop();

  await vi.waitFor(() => expect(refreshSettled).toBe(true));
  await refresh;
});

test("an obsolete resource response cannot replace the current resource", async () => {
  const resource = ref("a");
  const currentPage = ref(1);
  const oldPage = deferred<PaginatedResult<Item>>();
  const currentResource = deferred<PaginatedResult<Item>>();
  const read = createRead(page(1, ["a-one"]), async () => {
    const requestResource = resource.value;
    return requestResource === "a" ? oldPage.promise : currentResource.promise;
  });
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "append",
    page: currentPage,
    resourceKey: resource,
  }))!;

  const obsoleteLoad = state.loadMore();
  resource.value = "b";
  currentResource.resolve(page(1, ["b-one"], 1));
  await vi.waitFor(() => expect(state.data.value?.data).toEqual([{ id: "b-one" }]));

  oldPage.resolve(page(2, ["a-two"]));
  await obsoleteLoad;
  await nextTick();

  expect(state.data.value?.data).toEqual([{ id: "b-one" }]);
  scope.stop();
});

test("scope disposal invalidates active work without clearing shared AsyncData", async () => {
  const pending = deferred<PaginatedResult<Item>>();
  const currentPage = ref(1);
  const read = createRead(page(1, ["one"]), () => pending.promise);
  const scope = effectScope();
  const state = scope.run(() => usePaginatedData(read, {
    strategy: "replace",
    page: currentPage,
  }))!;

  const request = state.refresh();
  expect(state.isLoading.value).toBe(true);
  scope.stop();

  expect(read.clear).not.toHaveBeenCalled();
  expect(state.isLoading.value).toBe(false);
  pending.resolve(page(1, ["late"]));
  await request;
  expect(state.data.value?.data).toEqual([{ id: "one" }]);
});
