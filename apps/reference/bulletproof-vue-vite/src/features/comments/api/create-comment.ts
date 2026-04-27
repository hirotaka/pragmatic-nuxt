import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { z } from 'zod'

import { getInfiniteCommentsQueryOptions } from './get-comments'

import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/vue-query'
import type { Comment } from '@/types/api'

export const createCommentInputSchema = z.object({
  discussionId: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
})

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>

export const createComment = ({ data }: { data: CreateCommentInput }): Promise<Comment> => {
  return api.post('/comments', data)
}

type UseCreateCommentOptions = {
  discussionId: string
  mutationConfig?: MutationConfig<typeof createComment>
}

export const useCreateComment = ({ mutationConfig, discussionId }: UseCreateCommentOptions) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getInfiniteCommentsQueryOptions(discussionId).queryKey,
      })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: createComment,
  })
}
