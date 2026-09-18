<script setup lang="ts">
import { ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { useDeleteComment } from "~comments/app/composables/useDeleteComment";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteCommentDialogProps {
  commentId: string;
}

const props = defineProps<DeleteCommentDialogProps>();

const emit = defineEmits<{
  success: [];
}>();

const { addNotification } = useNotifications();
const deleteComment = useDeleteComment();
const isOpen = ref(false);
const isPending = ref(false);

const handleOpenChange = (value: boolean) => {
  if (!value && isPending.value) return;

  isOpen.value = value;
};

const handleConfirm = async () => {
  if (isPending.value) return;

  isPending.value = true;
  try {
    await deleteComment(props.commentId);
  }
  catch {
    // The request owner reports the mutation failure; keep the dialog open.
    isPending.value = false;
    return;
  }

  addNotification({
    type: "success",
    title: "Comment Deleted",
  });
  emit("success");
  isPending.value = false;
  isOpen.value = false;
};
</script>

<template>
  <ConfirmationDialog
    :open="isOpen"
    variant="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
    confirm-text="Delete Comment"
    :is-loading="isPending"
    @confirm="handleConfirm"
    @update:open="handleOpenChange"
  >
    <template #triggerButton>
      <slot name="triggerButton" />
    </template>
  </ConfirmationDialog>
</template>
