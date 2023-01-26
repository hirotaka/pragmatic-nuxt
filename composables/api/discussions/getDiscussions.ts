import { useQuery } from '@tanstack/vue-query'

import { axios } from '@/utils/axios'

import type { Discussion } from '@/types'

export const getDiscussions = (): Promise<Discussion[]> => {
  return axios.get('/api/discussions')
}

export const useDiscussions = () => {
  return useQuery({
    queryKey: ['discussions'],
    queryFn: () => getDiscussions()
  })
}
