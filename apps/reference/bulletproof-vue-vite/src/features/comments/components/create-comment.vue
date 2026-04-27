<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

import { useCreateComment, createCommentInputSchema } from '../api/create-comment'

import { Button } from '@/components/ui/button'
import { FormDrawer, Form, Textarea } from '@/components/ui/form'
import { useNotifications } from '@/components/ui/notifications'

interface CreateCommentProps {
  discussionId: string
}

const props = defineProps<CreateCommentProps>()

const { addNotification } = useNotifications()

const createCommentMutation = useCreateComment({
  discussionId: props.discussionId,
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Comment Created',
      })
    },
  },
})

const handleSubmit = (values: Record<string, unknown>) => {
  createCommentMutation.mutate({
    data: values as { discussionId: string; body: string },
  })
}
</script>

<template>
  <FormDrawer :is-done="createCommentMutation.isSuccess.value" title="Create Comment">
    <template #triggerButton>
      <Button size="sm">
        <template #icon>
          <Plus class="size-4" />
        </template>
        Create Comment
      </Button>
    </template>

    <Form
      id="create-comment"
      :schema="createCommentInputSchema"
      :initial-values="{
        body: '',
        discussionId: props.discussionId,
      }"
      @submit="handleSubmit"
    >
      <template #default="{ isSubmitting }">
        <Textarea name="body" label="Body" :disabled="isSubmitting" />
      </template>
    </Form>

    <template #submitButton>
      <Button
        type="submit"
        form="create-comment"
        size="sm"
        :is-loading="createCommentMutation.isPending.value"
      >
        Submit
      </Button>
    </template>
  </FormDrawer>
</template>
