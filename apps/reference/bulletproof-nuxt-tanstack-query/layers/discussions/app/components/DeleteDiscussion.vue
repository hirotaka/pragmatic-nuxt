<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { MoreHorizontal, Trash } from "lucide-vue-next";
import { onScopeDispose, ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { Button } from "~~/app/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "~~/app/components/ui/dropdown";
import {
  deleteDiscussionMutation,
  invalidateDiscussionLists,
} from "~discussions/app/queries/discussions";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DeleteDiscussionProps {
  id: string;
  asMenuItem?: boolean;
  actionLabel?: string;
}

const props = withDefaults(defineProps<DeleteDiscussionProps>(), {
  actionLabel: "Open discussion actions",
});
const { addNotification } = useNotifications();
const { isAdmin } = useUser();
const queryClient = useQueryClient();
const { isPending, mutateAsync } = useMutation(deleteDiscussionMutation());
const isOpen = ref(false);
let isDisposed = false;

onScopeDispose(() => {
  isDisposed = true;
});

const handleDelete = async () => {
  if (isPending.value) return;

  try {
    await mutateAsync(props.id);
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
  isOpen.value = false;

  // Synchronization is intentionally detached from the committed write.
  void invalidateDiscussionLists(queryClient).catch(() => undefined);
};
</script>

<template>
  <div v-if="isAdmin">
    <DropdownRoot v-if="asMenuItem">
      <DropdownTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
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
          Delete Discussion
        </DropdownItem>
      </DropdownContent>
    </DropdownRoot>
    <ConfirmationDialog
      v-model:open="isOpen"
      variant="danger"
      title="Delete Discussion"
      body="Are you sure you want to delete this discussion?"
      confirm-text="Delete Discussion"
      cancel-text="Cancel"
      :is-loading="isPending"
      @confirm="handleDelete"
    >
      <template
        v-if="!asMenuItem"
        #triggerButton
      >
        <Button variant="destructive">
          <template #icon>
            <Trash class="size-4" />
          </template>
          Delete Discussion
        </Button>
      </template>
    </ConfirmationDialog>
  </div>
</template>
