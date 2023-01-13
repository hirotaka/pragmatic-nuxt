<script setup lang="ts">
import { useSlots, cloneVNode, watchEffect } from "vue";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

import { BaseDialogTitle } from "./BaseDialog.vue";

interface ConfirmationDialogProps {
  icon?: "danger" | "info";
  title: string;
  body?: string;
  cancelButtonText?: string;
  isDone?: boolean;
}

const { isOpen, open, close } = useDisclosure();
const slots = useSlots();

const props = withDefaults(defineProps<ConfirmationDialogProps>(), {
  icon: "danger",
  cancelButtonText: "Cancel",
  isDone: false,
});

watchEffect(() => {
  if (props.isDone) {
    close();
  }
});
</script>

<template>
  <component
    :is="
      cloneVNode(slots.triggerButton()[0], {
        onClick: () => open(),
      })
    "
  />
  <BaseDialog :is-open="isOpen" @close="close">
    <div
      class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
    >
      <div class="sm:flex sm:items-start">
        <div
          v-if="icon === 'danger'"
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
        >
          <ExclamationTriangleIcon
            class="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div
          v-if="icon === 'info'"
          class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
        >
          <InformationCircleIcon
            class="h-6 w-6 text-blue-600"
            aria-hidden="true"
          />
        </div>
        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <BaseDialogTitle
            as="h3"
            class="text-lg leading-6 font-medium text-gray-900"
          >
            {{ title }}
          </BaseDialogTitle>
          <div v-if="body" class="mt-2">
            <p class="text-sm text-gray-500">{{ body }}</p>
          </div>
        </div>
      </div>
      <div class="mt-4 flex space-x-2 justify-end">
        <BaseButton
          type="button"
          variant="inverse"
          class="w-full inline-flex justify-center rounded-md border focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          @click="close"
        >
          {{ cancelButtonText }}
        </BaseButton>
        <slot name="confirmButton"></slot>
      </div>
    </div>
  </BaseDialog>
</template>
