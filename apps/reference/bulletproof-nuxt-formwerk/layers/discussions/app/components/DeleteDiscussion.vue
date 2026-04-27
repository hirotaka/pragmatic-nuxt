<script setup lang="ts">
import { ref } from "vue";
import { Trash } from "lucide-vue-next";
import { useDeleteDiscussion } from "~discussions/app/composables/useDeleteDiscussion";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DeleteDiscussionProps {
  id: string;
}

const props = defineProps<DeleteDiscussionProps>();
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
    <UConfirmationDialog
      v-model:open="isOpen"
      variant="danger"
      title="Delete Discussion"
      body="Are you sure you want to delete this discussion?"
      confirm-text="Delete Discussion"
      cancel-text="Cancel"
      :is-loading="deleteDiscussion.isPending.value"
      @confirm="handleDelete"
    >
      <template #triggerButton>
        <UButton variant="destructive">
          <template #icon>
            <Trash class="size-4" />
          </template>
          Delete Discussion
        </UButton>
      </template>
    </UConfirmationDialog>
  </div>
</template>
