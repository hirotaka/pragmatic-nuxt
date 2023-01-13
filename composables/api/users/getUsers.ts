import { useQuery } from "@tanstack/vue-query";

import { axios } from "@/utils/axios";
import type { ExtractFnReturnType, QueryConfig } from "@/lib/vue-query";

import type { User } from "@/types";

export const getUsers = (): Promise<User[]> => {
  return axios.get(`/users`);
};

type QueryFnType = typeof getUsers;

type UseUsersOptions = {
  config?: QueryConfig<QueryFnType>;
};

export const useUsers = ({ config }: UseUsersOptions = {}) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });
};
