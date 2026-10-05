<script setup lang="ts">
import { toast } from "vue-sonner";

interface DeleteDiscussionDialogProps {
  discussion: Discussion;
}

const props = defineProps<DeleteDiscussionDialogProps>();

const emit = defineEmits<{
  success: [];
}>();

const deleteDiscussion = useDeleteDiscussion();
const isPending = ref(false);

const handleConfirm = async (close: () => void) => {
  if (isPending.value) return;

  isPending.value = true;
  try {
    await deleteDiscussion(props.discussion.id);
  }
  catch {
    // `$api` reports the request failure; keep the dialog open for another attempt.
    isPending.value = false;
    return;
  }

  toast.success("Discussion Deleted");
  isPending.value = false;
  close();
  emit("success");
};

const handleEscapeKeyDown = (event: KeyboardEvent) => {
  if (isPending.value) event.preventDefault();
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
        <AlertDialogTitle>Delete Discussion</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{{ discussion.title }}"? This action cannot be undone.
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
          Delete
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
