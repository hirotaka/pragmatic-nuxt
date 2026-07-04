import type { Discussion } from "~discussions/shared/types";

export function useDiscussion(id: MaybeRefOrGetter<string>) {
  const discussionId = computed(() => toValue(id));

  const { data, status, error, execute, refresh } = useFetch<{
    discussion: Discussion;
  }>(() => `/api/discussions/${discussionId.value}`, {
    default: () => ({
      discussion: {
        id: "",
        title: "",
        body: "",
        authorId: "",
        teamId: "",
        createdAt: new Date(0),
        updatedAt: new Date(0),
        author: {
          id: "",
          firstName: "",
          lastName: "",
        },
      },
    }),
    immediate: false,
  });

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
