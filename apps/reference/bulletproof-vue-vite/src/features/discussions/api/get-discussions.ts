import { queryOptions, useQuery } from '@tanstack/vue-query';

import { api } from '@/lib/api-client';
import type { QueryConfig } from '@/lib/vue-query';
import type { Discussion, Meta } from '@/types/api';

export const getDiscussions = (
  page = 1,
): Promise<{
  data: Discussion[];
  meta: Meta;
}> => {
  return api.get(`/discussions`, {
    params: {
      page,
    },
  });
};

export const getDiscussionsQueryOptions = ({
  page,
}: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['discussions', { page }] : ['discussions'],
    queryFn: () => getDiscussions(page),
  });
};

type UseDiscussionsOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getDiscussionsQueryOptions>;
};

export const useDiscussions = ({
  queryConfig,
  page,
}: UseDiscussionsOptions = {}) => {
  return useQuery({
    ...getDiscussionsQueryOptions({ page }),
    ...queryConfig,
  });
};
