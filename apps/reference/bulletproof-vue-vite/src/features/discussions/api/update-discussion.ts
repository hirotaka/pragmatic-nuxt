import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { z } from 'zod'

import { getDiscussionQueryOptions } from './get-discussion'

import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/vue-query'
import type { Discussion } from '@/types/api'

export const updateDiscussionInputSchema = z.object({
  title: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
})

export type UpdateDiscussionInput = z.infer<typeof updateDiscussionInputSchema>

export const updateDiscussion = ({
  data,
  discussionId,
}: {
  data: UpdateDiscussionInput
  discussionId: string
}): Promise<{ data: Discussion }> => {
  return api.patch(`/discussions/${discussionId}`, data)
}

type UseUpdateDiscussionOptions = {
  mutationConfig?: MutationConfig<typeof updateDiscussion>
}

export const useUpdateDiscussion = ({ mutationConfig }: UseUpdateDiscussionOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (response, ...args) => {
      // Update the cache immediately with the new data
      // response is { data: Discussion }, which matches the getDiscussion format
      queryClient.setQueryData(getDiscussionQueryOptions(response.data.id).queryKey, response)
      onSuccess?.(response, ...args)
    },
    ...restConfig,
    mutationFn: updateDiscussion,
  })
}
