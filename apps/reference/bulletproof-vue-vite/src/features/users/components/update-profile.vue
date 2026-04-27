<script setup lang="ts">
import { Pen } from 'lucide-vue-next'
import { computed } from 'vue'

import { useUpdateProfile, updateProfileInputSchema } from '../api/update-profile'

import { Button } from '@/components/ui/button'
import { Form, FormDrawer, Input, Textarea } from '@/components/ui/form'
import { useNotifications } from '@/components/ui/notifications'
import { useUser } from '@/lib/auth'

const user = useUser()
const { addNotification } = useNotifications()

const updateProfileMutation = useUpdateProfile({
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Profile Updated',
      })
    },
  },
})

const initialValues = computed(() => ({
  firstName: user.data.value?.firstName ?? '',
  lastName: user.data.value?.lastName ?? '',
  email: user.data.value?.email ?? '',
  bio: user.data.value?.bio ?? '',
}))

const handleSubmit = (values: Record<string, unknown>) => {
  updateProfileMutation.mutate({
    data: values as {
      firstName: string
      lastName: string
      email: string
      bio: string
    },
  })
}
</script>

<template>
  <FormDrawer :is-done="updateProfileMutation.isSuccess.value" title="Update Profile">
    <template #triggerButton>
      <Button size="sm">
        <template #icon>
          <Pen class="size-4" />
        </template>
        Update Profile
      </Button>
    </template>

    <Form
      id="update-profile"
      :schema="updateProfileInputSchema"
      :initial-values="initialValues"
      @submit="handleSubmit"
    >
      <template #default="{ isSubmitting }">
        <Input name="firstName" label="First Name" :disabled="isSubmitting" />
        <Input name="lastName" label="Last Name" :disabled="isSubmitting" />
        <Input name="email" label="Email Address" type="email" :disabled="isSubmitting" />
        <Textarea name="bio" label="Bio" :disabled="isSubmitting" />
      </template>
    </Form>

    <template #submitButton>
      <Button
        type="submit"
        form="update-profile"
        size="sm"
        :is-loading="updateProfileMutation.isPending.value"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
