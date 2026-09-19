<script setup lang="ts">
import { MoreHorizontal, Trash } from "lucide-vue-next";
import { Button } from "~~/app/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "~~/app/components/ui/dropdown";
import type { User } from "~users/shared/types";
import DeleteUserDialog from "./DeleteUserDialog.vue";

interface UserActionsMenuProps {
  actionLabel: string;
  user: User;
}

defineProps<UserActionsMenuProps>();

const emit = defineEmits<{
  success: [];
}>();
</script>

<template>
  <DropdownRoot :modal="false">
    <DropdownTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        :aria-label="actionLabel"
      >
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownTrigger>
    <DropdownContent
      align="end"
      force-mount
      class="data-[state=closed]:hidden"
    >
      <DeleteUserDialog
        :user="user"
        @success="emit('success')"
      >
        <template #triggerButton>
          <DropdownItem class="text-destructive focus:text-destructive">
            <Trash class="mr-2 size-4" />
            Delete User
          </DropdownItem>
        </template>
      </DeleteUserDialog>
    </DropdownContent>
  </DropdownRoot>
</template>
