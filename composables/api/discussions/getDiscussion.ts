import { useQuery } from '@tanstack/vue-query'

import { axios } from '@/utils/axios'

import type { Discussion } from '@/types'

export const getDiscussion = ({
  discussionId
}: {
  discussionId: string
}): Promise<Discussion> => {
  return axios.get(`/api/discussions/${discussionId}`)
}

type UseDiscussionOptions = {
  discussionId: string
}

export const useDiscussion = ({ discussionId }: UseDiscussionOptions) => {
  return useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: () => getDiscussion({ discussionId })
  })
}
