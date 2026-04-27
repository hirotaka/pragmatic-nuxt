import type { PaginatedComments } from "~comments/shared/types";
import { useInfiniteQuery } from "@pinia/colada";

export function useComments(discussionId: MaybeRefOrGetter<string>) {
  const { $api } = useNuxtApp();
  const id = computed(() => toValue(discussionId));

  const {
    data,
    error,
    isPending,
    loadNextPage,
    hasNextPage,
    asyncStatus,
  } = useInfiniteQuery({
    key: () => ["comments", id.value],
    query: ({ pageParam }) =>
      $api<PaginatedComments>(
        `/api/comments?discussionId=${id.value}&page=${pageParam}`,
      ),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined,
  });

  const isFetchingNextPage = computed(() => asyncStatus.value === "loading");
  const comments = computed(
    () => data.value?.pages.flatMap(page => page.data) ?? [],
  );

  return {
    data,
    comments,
    isPending,
    error,
    loadNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
