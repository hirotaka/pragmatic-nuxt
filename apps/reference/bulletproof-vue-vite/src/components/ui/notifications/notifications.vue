<script setup lang="ts">
import Notification from './notification.vue'
import { useNotifications } from './notifications-store'

const { notifications, dismissNotification } = useNotifications()
</script>

<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-50 flex flex-col items-end space-y-4 px-4 py-6 sm:items-start sm:p-6"
  >
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :notification="notification"
      @dismiss="dismissNotification(notification.id)"
    />
  </div>
</template>
