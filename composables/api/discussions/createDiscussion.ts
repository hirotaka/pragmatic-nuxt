import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'
import { useNotificationStore } from '~/stores/notifications'

import type { Discussion } from '~/types'

export type CreateDiscussionDTO = {
  data: {
    title: string
    body: string
  }
}

export const createDiscussion = ({
  data
}: CreateDiscussionDTO): Promise<Discussion> => {
  return axios.post('/api/discussions', data)
}

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient()
  const store = useNotificationStore()

  return useMutation({
    mutationFn: createDiscussion,
    onMutate: async (newDiscussion) => {
      await queryClient.cancelQueries(['discussions'])

      const previousDiscussions = queryClient.getQueryData<Discussion[]>([
        'discussions'
      ])

      queryClient.setQueryData(
        ['discussions'],
        [...(previousDiscussions || []), newDiscussion.data]
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
        title: 'Discussion Created'
      })
    }
  })
}
