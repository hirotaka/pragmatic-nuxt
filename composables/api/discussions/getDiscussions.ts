import { useQuery } from "@tanstack/vue-query";

import type { Discussion } from "@/types";

import { axios } from "@/utils/axios";
import type { ExtractFnReturnType, QueryConfig } from "@/utils/vue-query";

export const getDiscussions = (): Promise<Discussion[]> => {
  return axios.get("/discussions");
};

type QueryFnType = typeof getDiscussions;

type UseDiscussionsOptions = {
  config?: QueryConfig<QueryFnType>;
};

export const useDiscussions = ({ config }: UseDiscussionsOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ["discussions"],
    queryFn: () => getDiscussions(),
  });
};
