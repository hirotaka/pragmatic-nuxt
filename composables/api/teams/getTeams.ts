import { useQuery } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'
import type { Team } from '~/types'

export const getTeams = (): Promise<Team[]> => {
  return axios.get('/api/teams')
}

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => getTeams()
  })
}
