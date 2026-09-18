<script setup lang="ts">
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-vue-next";
import { computed, onScopeDispose, watch } from "vue";

const { notifications, dismissNotification } = useNotifications();
const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

if (import.meta.client) {
  watch(
    () => notifications.value.map(notification => notification.id),
    (notificationIds) => {
      const activeIds = new Set(notificationIds);

      for (const id of notificationIds) {
        if (!dismissTimers.has(id)) {
          dismissTimers.set(id, setTimeout(() => dismissNotification(id), 5000));
        }
      }

      for (const [id, timer] of dismissTimers) {
        if (!activeIds.has(id)) {
          clearTimeout(timer);
          dismissTimers.delete(id);
        }
      }
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    for (const timer of dismissTimers.values()) {
      clearTimeout(timer);
    }
    dismissTimers.clear();
  });
}

const notificationMeta = computed(() => ({
  info: { icon: Info, class: "text-blue-500" },
  success: { icon: CheckCircle2, class: "text-green-500" },
  warning: { icon: AlertCircle, class: "text-yellow-500" },
  error: { icon: XCircle, class: "text-red-500" },
}));
</script>

<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-50 flex flex-col items-end space-y-4 px-4 py-6 sm:p-6"
  >
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border bg-background shadow-lg"
    >
      <div
        class="p-4"
        role="alert"
        :aria-label="notification.title"
      >
        <div class="flex items-start gap-3">
          <component
            :is="notificationMeta[notification.type].icon"
            :class="['mt-0.5 size-5 shrink-0', notificationMeta[notification.type].class]"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-foreground">
              {{ notification.title }}
            </p>
            <p
              v-if="notification.message"
              class="mt-1 text-sm text-muted-foreground"
            >
              {{ notification.message }}
            </p>
          </div>
          <button
            class="rounded-md text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
            @click="dismissNotification(notification.id)"
          >
            <X class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
