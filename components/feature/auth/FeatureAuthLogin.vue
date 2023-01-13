<script setup lang="ts">
import { toFormValidator } from '@vee-validate/zod'
import { z } from 'zod'

const validationSchema = toFormValidator(
  z.object({
    email: z.string().min(1, 'Required'),
    password: z.string().min(1, 'Required')
  })
)

const { login, isLoggingIn } = useAuth()

type LoginFormEmits = {
  (e: 'success'): void
}

const emits = defineEmits<LoginFormEmits>()

async function onSubmit(values) {
  await login(values)
  emits('success')
}
</script>

<template>
  <FormWrapper :validation-schema="validationSchema" @submit="onSubmit">
    <FormInputField name="email" type="email" label="Email Address" />
    <FormInputField name="password" type="password" label="Password" />
    <div>
      <BaseButton type="submit" class="w-full" :is-loading="isLoggingIn">
        Log in
      </BaseButton>
    </div>
  </FormWrapper>
</template>
