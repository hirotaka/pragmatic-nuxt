<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

import { createDiscussionInputSchema, useCreateDiscussion } from '../api/create-discussion'

import { Button } from '@/components/ui/button'
import { Form, FormDrawer, Input, Textarea } from '@/components/ui/form'
import { useNotifications } from '@/components/ui/notifications'
import { Authorization, ROLES } from '@/lib/authorization'

const { addNotification } = useNotifications()
const createDiscussionMutation = useCreateDiscussion({
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Discussion Created',
      })
    },
  },
})

const handleSubmit = (values: Record<string, unknown>) => {
  createDiscussionMutation.mutate({
    data: values as { title: string; body: string },
  })
}
</script>

<template>
  <Authorization :allowed-roles="[ROLES.ADMIN]">
    <FormDrawer :is-done="createDiscussionMutation.isSuccess.value" title="Create Discussion">
      <template #triggerButton>
        <Button size="sm">
          <template #icon>
            <Plus class="size-4" />
          </template>
          Create Discussion
        </Button>
      </template>

      <Form id="create-discussion" :schema="createDiscussionInputSchema" @submit="handleSubmit">
        <template #default="{ isSubmitting }">
          <Input name="title" label="Title" :disabled="isSubmitting" />
          <Textarea name="body" label="Body" :disabled="isSubmitting" />
        </template>
      </Form>

      <template #submitButton>
        <Button
          type="submit"
          form="create-discussion"
          size="sm"
          :is-loading="createDiscussionMutation.isPending.value"
        >
          Submit
        </Button>
      </template>
    </FormDrawer>
  </Authorization>
</template>
