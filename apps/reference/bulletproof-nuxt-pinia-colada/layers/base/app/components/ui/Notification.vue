<script setup lang="ts">
import { Info, CheckCircle2, AlertCircle, XCircle, X } from "lucide-vue-next";
import { computed } from "vue";
import type { Notification } from "~base/app/composables/useNotifications";

interface NotificationProps {
  notification: Notification;
}

interface Emits {
  (e: "dismiss"): void;
}

const props = defineProps<NotificationProps>();
const emit = defineEmits<Emits>();

const iconComponent = computed(() => {
  const iconMap = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
  };
  return iconMap[props.notification.type];
});

const iconColorClass = computed(() => {
  const colorMap = {
    info: "text-blue-500",
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
  };
  return colorMap[props.notification.type];
});

const onDismiss = () => {
  emit("dismiss");
};
</script>

<template>
  <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
    <div
      class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5"
    >
      <div
        class="p-4"
        role="alert"
        :aria-label="notification.title"
      >
        <div class="flex items-start">
          <div class="shrink-0">
            <component
              :is="iconComponent"
              :class="['h-6 w-6', iconColorClass]"
              aria-hidden="true"
            />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">
              {{ notification.title }}
            </p>
            <p
              v-if="notification.message"
              class="mt-1 text-sm text-gray-500"
            >
              {{ notification.message }}
            </p>
          </div>
          <div class="ml-4 flex shrink-0">
            <button
              class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              aria-label="Close"
              @click="onDismiss"
            >
              <span class="sr-only">Close</span>
              <X
                class="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
