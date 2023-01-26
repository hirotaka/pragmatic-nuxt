import { useQuery } from '@tanstack/vue-query'

import { axios } from '@/utils/axios'

import type { User } from '@/types'

export const getUsers = (): Promise<User[]> => {
  return axios.get(`/api/users`)
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers()
  })
}
