import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { axios } from '@/utils/axios'
import { useNotificationStore } from '@/stores/notifications'

import type { Comment } from '@/types'

export const deleteComment = ({ id }: { id: string }): Promise<string> => {
  return axios.delete(`/api/comments/${id}`)
}

export const useDeleteComment = ({
  discussionId
}: {
  discussionId: string
}) => {
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  return useMutation({
    onMutate: async (deletedComment) => {
      await queryClient.cancelQueries(['comments', discussionId])

      const previousComments = queryClient.getQueryData<Comment[]>([
        'comments',
        discussionId
      ])

      queryClient.setQueryData(
        ['comments', discussionId],
        previousComments?.filter((comment) => comment.id !== deletedComment.id)
      )

      return { previousComments }
    },
    onError: (_error, _variables_, context: any) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['comments', discussionId],
          context.previousComments
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', discussionId])
      store.add({
        type: 'success',
        title: 'Comment Deleted'
      })
    },
    mutationFn: deleteComment
  })
}
