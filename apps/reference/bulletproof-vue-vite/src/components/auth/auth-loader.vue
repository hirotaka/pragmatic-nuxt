<script setup lang="ts">
/**
 * AuthLoader - Vue port of react-query-auth's AuthLoader
 *
 * Manages authentication UI states automatically:
 * - Shows loading slot while fetching user
 * - Shows error slot on critical errors (not 401)
 * - Shows default slot when user is fetched (authenticated or not)
 *
 * Note: 401 errors are expected when not logged in and are treated as
 * "unauthenticated" rather than "error" state.
 */
import { computed } from 'vue'

import { useUser } from '@/lib/auth'

const user = useUser()

// Check if error is a critical error (not a 401 auth error)
const isCriticalError = computed(() => {
  if (user.status.value !== 'error') return false
  const error = user.error.value as Error & { response?: { status?: number } }
  // 401 is expected when not logged in, not a critical error
  return error?.response?.status !== 401
})
</script>

<template>
  <!-- Loading state: while fetching user -->
  <slot v-if="user.isLoading.value" name="loading" />

  <!-- Error state: only for critical errors (not 401) -->
  <slot v-else-if="isCriticalError" name="error" :error="user.error.value" />

  <!-- Success state: user data is available (may be null/undefined if not authenticated) -->
  <slot v-else />
</template>
