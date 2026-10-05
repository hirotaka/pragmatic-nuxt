<script setup lang="ts">
import { MoreHorizontal, Trash } from "@lucide/vue";

interface DiscussionActionsMenuProps {
  actionLabel: string;
  discussion: Discussion;
}

defineProps<DiscussionActionsMenuProps>();

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
        <DeleteDiscussionDialog
          :discussion="discussion"
          @success="emit('success')"
        >
          <template #triggerButton>
            <DropdownMenuItem variant="destructive">
              <Trash />
              Delete Discussion
            </DropdownMenuItem>
          </template>
        </DeleteDiscussionDialog>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
