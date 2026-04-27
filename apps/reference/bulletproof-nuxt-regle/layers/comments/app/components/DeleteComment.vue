<script setup lang="ts">
import { Trash } from "lucide-vue-next";
import { ref } from "vue";
import { useDeleteComment } from "~comments/app/composables/useDeleteComment";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteCommentProps {
  commentId: string;
}

const props = defineProps<DeleteCommentProps>();
const emit = defineEmits<{
  deleted: [];
}>();

const { addNotification } = useNotifications();
const isOpen = ref(false);

const deleteComment = useDeleteComment({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Comment Deleted",
    });
    isOpen.value = false;
    emit("deleted");
  },
});

const handleDelete = async () => {
  try {
    await deleteComment.mutate(props.commentId);
  }
  catch {
    // Error is already handled in the composable
  }
};
</script>

<template>
  <UConfirmationDialog
    v-model:open="isOpen"
    variant="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
    confirm-text="Delete Comment"
    :is-loading="deleteComment.isPending.value"
    @confirm="handleDelete"
  >
    <template #triggerButton>
      <UButton
        variant="destructive"
        size="sm"
      >
        <template #icon>
          <Trash class="size-4" />
        </template>
        Delete Comment
      </UButton>
    </template>
  </UConfirmationDialog>
</template>
