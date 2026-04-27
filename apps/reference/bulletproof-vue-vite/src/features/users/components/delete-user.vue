<script setup lang="ts">
import { useDeleteUser } from '../api/delete-user'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog'
import { useNotifications } from '@/components/ui/notifications'
import { useUser } from '@/lib/auth'

interface DeleteUserProps {
  id: string
}

const props = defineProps<DeleteUserProps>()

const user = useUser()
const { addNotification } = useNotifications()
const deleteUserMutation = useDeleteUser({
  mutationConfig: {
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'User Deleted',
      })
    },
  },
})

const handleDelete = () => {
  deleteUserMutation.mutate({ userId: props.id })
}
</script>

<template>
  <ConfirmationDialog
    v-if="user.data.value?.id !== id"
    icon="danger"
    title="Delete User"
    body="Are you sure you want to delete this user?"
  >
    <template #triggerButton>
      <Button variant="destructive">Delete</Button>
    </template>
    <template #confirmButton>
      <Button
        :is-loading="deleteUserMutation.isPending.value"
        type="button"
        variant="destructive"
        @click="handleDelete"
      >
        Delete User
      </Button>
    </template>
  </ConfirmationDialog>
</template>
