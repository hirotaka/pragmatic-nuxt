import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { axios } from '@/utils/axios'
import { useNotificationStore } from '@/stores/notifications'

import type { Comment } from '@/types'

export type CreateCommentDTO = {
  data: {
    body: string
    discussionId: string
  }
}

export const createComment = ({ data }: CreateCommentDTO): Promise<Comment> => {
  return axios.post('/api/comments', data)
}

export const useCreateComment = () => {
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  return useMutation({
    onMutate: async (newComment) => {
      const { discussionId } = newComment.data
      await queryClient.cancelQueries(['comments', discussionId])

      const previousComments = queryClient.getQueryData<Comment[]>([
        'comments',
        discussionId
      ])

      queryClient.setQueryData(
        ['comments', discussionId],
        [...(previousComments || []), newComment.data]
      )

      return { previousComments }
    },
    onError: (_error, varibales, context: any) => {
      if (context?.previousComments) {
        const { discussionId } = varibales.data
        queryClient.setQueryData(
          ['comments', discussionId],
          context.previousComments
        )
      }
    },
    onSuccess: (data) => {
      const { discussionId } = data
      queryClient.invalidateQueries(['comments', discussionId])
      store.add({
        type: 'success',
        title: 'Comment Created'
      })
    },
    mutationFn: createComment
  })
}
