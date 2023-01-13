import { useQuery } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import type { ExtractFnReturnType, QueryConfig } from "@/lib/vue-query";

import type { Comment } from "@/types";

export const getComments = ({
  discussionId,
}: {
  discussionId: string;
}): Promise<Comment[]> => {
  return axios.get(`/comments`, {
    params: {
      discussionId,
    },
  });
};

type QueryFnType = typeof getComments;

type UseCommentsOptions = {
  discussionId: string;
  config?: QueryConfig<QueryFnType>;
};

export const useComments = ({ discussionId, config }: UseCommentsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ["comments", discussionId],
    queryFn: () => getComments({ discussionId }),
    ...config,
  });
};
