import { nextTick } from "vue";
import { useAPI } from "#layers/base/app/composables/useAPI";

export async function useDiscussions() {
  const currentPage = useState("discussions-current-page", () => 1);
  const limit = 10;

  const { data, refresh, status } = await useAPI(
    "/api/discussions",
    {
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
