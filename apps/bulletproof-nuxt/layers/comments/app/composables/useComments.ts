import type { Comment } from "~comments/shared/types";
import { useAPI } from "#layers/base/app/composables/useAPI";
import { usePaginatedData } from "#layers/base/app/composables/usePaginatedData";

export async function useComments(discussionId: MaybeRefOrGetter<string>) {
  const page = ref(1);
  const limit = 10;
  const resourceKey = computed(() => toValue(discussionId));
  const read = useAPI("/api/comments", {
    query: {
      discussionId: resourceKey,
      page,
      limit,
    },
    watch: false,
  });
  const pagination = usePaginatedData<Comment>(read, {
    strategy: "append",
    page,
    resourceKey,
  });

  await read;

  const isInitialReady = computed(() => pagination.data.value !== undefined);
  const hasInitialError = computed(() => {
    return !isInitialReady.value && pagination.status.value === "error";
  });

  return {
    comments: computed(() => pagination.data.value?.data ?? []),
    currentPage: computed(() => pagination.data.value?.meta.page ?? 1),
    hasInitialError,
    totalPages: computed(() => pagination.data.value?.meta.totalPages ?? 0),
    hasMore: computed(() => pagination.data.value?.meta.hasMore ?? false),
    isInitialReady,
    isLoading: pagination.isLoading,
    refreshFirstPage: () => pagination.loadPage(1),
    loadMore: pagination.loadMore,
  };
}
