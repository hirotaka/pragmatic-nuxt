<script setup lang="ts">
import { ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
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
const deleteDiscussion = useDeleteDiscussion();
const isPending = ref(false);

const handleConfirm = async () => {
  isPending.value = true;
  try {
    await deleteDiscussion(props.discussion.id);
    addNotification({
      type: "success",
      title: "Discussion Deleted",
    });
    emit("update:open", false);
    emit("success");
  }
  catch {
    // `$api` reports the request failure; keep the dialog open for another attempt.
  }
  finally {
    isPending.value = false;
  }
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
    :is-loading="isPending"
    variant="danger"
    title="Delete Discussion"
    :body="`Are you sure you want to delete &quot;${discussion.title}&quot;? This action cannot be undone.`"
    confirm-text="Delete"
    cancel-text="Cancel"
    @confirm="handleConfirm"
    @update:open="handleOpenChange"
  />
</template>
