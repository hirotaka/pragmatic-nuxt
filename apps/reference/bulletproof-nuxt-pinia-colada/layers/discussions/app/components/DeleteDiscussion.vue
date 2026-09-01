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
import { deleteDiscussionMutation } from "~discussions/app/queries/discussions";
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

const { isLoading, mutateAsync, reset } = useMutation(deleteDiscussionMutation());

const handleDelete = async () => {
  reset();
  try {
    await mutateAsync(props.id);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Discussion Deleted",
  });
  isOpen.value = false;
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
          Delete Discussion
        </Button>
      </template>
    </ConfirmationDialog>
  </div>
</template>
