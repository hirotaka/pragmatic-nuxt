<script setup lang="ts">
import { toFormValidator } from '@vee-validate/zod'
import { z } from 'zod'

import type { LoginCredentialsDTO } from '~/composables/api/auth/login'

const validationSchema = toFormValidator(
  z.object({
    email: z.string().min(1, 'Required'),
    password: z.string().min(1, 'Required')
  })
)

type LoginFormEmits = {
  (e: 'success'): void
}

const emits = defineEmits<LoginFormEmits>()

const { isLoading, mutateAsync } = useAuthLogin()
const onSubmit = async (values: LoginCredentialsDTO) => {
  const { error } = await mutateAsync(values)
  if (!error) {
    emits('success')
  }
}
</script>

<template>
  <FormWrapper :validation-schema="validationSchema" @submit="onSubmit">
    <FormInputField name="email" type="email" label="Email Address" />
    <FormInputField name="password" type="password" label="Password" />
    <div>
      <BaseButton type="submit" class="w-full" :is-loading="isLoading">
        Log in
      </BaseButton>
    </div>
  </FormWrapper>
</template>
