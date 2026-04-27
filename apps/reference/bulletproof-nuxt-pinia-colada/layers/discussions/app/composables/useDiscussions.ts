import type { PaginatedDiscussions } from "~discussions/shared/types";
import { useQuery } from "@pinia/colada";

export function useDiscussions(params: {
  page?: MaybeRefOrGetter<number>;
  limit?: MaybeRefOrGetter<number>;
} = {}) {
  const { $api } = useNuxtApp();
  const queryString = computed(() => {
    const query = new URLSearchParams();
    const page = toValue(params.page);
    const limit = toValue(params.limit);
    if (page) query.set("page", page.toString());
    if (limit) query.set("limit", limit.toString());
    return query.toString();
  });

  const { data, error, isPending } = useQuery({
    key: () => ["discussions", queryString.value],
    query: () => $api<PaginatedDiscussions>(`/api/discussions?${queryString.value}`),
  });

  return {
    data,
    isPending,
    error,
  };
}
