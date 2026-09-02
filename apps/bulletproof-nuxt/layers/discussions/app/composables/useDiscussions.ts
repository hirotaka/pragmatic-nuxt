import { useAPI } from "#layers/base/app/composables/useAPI";

export async function useDiscussions(params: {
  page?: MaybeRefOrGetter<number>;
  limit?: MaybeRefOrGetter<number>;
} = {}) {
  const page = computed(() => toValue(params.page) ?? 1);
  const limit = computed(() => toValue(params.limit) ?? 10);

  return await useAPI(
    "/api/discussions",
    {
      query: {
        page,
        limit,
      },
    },
  );
}
