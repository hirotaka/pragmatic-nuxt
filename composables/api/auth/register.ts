import { useMutation } from '@tanstack/vue-query'

import { axios } from '~/utils/axios'

import type { UserResponse } from '~/types'

export type RegisterCredentialsDTO = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const register = (
  data: RegisterCredentialsDTO
): Promise<UserResponse> => {
  return axios.post('/api/auth/register', data)
}

export const useAuthRegister = () => {
  return useMutation({
    onSuccess: async (_data, variables: RegisterCredentialsDTO) => {
      const { email, password } = variables
      const { signIn } = useSession()
      await signIn('credentials', {
        email,
        password,
        redirect: false
      })
    },
    mutationFn: register
  })
}
