<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DialogContent,
  type DialogContentProps,
  DialogClose,
} from "reka-ui";
import { X } from "lucide-vue-next";
import { cn } from "~base/app/lib/utils";
import DialogPortal from "./DialogPortal.vue";
import DialogOverlay from "./DialogOverlay.vue";

interface Props extends DialogContentProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-&lsqb;state=closed&rsqb;:slide-out-to-top-&lsqb;48%&rsqb; data-[state=open]:slide-in-from-left-1/2 data-&lsqb;state=open&rsqb;:slide-in-from-top-&lsqb;48%&rsqb; sm:rounded-lg',
          props.class,
        )
      "
      v-bind="props"
    >
      <slot />

      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
