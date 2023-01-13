<script setup lang="ts">
import { useAuth } from "@/composables/useAuth";
import { useDeleteUser } from "@/composables/api/users/deleteUser";

type DeleteUserProps = {
  id: string;
};

const props = defineProps<DeleteUserProps>();

const { user } = useAuth();
const { isLoading, isSuccess, mutateAsync } = useDeleteUser();

async function onClick() {
  await mutateAsync({ userId: props.id });
}
</script>

<template>
  <BaseConfirmationDialog
    v-if="user?.id !== id"
    :is-done="isSuccess"
    icon="danger"
    title="Delete User"
    body="Are you sure you want to delete this user?"
  >
    <template #triggerButton>
      <BaseButton variant="danger">Delete</BaseButton>
    </template>
    <template #confirmButton>
      <BaseButton
        type="button"
        class="bg-red-600"
        :is-loading="isLoading"
        @click="onClick"
      >
        Delete User
      </BaseButton>
    </template>
  </BaseConfirmationDialog>
</template>
