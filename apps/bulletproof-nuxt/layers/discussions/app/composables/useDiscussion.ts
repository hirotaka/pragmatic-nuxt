import type { FetchResult, UseFetchOptions } from "#app";
import { useAPI } from "#layers/base/app/composables/useAPI";

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
