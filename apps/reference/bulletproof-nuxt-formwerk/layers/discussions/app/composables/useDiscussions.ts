import type { PaginatedDiscussions } from "~discussions/shared/types";

export function useDiscussions(params: {
  page?: MaybeRefOrGetter<number>;
  limit?: MaybeRefOrGetter<number>;
} = {}) {
  const { data, status, error, execute, refresh } = useFetch<PaginatedDiscussions>(
    "/api/discussions",
    {
      query: {
        page: computed(() => toValue(params.page)),
        limit: computed(() => toValue(params.limit)),
      },
      default: () => ({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          totalPages: 1,
          total: 0,
        },
      }),
      immediate: false,
    },
  );

  const isPending = computed(() => status.value === "pending");
  const isSuccess = computed(() => status.value === "success");

  return {
    data,
    isPending,
    isSuccess,
    error,
    fetch: execute,
    refresh,
  };
}
