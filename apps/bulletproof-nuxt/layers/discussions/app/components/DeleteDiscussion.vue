<script setup lang="ts">
import { ref } from "vue";
import { MoreHorizontal, Trash } from "lucide-vue-next";
import ConfirmationDialog from "~~/components/app/ConfirmationDialog.vue";
import { Button } from "@/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { useDeleteDiscussion } from "~discussions/app/composables/useDeleteDiscussion";
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

const isOpen = ref(false);

const deleteDiscussion = useDeleteDiscussion({
  onSuccess: async () => {
    addNotification({
      type: "success",
      title: "Discussion Deleted",
    });
    await refreshNuxtData();
    isOpen.value = false;
  },
});

const handleDelete = async () => {
  try {
    await deleteDiscussion.mutate(props.id);
  }
  catch {
    // Error is already handled in the composable
  }
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
      :is-loading="deleteDiscussion.isPending.value"
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
