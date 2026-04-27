import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { getUsersQueryOptions } from './get-users'

import { api } from '@/lib/api-client'
import type { MutationConfig } from '@/lib/vue-query'

export type DeleteUserDTO = {
  userId: string
}

export const deleteUser = ({ userId }: DeleteUserDTO): Promise<{ message: string }> => {
  return api.delete(`/users/${userId}`)
}

type UseDeleteUserOptions = {
  mutationConfig?: MutationConfig<typeof deleteUser>
}

export const useDeleteUser = ({ mutationConfig }: UseDeleteUserOptions = {}) => {
  const queryClient = useQueryClient()

  const { onSuccess, ...restConfig } = mutationConfig || {}

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: getUsersQueryOptions().queryKey,
      })
      onSuccess?.(...args)
    },
    ...restConfig,
    mutationFn: deleteUser,
  })
}
