<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@pinia/colada";
import { MoreHorizontal, Trash } from "lucide-vue-next";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { Button } from "~~/app/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "~~/app/components/ui/dropdown";
import { deleteUserMutation } from "~users/app/queries/users";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";

interface DeleteUserProps {
  id: string;
  asMenuItem?: boolean;
  actionLabel?: string;
}

const props = withDefaults(defineProps<DeleteUserProps>(), {
  actionLabel: "Open user actions",
});
const { user } = useUser();
const { addNotification } = useNotifications();
const isOpen = ref(false);
const { isLoading, mutateAsync, reset } = useMutation(deleteUserMutation());

const handleDelete = async () => {
  if (user.value?.id === props.id) return;

  reset();
  try {
    await mutateAsync(props.id);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "User Deleted",
  });
  isOpen.value = false;
};
</script>

<template>
  <div v-if="user?.id !== props.id">
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
          Delete User
        </DropdownItem>
      </DropdownContent>
    </DropdownRoot>
  </div>
  <ConfirmationDialog
    v-model:open="isOpen"
    variant="danger"
    title="Delete User"
    body="Are you sure you want to delete this user?"
    confirm-text="Delete User"
    cancel-text="Cancel"
    :is-loading="isLoading"
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
        Delete User
      </Button>
    </template>
  </ConfirmationDialog>
</template>
