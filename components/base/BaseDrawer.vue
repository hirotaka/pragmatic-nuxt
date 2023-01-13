<script lang="ts">
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export interface BaseDrawerProps {
  isOpen: boolean;
  title: string;
  size?: keyof typeof sizes;
}
</script>

<script setup lang="ts">
interface Emits {
  (e: "close"): void;
}

withDefaults(defineProps<BaseDrawerProps>(), {
  size: "md",
});
const emit = defineEmits<Emits>();

const close = () => {
  emit("close");
};
</script>

<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog
      as="div"
      static
      class="fixed inset-0 overflow-hidden z-40"
      :open="isOpen"
      @close="close"
    >
      <div class="absolute inset-0 overflow-hidden">
        <DialogOverlay class="absolute inset-0" />
        <div class="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <TransitionChild
            as="template"
            enter="transform transition ease-in-out duration-300 sm:duration-300"
            enter-from="translate-x-full"
            enter-to="translate-x-0"
            leave="transform transition ease-in-out duration-300 sm:duration-300"
            leave-from="translate-x-0"
            leave-to="translate-x-full"
          >
            <div class="w-screen" :class="sizes[size]">
              <div
                class="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl"
              >
                <div
                  class="min-h-0 flex-1 flex flex-col py-6 overflow-y-scroll"
                >
                  <div class="px-4 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle class="text-lg font-medium text-gray-900">
                        {{ title }}
                      </DialogTitle>
                      <div class="ml-3 h-7 flex items-center">
                        <button
                          class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          @click="close"
                        >
                          <span class="sr-only">Close panel</span>
                          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="mt-6 relative flex-1 px-4 sm:px-6">
                    <slot />
                  </div>
                </div>
                <div class="flex-shrink-0 px-4 py-4 flex justify-end space-x-2">
                  <slot name="footer"></slot>
                </div>
              </div>
            </div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
