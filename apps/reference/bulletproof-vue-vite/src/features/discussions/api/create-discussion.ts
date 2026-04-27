import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { z } from 'zod'

import { getDiscussionsQueryOptions } from './get-discussions'

import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/vue-query'
import type { Discussion } from '@/types/api'

export const createDiscussionInputSchema = z.object({
  title: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
})

export type CreateDiscussionInput = z.infer<typeof createDiscussionInputSchema>

export const createDiscussion = ({
  data,
}: {
  data: CreateDiscussionInput
}): Promise<Discussion> => {
  return api.post(`/discussions`, data)
}

type UseCreateDiscussionOptions = {
  mutationConfig?: MutationConfig<typeof createDiscussion>
}

export const useCreateDiscussion = ({ mutationConfig }: UseCreateDiscussionOptions = {}) => {
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
    mutationFn: createDiscussion,
  })
}
