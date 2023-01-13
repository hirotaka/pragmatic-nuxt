<script lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogOverlay,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";

export const BaseDialogTitle = DialogTitle;
export const BaseDialogDescription = DialogDescription;
</script>

<script setup lang="ts">
// TODO: Make `initialFocus` works properly.
interface BaseDialogProps {
  isOpen: boolean;
  initialFocus?: HTMLElement<null>;
}

interface Emits {
  (e: "close"): void;
}

defineProps<BaseDialogProps>();
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
      class="fixed z-10 inset-0 overflow-y-auto"
      :open="isOpen"
      @close="close"
    >
      <div
        class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
      >
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <!-- TODO: Replace `as="span"` with appropriate one -->
        <TransitionChild
          as="span"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <slot></slot>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
