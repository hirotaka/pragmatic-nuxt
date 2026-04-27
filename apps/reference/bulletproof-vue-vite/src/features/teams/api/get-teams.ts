import { queryOptions, useQuery, type UseQueryOptions } from '@tanstack/vue-query'

import { api } from '@/lib/api-client'
import type { Team } from '@/types/api'

export const getTeams = (): Promise<{ data: Team[] }> => {
  return api.get('/teams')
}

export const getTeamsQueryOptions = () => {
  return queryOptions({
    queryKey: ['teams'],
    queryFn: () => getTeams(),
  })
}

type UseTeamsOptions = {
  queryConfig?: Omit<
    Partial<UseQueryOptions<{ data: Team[] }, Error, { data: Team[] }, readonly unknown[]>>,
    'queryKey' | 'queryFn'
  >
}

export const useTeams = ({ queryConfig }: UseTeamsOptions = {}) => {
  return useQuery({
    ...getTeamsQueryOptions(),
    ...queryConfig,
  })
}
