<script setup lang="ts">
import { ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { useDeleteComment } from "~comments/app/composables/useDeleteComment";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteCommentDialogProps {
  commentId: string;
  open: boolean;
}

const props = defineProps<DeleteCommentDialogProps>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "success": [];
}>();

const { addNotification } = useNotifications();
const deleteComment = useDeleteComment();
const isPending = ref(false);

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
  emit("update:open", false);
  isPending.value = false;
};

const handleOpenChange = (value: boolean) => {
  if (!isPending.value) {
    emit("update:open", value);
  }
};
</script>

<template>
  <ConfirmationDialog
    :open="open"
    variant="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
    confirm-text="Delete Comment"
    :is-loading="isPending"
    @confirm="handleConfirm"
    @update:open="handleOpenChange"
  />
</template>
