<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { onScopeDispose } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import {
  deleteDiscussionMutation,
  invalidateDiscussionLists,
} from "~discussions/app/queries/discussions";
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
const queryClient = useQueryClient();
const { isPending, mutateAsync } = useMutation(deleteDiscussionMutation());
let isDisposed = false;

onScopeDispose(() => {
  isDisposed = true;
});

const handleConfirm = async () => {
  if (isPending.value) return;

  try {
    await mutateAsync(props.discussion.id);
  }
  catch {
    // `$api` reports request failures; leave the confirmation dialog ready to retry.
    return;
  }
  if (isDisposed) return;

  addNotification({
    type: "success",
    title: "Discussion Deleted",
  });
  emit("update:open", false);
  emit("success");

  // Synchronization is intentionally detached from the committed write.
  void invalidateDiscussionLists(queryClient).catch(() => undefined);
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
