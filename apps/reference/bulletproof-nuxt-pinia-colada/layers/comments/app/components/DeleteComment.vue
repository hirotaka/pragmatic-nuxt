<script setup lang="ts">
import { Trash } from "lucide-vue-next";
import { ref } from "vue";
import { useDeleteComment } from "~comments/app/composables/useDeleteComment";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteCommentProps {
  commentId: string;
}

const props = defineProps<DeleteCommentProps>();

const { addNotification } = useNotifications();
const isOpen = ref(false);

const deleteComment = useDeleteComment({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "Comment Deleted",
    });
    isOpen.value = false;
  },
});

const handleDelete = () => {
  deleteComment.mutate(props.commentId);
};
</script>

<template>
  <UConfirmationDialog
    v-model:open="isOpen"
    variant="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
    confirm-text="Delete Comment"
    :is-loading="deleteComment.isLoading.value"
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
