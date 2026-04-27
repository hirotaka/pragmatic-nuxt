<script setup lang="ts">
import { Trash } from 'lucide-vue-next'

import { useDeleteDiscussion } from '../api/delete-discussion'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog'
import { useNotifications } from '@/components/ui/notifications'
import { Authorization, ROLES } from '@/lib/authorization'

type DeleteDiscussionProps = {
  id: string
}

const { id } = defineProps<DeleteDiscussionProps>()

const { addNotification } = useNotifications()

const deleteDiscussionMutation = useDeleteDiscussion({
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Discussion Deleted',
      })
    },
  },
})
</script>

<template>
  <Authorization :allowed-roles="[ROLES.ADMIN]">
    <ConfirmationDialog
      icon="danger"
      title="Delete Discussion"
      body="Are you sure you want to delete this discussion?"
      :is-done="deleteDiscussionMutation.isSuccess.value"
    >
      <template #triggerButton>
        <Button variant="destructive">
          <template #icon>
            <Trash class="size-4" />
          </template>
          Delete Discussion
        </Button>
      </template>

      <template #confirmButton>
        <Button
          :is-loading="deleteDiscussionMutation.isPending.value"
          type="button"
          variant="destructive"
          @click="deleteDiscussionMutation.mutate({ discussionId: id })"
        >
          Delete Discussion
        </Button>
      </template>
    </ConfirmationDialog>
  </Authorization>
</template>
