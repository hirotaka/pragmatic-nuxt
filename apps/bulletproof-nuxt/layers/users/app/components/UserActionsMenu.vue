<script setup lang="ts">
import { MoreHorizontal, Trash } from "@lucide/vue";

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
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon-sm"
        :aria-label="actionLabel"
      >
        <MoreHorizontal data-icon="inline-start" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      force-mount
      class="data-[state=closed]:hidden"
    >
      <DropdownMenuGroup>
        <DeleteUserDialog
          :user="user"
          @success="emit('success')"
        >
          <template #triggerButton>
            <DropdownMenuItem variant="destructive">
              <Trash />
              Delete User
            </DropdownMenuItem>
          </template>
        </DeleteUserDialog>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
