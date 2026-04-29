<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  SelectPortal,
  SelectContent,
  type SelectContentProps,
} from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends SelectContentProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  position: "popper",
  class: undefined,
});
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="props"
      :class="
        cn(
          'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper'
            && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.class,
        )
      "
    >
      <div class="p-1">
        <slot />
      </div>
    </SelectContent>
  </SelectPortal>
</template>
