import { useQuery } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'

import type { Comment } from '~/types'

export const getComments = ({
  discussionId
}: {
  discussionId: string
}): Promise<Comment[]> => {
  return axios.get('/api/comments', {
    params: {
      discussionId
    }
  })
}

type UseCommentsOptions = {
  discussionId: string
}

export const useComments = ({ discussionId }: UseCommentsOptions) => {
  return useQuery({
    queryKey: ['comments', discussionId],
    queryFn: () => getComments({ discussionId })
  })
}
