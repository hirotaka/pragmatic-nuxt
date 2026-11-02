import type { TypedInternalResponse } from "nitropack/types";

interface PaginatedAPIOptions<Page> {
  query: (page: number) => Record<string, string | number | boolean>;
  isEmpty: (page: Page) => boolean;
}

export async function usePaginatedAPI<Request extends string, Page = TypedInternalResponse<Request, unknown, "get">>(
  request: Request,
  options: PaginatedAPIOptions<NoInfer<Page>>,
) {
  const route = useRoute();
  const currentPage = computed(() => {
    const page = typeof route.query.page === "string" ? Number(route.query.page) : Number.NaN;
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
  });

  const { data, refresh, status } = await useAPI<Page>(request, {
    query: computed(() => options.query(currentPage.value)),
    dedupe: "defer",
  });

  const setPage = (page: number) => navigateTo({
    path: route.path,
    query: { ...route.query, page: page === 1 ? undefined : String(page) },
    hash: route.hash,
  });

  const refreshAfterCreate = async () => {
    const changesPage = currentPage.value !== 1;
    if (changesPage) await setPage(1);
    await refresh({ dedupe: changesPage ? "defer" : "cancel" }).catch(() => undefined);
  };

  const refreshAfterDelete = async () => {
    await refresh({ dedupe: "cancel" }).catch(() => undefined);

    // No pick or transform is applied, so Nuxt's generic PickFrom preserves Page.
    if (currentPage.value <= 1 || data.value == null || !options.isEmpty(data.value as Page)) return;

    await setPage(currentPage.value - 1);
    await refresh({ dedupe: "defer" }).catch(() => undefined);
  };

  return {
    currentPage,
    setPage,
    data,
    refresh,
    refreshAfterCreate,
    refreshAfterDelete,
    status,
  };
}
