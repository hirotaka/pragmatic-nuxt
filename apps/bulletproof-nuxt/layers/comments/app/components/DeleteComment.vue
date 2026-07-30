<script setup lang="ts">
import { MoreHorizontal, Trash } from "lucide-vue-next";
import { ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { Button } from "~~/app/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "~~/app/components/ui/dropdown";
import { useDeleteComment } from "~comments/app/composables/useDeleteComment";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteCommentProps {
  commentId: string;
  asMenuItem?: boolean;
  actionLabel?: string;
  refresh: () => Promise<void>;
}

const props = withDefaults(defineProps<DeleteCommentProps>(), {
  actionLabel: "Open comment actions",
});
const { addNotification } = useNotifications();
const isOpen = ref(false);
const isPending = ref(false);
const deleteComment = useDeleteComment();

const handleDelete = async () => {
  if (isPending.value) return;

  isPending.value = true;

  try {
    await deleteComment(props.commentId);
  }
  catch {
    // `$api` reports the request failure.
    isPending.value = false;
    return;
  }

  addNotification({
    type: "success",
    title: "Comment Deleted",
  });
  // The read owner reports refresh failures without changing mutation success.
  await props.refresh().catch(() => undefined);
  isOpen.value = false;
  isPending.value = false;
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
    :is-loading="isPending"
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
