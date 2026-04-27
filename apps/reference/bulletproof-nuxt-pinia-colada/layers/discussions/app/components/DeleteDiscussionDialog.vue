<script setup lang="ts">
import { useDeleteDiscussion } from "~discussions/app/composables/useDeleteDiscussion";
import type { Discussion } from "~discussions/shared/types";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteDiscussionDialogProps {
  discussion: Discussion;
  open: boolean;
}

const props = defineProps<DeleteDiscussionDialogProps>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "success": [];
}>();

const { addNotification } = useNotifications();

const deleteDiscussion = useDeleteDiscussion({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Discussion Deleted",
    });
    emit("update:open", false);
    emit("success");
  },
});

const handleConfirm = () => {
  deleteDiscussion.mutate(props.discussion.id);
};

const handleOpenChange = (value: boolean) => {
  if (!deleteDiscussion.isLoading.value) {
    emit("update:open", value);
  }
};
</script>

<template>
  <UConfirmationDialog
    :open="open"
    :is-loading="deleteDiscussion.isLoading.value"
    variant="danger"
    title="Delete Discussion"
    :description="`Are you sure you want to delete &quot;${discussion.title}&quot;? This action cannot be undone.`"
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="handleConfirm"
    @update:open="handleOpenChange"
  >
    <template
      v-if="deleteDiscussion.error.value"
      #error
    >
      <div
        class="text-sm text-destructive"
        role="alert"
      >
        {{ deleteDiscussion.error.value.message }}
      </div>
    </template>
  </UConfirmationDialog>
</template>
