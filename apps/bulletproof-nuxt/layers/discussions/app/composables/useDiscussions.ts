import { nextTick } from "vue";
import { useAPI } from "#layers/base/app/composables/useAPI";

const discussionsKey = (page: number) => `discussions:${page}`;

function useDiscussionsCurrentPage() {
  return useState("discussions-current-page", () => 1);
}

export function useDiscussionsSettlement() {
  const currentPage = useDiscussionsCurrentPage();

  const refreshAfterCreate = async () => {
    currentPage.value = 1;
    await nextTick();
    await refreshNuxtData(discussionsKey(currentPage.value)).catch(() => undefined);
  };

  return { refreshAfterCreate };
}

export async function useDiscussions() {
  const currentPage = useDiscussionsCurrentPage();
  const limit = 10;
  const asyncDataKey = computed(() => discussionsKey(currentPage.value));

  const { data, refresh, status } = await useAPI(
    "/api/discussions",
    {
      key: asyncDataKey,
      query: {
        page: currentPage,
        limit,
      },
    },
  );

  const refreshAfterCreate = async () => {
    currentPage.value = 1;
    await nextTick();
    await refresh().catch(() => undefined);
  };

  const refreshAfterDelete = async () => {
    await refresh().catch(() => undefined);

    if (currentPage.value <= 1 || !Array.isArray(data.value?.data) || data.value.data.length > 0) return;

    currentPage.value -= 1;
    await nextTick();
    await refresh().catch(() => undefined);
  };

  return {
    currentPage,
    data,
    refresh,
    refreshAfterCreate,
    refreshAfterDelete,
    status,
  };
}
