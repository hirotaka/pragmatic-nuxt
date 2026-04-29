<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DropdownMenuSeparator,
  type DropdownMenuSeparatorProps,
} from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends DropdownMenuSeparatorProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuSeparator
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
  />
</template>
