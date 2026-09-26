import type { FetchResult, UseFetchOptions } from "#app";

type DiscussionRoute = `/api/discussions/${string}`;

export async function useDiscussion(
  id: MaybeRefOrGetter<string>,
  options?: UseFetchOptions<FetchResult<DiscussionRoute, "get">>,
) {
  return await useAPI(
    () => `/api/discussions/${toValue(id)}`,
    options,
  );
}
