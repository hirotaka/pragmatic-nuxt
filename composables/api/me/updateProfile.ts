import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'

import type { User } from '~/types'

import { useNotificationStore } from '~/stores/notifications'

export type UpdateProfileDTO = {
  data: {
    email: string
    firstName: string
    lastName: string
    bio: string
  }
}

export const updateProfile = ({ data }: UpdateProfileDTO): Promise<User> => {
  return axios.patch(`/api/me/profile`, data)
}

export const useUpdateProfile = () => {
  const store = useNotificationStore()
  const queryClient = useQueryClient()

  return useMutation({
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data)
      store.add({
        type: 'success',
        title: 'User Updated'
      })
    },
    mutationFn: updateProfile
  })
}
