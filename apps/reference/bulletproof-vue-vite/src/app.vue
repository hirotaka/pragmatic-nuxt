<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { RouterView } from 'vue-router';

import AuthLoader from '@/components/auth/auth-loader.vue';
import { ErrorBoundary, MainErrorFallback } from '@/components/errors';
import { Notifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';

const isDev = import.meta.env.DEV;
</script>

<template>
  <ErrorBoundary :fallback="MainErrorFallback">
    <Notifications />
    <AuthLoader>
      <template #loading>
        <div class="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      </template>

      <template #default>
        <RouterView />
      </template>
    </AuthLoader>
    <VueQueryDevtools v-if="isDev" />
  </ErrorBoundary>
</template>
