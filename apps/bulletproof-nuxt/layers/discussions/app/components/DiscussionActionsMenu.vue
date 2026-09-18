<script setup lang="ts">
import { MoreHorizontal, Trash } from "lucide-vue-next";
import { Button } from "~~/app/components/ui/button";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownTrigger,
} from "~~/app/components/ui/dropdown";
import type { Discussion } from "~discussions/shared/types";
import DeleteDiscussionDialog from "./DeleteDiscussionDialog.vue";

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
  <DropdownRoot>
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
      <DeleteDiscussionDialog
        :discussion="discussion"
        @success="emit('success')"
      >
        <template #triggerButton>
          <DropdownItem class="text-destructive focus:text-destructive">
            <Trash class="mr-2 size-4" />
            Delete Discussion
          </DropdownItem>
        </template>
      </DeleteDiscussionDialog>
    </DropdownContent>
  </DropdownRoot>
</template>
