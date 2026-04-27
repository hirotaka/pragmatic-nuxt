import type { Discussion } from "~discussions/shared/types";
import { useQuery } from "@pinia/colada";

export function useDiscussion(id: MaybeRefOrGetter<string>) {
  const { $api } = useNuxtApp();
  const discussionId = computed(() => toValue(id));

  const { data: rawData, error, isPending } = useQuery({
    key: () => ["discussions", discussionId.value],
    query: () => $api<{ discussion: Discussion }>(`/api/discussions/${discussionId.value}`),
  });

  const data = computed(() => rawData.value?.discussion ?? null);

  return {
    data,
    isPending,
    error,
  };
}
