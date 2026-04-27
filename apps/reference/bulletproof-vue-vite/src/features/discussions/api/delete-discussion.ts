import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { getDiscussionsQueryOptions } from './get-discussions'

import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/vue-query'

export const deleteDiscussion = ({ discussionId }: { discussionId: string }) => {
  return api.delete(`/discussions/${discussionId}`)
}

type UseDeleteDiscussionOptions = {
  mutationConfig?: MutationConfig<typeof deleteDiscussion>
}

export const useDeleteDiscussion = ({ mutationConfig }: UseDeleteDiscussionOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getDiscussionsQueryOptions().queryKey,
      })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: deleteDiscussion,
  })
}
