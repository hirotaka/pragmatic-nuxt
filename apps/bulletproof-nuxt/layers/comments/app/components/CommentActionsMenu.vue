<script setup lang="ts">
import { MoreHorizontal, Trash } from "lucide-vue-next";
import { Button } from "~~/app/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "~~/app/components/ui/dropdown";
import DeleteCommentDialog from "./DeleteCommentDialog.vue";

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
  <DropdownRoot :modal="false">
    <DropdownTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-8 shrink-0"
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
      <DeleteCommentDialog
        :comment-id="commentId"
        @success="emit('success')"
      >
        <template #triggerButton>
          <DropdownItem class="text-destructive focus:text-destructive">
            <Trash class="mr-2 size-4" />
            Delete Comment
          </DropdownItem>
        </template>
      </DeleteCommentDialog>
    </DropdownContent>
  </DropdownRoot>
</template>
