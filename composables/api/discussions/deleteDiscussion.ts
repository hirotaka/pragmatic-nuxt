import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'
import { useNotificationStore } from '~/stores/notifications'

import type { Discussion } from '~/types'

export const deleteDiscussion = ({
  discussionId
}: {
  discussionId: string
}): Promise<string> => {
  return axios.delete(`/api/discussions/${discussionId}`)
}

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  return useMutation({
    onMutate: async (deletedDiscussion) => {
      await queryClient.cancelQueries(['discussions'])

      const previousDiscussions = queryClient.getQueryData<Discussion[]>([
        'discussions'
      ])

      queryClient.setQueryData(
        ['discussions'],
        previousDiscussions?.filter(
          (discussion) => discussion.id !== deletedDiscussion.discussionId
        )
      )

      return { previousDiscussions }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDiscussions) {
        queryClient.setQueryData(['discussions'], context.previousDiscussions)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions'])
      store.add({
        type: 'success',
        title: 'Discussion Deleted'
      })
    },
    mutationFn: deleteDiscussion
  })
}
