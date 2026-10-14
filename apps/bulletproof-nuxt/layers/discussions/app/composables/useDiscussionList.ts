export async function useDiscussionList() {
  const route = useRoute();
  const currentPage = computed(() => {
    const page = typeof route.query.page === "string" ? Number(route.query.page) : Number.NaN;
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
  });
  const limit = 10;

  const { data, refresh, status } = await useAPI(
    "/api/discussions",
    {
      query: {
        page: currentPage,
        limit,
      },
      dedupe: "defer",
    },
  );

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

    if (currentPage.value <= 1 || !Array.isArray(data.value?.items) || data.value.items.length > 0) return;

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
