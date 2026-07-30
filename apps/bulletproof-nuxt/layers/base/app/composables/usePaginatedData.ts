import type { Ref } from "vue";
import type { PaginatedResult } from "#layers/base/shared/types/pagination";

type PaginationStrategy = "replace" | "append";
type RequestStatus = "idle" | "pending" | "success" | "error";

interface PaginatedAsyncData<T> {
  data: Ref<PaginatedResult<T> | undefined>;
  status: Ref<RequestStatus>;
  refresh: (options?: { dedupe?: "cancel" | "defer" }) => Promise<unknown>;
}

interface PaginatedDataOptions {
  strategy: PaginationStrategy;
  page: Ref<number>;
  resourceKey?: MaybeRefOrGetter<string>;
}

export function usePaginatedData<T>(
  read: PaginatedAsyncData<T>,
  options: PaginatedDataOptions,
) {
  const data = shallowRef<PaginatedResult<T> | undefined>(read.data.value);
  const status = ref<RequestStatus>(read.status.value);
  const isLoading = computed(() => status.value === "pending");
  let generation = 0;
  let internalRequestCount = 0;
  let isDisposed = false;
  let activeRequest: {
    generation: number;
    promise: Promise<void>;
    superseded: Promise<void>;
    supersede: () => void;
  } | undefined;

  const getResourceKey = () => options.resourceKey === undefined
    ? undefined
    : toValue(options.resourceKey);

  const isCurrentRequest = (requestGeneration: number, resourceKey: string | undefined) => {
    return !isDisposed
      && requestGeneration === generation
      && resourceKey === getResourceKey();
  };

  const commit = (response: PaginatedResult<T>) => {
    if (options.strategy === "append" && response.meta.page > 1 && data.value) {
      if (response.meta.page <= data.value.meta.page) return;

      data.value = {
        data: [...data.value.data, ...response.data],
        meta: response.meta,
      };
      return;
    }

    data.value = response;
  };

  const clampPage = (response: PaginatedResult<T>) => {
    const lastPage = Math.max(response.meta.totalPages, 1);
    if (options.strategy !== "replace" || options.page.value <= lastPage) return false;

    options.page.value = lastPage;
    return true;
  };

  const requestPage = (): Promise<void> => {
    if (isDisposed) return Promise.resolve();

    const requestGeneration = ++generation;
    const resourceKey = getResourceKey();
    status.value = "pending";

    const execute = async () => {
      internalRequestCount++;
      try {
        await read.refresh({ dedupe: "cancel" });

        if (!isCurrentRequest(requestGeneration, resourceKey)) return;

        if (
          read.status.value === "error"
          || !read.data.value
          || !Array.isArray(read.data.value.data)
          || !read.data.value.meta
        ) {
          if (options.strategy === "replace") {
            data.value = undefined;
          }
          status.value = "error";
          return;
        }

        if (clampPage(read.data.value)) return;

        commit(read.data.value);
        status.value = "success";
      }
      finally {
        if (isCurrentRequest(requestGeneration, resourceKey) && status.value === "pending") {
          status.value = read.status.value;
        }
        internalRequestCount--;
      }
    };

    const settlement = execute()
      .then(async () => {
        let latestRequest = activeRequest;
        while (
          !isDisposed
          && latestRequest
          && latestRequest.generation !== requestGeneration
        ) {
          await Promise.race([latestRequest.promise, latestRequest.superseded]);
          latestRequest = activeRequest;
        }
      })
      .finally(() => {
        if (activeRequest?.generation === requestGeneration) {
          activeRequest = undefined;
        }
      });
    let supersede!: () => void;
    const superseded = new Promise<void>((resolve) => {
      supersede = resolve;
    });
    activeRequest?.supersede();
    activeRequest = { generation: requestGeneration, promise: settlement, superseded, supersede };

    return settlement;
  };

  const loadPage = (page: number): Promise<void> => {
    if (isDisposed) return Promise.resolve();

    if (options.page.value === page) {
      return requestPage();
    }

    options.page.value = page;
    return activeRequest?.promise ?? Promise.resolve();
  };

  const loadMore = () => {
    if (isLoading.value || !data.value?.meta.hasMore) return Promise.resolve();
    return loadPage(data.value.meta.page + 1);
  };

  watch(
    options.page,
    () => void requestPage(),
    { flush: "sync" },
  );

  watch(
    [read.data, read.status],
    ([response, readStatus]) => {
      if (isDisposed || internalRequestCount > 0) return;

      status.value = readStatus;
      const hasPage = response && Array.isArray(response.data) && response.meta;
      if (readStatus === "success" && hasPage) {
        if (clampPage(response)) return;
        commit(response);
      }
      else if (readStatus === "error" && options.strategy === "replace") {
        data.value = undefined;
      }
    },
    { immediate: true, flush: "sync" },
  );

  if (options.resourceKey !== undefined) {
    watch(
      () => getResourceKey(),
      () => {
        if (isDisposed) return;

        generation++;
        data.value = undefined;
        status.value = "idle";

        if (options.page.value === 1) {
          void requestPage();
        }
        else {
          options.page.value = 1;
        }
      },
      { flush: "sync" },
    );
  }

  onScopeDispose(() => {
    isDisposed = true;
    generation++;
    activeRequest?.supersede();
    activeRequest = undefined;
    status.value = "idle";
  });

  return {
    data,
    status,
    isLoading,
    loadPage,
    loadMore,
    refresh: () => requestPage(),
  };
}
