import type { TypedInternalResponse } from "nitropack/types";

interface InfiniteAPIOptions<Page> {
  initialPageParam: number;
  query: (page: number) => Record<string, string | number | boolean>;
  getNextPageParam: (lastPage: Page) => number | null;
}

export async function useInfiniteAPI<Request extends string, Page = TypedInternalResponse<Request, unknown, "get">>(
  request: Request,
  options: InfiniteAPIOptions<NoInfer<Page>>,
) {
  const { $api } = useNuxtApp();
  const read = useAPI(request, {
    query: options.query(options.initialPageParam),
    dedupe: "defer",
    transform: (page: Page) => ({ pages: [page] }),
  });
  const data = shallowRef<{ pages: Page[] } | undefined>(read.data.value);
  const pendingPage = shallowRef<AbortController>();
  const isLoadingMore = computed(() => !!pendingPage.value);
  const isLoading = computed(() => read.status.value === "pending" || isLoadingMore.value);
  const nextPageParam = computed(() => {
    const lastPage = data.value?.pages.at(-1);
    return lastPage === undefined ? null : options.getNextPageParam(lastPage);
  });
  const hasNextPage = computed(() => nextPageParam.value !== null);
  const cancelLoadMore = () => {
    pendingPage.value?.abort();
    pendingPage.value = undefined;
  };

  watch([read.data, read.status], ([firstPage, status]) => {
    cancelLoadMore();
    if (status === "success") data.value = firstPage;
  }, { flush: "sync" });
  onScopeDispose(cancelLoadMore);

  const loadMore = async () => {
    const current = data.value;
    const page = nextPageParam.value;
    if (isLoading.value || !current || page === null) return;

    const controller = new AbortController();
    pendingPage.value = controller;
    try {
      const next = await $api<Page, string>(request, {
        query: options.query(page),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) data.value = { pages: [...current.pages, next] };
    }
    catch {
      // The configured API client reports failures; retain the loaded pages.
    }
    finally {
      if (pendingPage.value === controller) pendingPage.value = undefined;
    }
  };
  const refresh = () => read.refresh({ dedupe: "cancel" }).catch(() => undefined);

  await read;

  return {
    data,
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    refresh,
  };
}
