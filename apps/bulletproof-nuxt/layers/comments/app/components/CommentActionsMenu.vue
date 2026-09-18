<script setup lang="ts">
import { ref } from "vue";
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

const isDeleteDialogOpen = ref(false);
</script>

<template>
  <DropdownRoot>
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
    <DropdownContent align="end">
      <DropdownItem
        class="text-destructive focus:text-destructive"
        @click="isDeleteDialogOpen = true"
      >
        <Trash class="mr-2 size-4" />
        Delete Comment
      </DropdownItem>
    </DropdownContent>
  </DropdownRoot>

  <DeleteCommentDialog
    v-model:open="isDeleteDialogOpen"
    :comment-id="commentId"
    @success="emit('success')"
  />
</template>
