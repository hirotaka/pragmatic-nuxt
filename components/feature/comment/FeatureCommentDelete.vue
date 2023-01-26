<script setup lang="ts">
import { TrashIcon } from '@heroicons/vue/24/outline'

type DeleteCommentProps = {
  id: string
  discussionId: string
}

const props = defineProps<DeleteCommentProps>()
const { id, discussionId } = props

const { isLoading, isSuccess, mutateAsync } = useDeleteComment({
  discussionId
})

async function onClick() {
  await mutateAsync({ id })
}
</script>

<template>
  <BaseConfirmationDialog
    :is-done="isSuccess"
    icon="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
  >
    <template #triggerButton>
      <BaseButton variant="danger" size="sm">
        <template #startIcon>
          <TrashIcon class="h-4 w-4" />
        </template>
        Delete Comment
      </BaseButton>
    </template>
    <template #confirmButton>
      <BaseButton
        class="bg-red-600"
        type="button"
        :is-loading="isLoading"
        @click="onClick"
      >
        Delete Comment
      </BaseButton>
    </template>
  </BaseConfirmationDialog>
</template>
