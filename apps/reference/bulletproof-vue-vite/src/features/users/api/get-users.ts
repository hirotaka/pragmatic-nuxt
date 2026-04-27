import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/vue-query'

import { api } from '@/lib/api-client'
import type { User } from '@/types/api'

export const getUsers = (): Promise<{ data: User[] }> => {
  return api.get(`/users`)
}

export const getUsersQueryOptions = () => {
  return queryOptions({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}

type UseUsersOptions = {
  queryConfig?: Omit<
    Partial<UseQueryOptions<{ data: User[] }, Error, { data: User[] }, readonly unknown[]>>,
    'queryKey' | 'queryFn'
  >
}

export const useUsers = ({ queryConfig }: UseUsersOptions = {}) => {
  return useQuery({
    ...getUsersQueryOptions(),
    ...queryConfig,
  })
}
