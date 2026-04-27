<script setup lang="ts">
import { ref } from "vue";
import { useDeleteUser } from "~users/app/composables/useDeleteUser";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DeleteUserProps {
  id: string;
}

const props = defineProps<DeleteUserProps>();

const { user } = useUser();
const { addNotification } = useNotifications();

const isOpen = ref(false);

const deleteUserMutation = useDeleteUser({
  onSuccess: () => {
    addNotification({
      type: "success",
      title: "User Deleted",
    });
    isOpen.value = false;
  },
});

const handleDelete = () => {
  deleteUserMutation.mutate(props.id);
};
</script>

<template>
  <div v-if="user?.id !== id">
    <UButton
      variant="destructive"
      @click="isOpen = true"
    >
      Delete
    </UButton>

    <UConfirmationDialog
      v-model:open="isOpen"
      variant="danger"
      title="Delete User"
      body="Are you sure you want to delete this user?"
      confirm-text="Delete User"
      :is-loading="deleteUserMutation.isPending.value"
      @confirm="handleDelete"
    />
  </div>
</template>
