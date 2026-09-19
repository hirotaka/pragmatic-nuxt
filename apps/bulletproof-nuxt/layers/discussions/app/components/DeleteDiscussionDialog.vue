<script setup lang="ts">
import { ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { useDeleteDiscussion } from "~discussions/app/composables/useDeleteDiscussion";
import type { Discussion } from "~discussions/shared/types";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

interface DeleteDiscussionDialogProps {
  discussion: Discussion;
}

const props = defineProps<DeleteDiscussionDialogProps>();

const emit = defineEmits<{
  success: [];
}>();

const { addNotification } = useNotifications();
const deleteDiscussion = useDeleteDiscussion();
const isOpen = ref(false);
const isPending = ref(false);

const handleConfirm = async () => {
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

  addNotification({
    type: "success",
    title: "Discussion Deleted",
  });
  emit("success");
  isPending.value = false;
  isOpen.value = false;
};

const handleOpenChange = (value: boolean) => {
  if (!value && isPending.value) return;

  isOpen.value = value;
};
</script>

<template>
  <ConfirmationDialog
    :open="isOpen"
    :is-loading="isPending"
    variant="danger"
    title="Delete Discussion"
    :body="`Are you sure you want to delete &quot;${discussion.title}&quot;? This action cannot be undone.`"
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="handleConfirm"
    @update:open="handleOpenChange"
  >
    <template #triggerButton>
      <slot name="triggerButton" />
    </template>
  </ConfirmationDialog>
</template>
