<script setup lang="ts">
import { MoreHorizontal, Trash } from "lucide-vue-next";
import { ref } from "vue";
import ConfirmationDialog from "~~/components/app/ConfirmationDialog.vue";
import { Button } from "@/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useDeleteComment } from "~comments/app/composables/useDeleteComment";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteCommentProps {
  commentId: string;
  asMenuItem?: boolean;
  actionLabel?: string;
}

const props = withDefaults(defineProps<DeleteCommentProps>(), {
  actionLabel: "Open comment actions",
});
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
  <DropdownRoot v-if="asMenuItem">
    <DropdownTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-8 shrink-0"
        :aria-label="props.actionLabel"
      >
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownTrigger>
    <DropdownContent align="end">
      <DropdownItem
        class="text-destructive focus:text-destructive"
        @click="isOpen = true"
      >
        <Trash class="mr-2 size-4" />
        Delete Comment
      </DropdownItem>
    </DropdownContent>
  </DropdownRoot>
  <ConfirmationDialog
    v-model:open="isOpen"
    variant="danger"
    title="Delete Comment"
    body="Are you sure you want to delete this comment?"
    confirm-text="Delete Comment"
    :is-loading="deleteComment.isPending.value"
    @confirm="handleDelete"
  >
    <template
      v-if="!asMenuItem"
      #triggerButton
    >
      <Button
        variant="destructive"
        size="sm"
      >
        <template #icon>
          <Trash class="size-4" />
        </template>
        Delete Comment
      </Button>
    </template>
  </ConfirmationDialog>
</template>
