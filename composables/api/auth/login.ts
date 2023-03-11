import { useMutation } from '@tanstack/vue-query'

import type { UserResponse } from '~/types'
import { useNotificationStore } from '~/stores/notifications'

export type LoginCredentialsDTO = {
  email: string
  password: string
}

export const loginWithEmailAndPassword = (
  data: LoginCredentialsDTO
): Promise<UserResponse> => {
  const { signIn } = useSession()

  return signIn('credentials', {
    ...data,
    redirect: false
  })
}

export const useAuthLogin = () => {
  const store = useNotificationStore()

  return useMutation({
    onSuccess: (data: any) => {
      // FIXME: This should be done in onError
      const { error } = data
      if (error) {
        store.add({
          type: 'error',
          title: 'Error',
          message: error
        })
      }
    },
    mutationFn: loginWithEmailAndPassword
  })
}
