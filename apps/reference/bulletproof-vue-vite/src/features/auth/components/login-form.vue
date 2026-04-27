<script setup lang="ts">
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Form, Input } from '@/components/ui/form'
import { paths } from '@/config/paths'
import { useLogin, loginInputSchema, type LoginInput } from '@/lib/auth'

interface LoginFormProps {
  onSuccess: () => void
}

const props = defineProps<LoginFormProps>()

const route = useRoute()
const redirectTo = route.query.redirectTo as string | undefined

const login = useLogin({
  onSuccess: props.onSuccess,
})

const handleSubmit = (values: Record<string, unknown>) => {
  login.mutate(values as LoginInput)
}
</script>

<template>
  <div>
    <Form :schema="loginInputSchema" @submit="handleSubmit">
      <template #default>
        <Input name="email" type="email" label="Email Address" />
        <Input name="password" type="password" label="Password" />
        <div>
          <Button :is-loading="login.isPending.value" type="submit" class="w-full"> Log in </Button>
        </div>
      </template>
    </Form>
    <div class="mt-2 flex items-center justify-end">
      <div class="text-sm">
        <RouterLink
          :to="paths.auth.register.getHref(redirectTo ?? '')"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Register
        </RouterLink>
      </div>
    </div>
  </div>
</template>
