import { useQuery } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'
import type { User } from '~/types'

export const getProfile = (): Promise<User> => {
  return axios.get('/api/me')
}

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  })
}
