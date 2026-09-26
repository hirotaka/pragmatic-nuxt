<script setup lang="ts">
import { toast } from "vue-sonner";

interface DeleteUserDialogProps {
  user: User;
}

const props = defineProps<DeleteUserDialogProps>();

const emit = defineEmits<{
  success: [];
}>();

const deleteUser = useDeleteUser();
const isOpen = ref(false);
const isPending = ref(false);

const handleConfirm = async () => {
  if (isPending.value) return;

  isPending.value = true;
  try {
    await deleteUser(props.user.id);
  }
  catch {
    // `$api` reports the request failure; keep the dialog open for another attempt.
    isPending.value = false;
    return;
  }

  toast.success("User Deleted");
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
    variant="danger"
    title="Delete User"
    :body="`Are you sure you want to delete ${user.firstName} ${user.lastName}?`"
    confirm-text="Delete User"
    :is-loading="isPending"
    @confirm="handleConfirm"
    @update:open="handleOpenChange"
  >
    <template #triggerButton>
      <slot name="triggerButton" />
    </template>
  </ConfirmationDialog>
</template>
