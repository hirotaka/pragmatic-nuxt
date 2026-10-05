<script setup lang="ts">
import { toast } from "vue-sonner";

interface DeleteCommentDialogProps {
  commentId: string;
}

const props = defineProps<DeleteCommentDialogProps>();

const emit = defineEmits<{
  success: [];
}>();

const deleteComment = useDeleteComment();
const isPending = ref(false);

const handleEscapeKeyDown = (event: KeyboardEvent) => {
  if (isPending.value) event.preventDefault();
};

const handleConfirm = async (close: () => void) => {
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

  toast.success("Comment Deleted");
  isPending.value = false;
  close();
  emit("success");
};
</script>

<template>
  <AlertDialog v-slot="{ open, close }">
    <AlertDialogTrigger
      v-if="$slots.triggerButton"
      as-child
      :aria-hidden="open ? 'true' : undefined"
    >
      <slot name="triggerButton" />
    </AlertDialogTrigger>
    <AlertDialogContent @escape-key-down="handleEscapeKeyDown">
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this comment?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isPending">
          Cancel
        </AlertDialogCancel>
        <Button
          type="button"
          variant="destructive"
          :disabled="isPending"
          :aria-busy="isPending"
          @click="handleConfirm(close)"
        >
          <Spinner
            v-if="isPending"
            data-icon="inline-start"
            aria-hidden="true"
          />
          Delete Comment
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
