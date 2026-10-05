<script setup lang="ts">
import { MoreHorizontal, Trash } from "@lucide/vue";

interface CommentActionsMenuProps {
  actionLabel: string;
  commentId: string;
}

defineProps<CommentActionsMenuProps>();

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
        class="shrink-0"
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
        <DeleteCommentDialog
          :comment-id="commentId"
          @success="emit('success')"
        >
          <template #triggerButton>
            <DropdownMenuItem variant="destructive">
              <Trash />
              Delete Comment
            </DropdownMenuItem>
          </template>
        </DeleteCommentDialog>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
