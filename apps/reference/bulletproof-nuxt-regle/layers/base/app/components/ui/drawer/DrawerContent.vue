<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DialogContent,
  type DialogContentProps,
  DialogClose,
} from "reka-ui";
import { X } from "lucide-vue-next";
import { cn } from "~base/app/lib/utils";
import DrawerPortal from "./DrawerPortal.vue";
import DrawerOverlay from "./DrawerOverlay.vue";

interface Props extends DialogContentProps {
  class?: HTMLAttributes["class"];
  side?: "left" | "right" | "top" | "bottom";
}

const props = withDefaults(defineProps<Props>(), {
  side: "right",
  class: undefined,
});

const sideClasses = {
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
  top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom:
    "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
};
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DialogContent
      :class="
        cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          sideClasses[side],
          props.class,
        )
      "
      v-bind="props"
    >
      <slot />

      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DrawerPortal>
</template>
