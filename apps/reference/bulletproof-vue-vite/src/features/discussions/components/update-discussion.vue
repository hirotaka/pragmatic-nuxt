<script setup lang="ts">
import { Pen } from 'lucide-vue-next'
import { computed } from 'vue'

import { useDiscussion } from '../api/get-discussion'
import { useUpdateDiscussion, updateDiscussionInputSchema } from '../api/update-discussion'

import { Button } from '@/components/ui/button'
import { Form, FormDrawer, Input, Textarea } from '@/components/ui/form'
import { useNotifications } from '@/components/ui/notifications'
import { Authorization, ROLES } from '@/lib/authorization'

type UpdateDiscussionProps = {
  discussionId: string
}

const props = defineProps<UpdateDiscussionProps>()

const { addNotification } = useNotifications()
const discussionQuery = useDiscussion({ discussionId: props.discussionId })
const updateDiscussionMutation = useUpdateDiscussion({
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Discussion Updated',
      })
    },
  },
})

const initialValues = computed(() => ({
  title: discussionQuery.data.value?.data?.title ?? '',
  body: discussionQuery.data.value?.data?.body ?? '',
}))

const handleSubmit = (values: Record<string, unknown>) => {
  updateDiscussionMutation.mutate({
    data: values as { title: string; body: string },
    discussionId: props.discussionId,
  })
}
</script>

<template>
  <Authorization :allowed-roles="[ROLES.ADMIN]">
    <FormDrawer title="Update Discussion" :is-done="updateDiscussionMutation.isSuccess.value">
      <template #triggerButton>
        <Button size="sm">
          <template #icon>
            <Pen class="size-4" />
          </template>
          Update Discussion
        </Button>
      </template>

      <Form
        id="update-discussion"
        :schema="updateDiscussionInputSchema"
        :initial-values="initialValues"
        @submit="handleSubmit"
      >
        <template #default="{ isSubmitting }">
          <Input name="title" label="Title" :disabled="isSubmitting" />
          <Textarea name="body" label="Body" :disabled="isSubmitting" />
        </template>
      </Form>

      <template #submitButton>
        <Button
          type="submit"
          form="update-discussion"
          size="sm"
          :is-loading="updateDiscussionMutation.isPending.value"
        >
          Submit
        </Button>
      </template>
    </FormDrawer>
  </Authorization>
</template>
