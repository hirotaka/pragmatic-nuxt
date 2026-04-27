<script setup lang="ts">
import { Trash } from 'lucide-vue-next'

import { useDeleteComment } from '../api/delete-comment'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog'
import { useNotifications } from '@/components/ui/notifications'

interface DeleteCommentProps {
  id: string
  discussionId: string
}

const props = defineProps<DeleteCommentProps>()

const { addNotification } = useNotifications()

const deleteCommentMutation = useDeleteComment({
  discussionId: props.discussionId,
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Comment Deleted',
      })
    },
  },
})
</script>

<template>
  <ConfirmationDialog
    icon="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
    :is-done="deleteCommentMutation.isSuccess.value"
  >
    <template #triggerButton>
      <Button variant="destructive" size="sm">
        <template #icon>
          <Trash class="size-4" />
        </template>
        Delete Comment
      </Button>
    </template>

    <template #confirmButton>
      <Button
        :is-loading="deleteCommentMutation.isPending.value"
        type="button"
        variant="destructive"
        @click="deleteCommentMutation.mutate({ commentId: id })"
      >
        Delete Comment
      </Button>
    </template>
  </ConfirmationDialog>
</template>
