<script setup lang="ts">
import { ref } from "vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { Button } from "~~/app/components/ui/button";
import { useDeleteUser } from "~users/app/composables/useDeleteUser";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DeleteUserProps {
  id: string;
  refresh: () => Promise<void>;
}

const props = defineProps<DeleteUserProps>();

const { user } = useUser();
const { addNotification } = useNotifications();

const isOpen = ref(false);
const isPending = ref(false);
const deleteUser = useDeleteUser();

const handleDelete = async () => {
  if (isPending.value) return;

  isPending.value = true;

  try {
    await deleteUser(props.id);
  }
  catch {
    // `$api` reports the request failure.
    isPending.value = false;
    return;
  }

  addNotification({
    type: "success",
    title: "User Deleted",
  });
  // The read owner reports refresh failures without changing mutation success.
  await props.refresh().catch(() => undefined);
  isOpen.value = false;
  isPending.value = false;
};
</script>

<template>
  <div v-if="user?.id !== id">
    <Button
      variant="destructive"
      @click="isOpen = true"
    >
      Delete
    </Button>

    <ConfirmationDialog
      v-model:open="isOpen"
      variant="danger"
      title="Delete User"
      body="Are you sure you want to delete this user?"
      confirm-text="Delete User"
      :is-loading="isPending"
      @confirm="handleDelete"
    />
  </div>
</template>
