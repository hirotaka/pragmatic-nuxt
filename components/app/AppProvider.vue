<script setup lang="ts">
const {
  isSuccess,
  isLoading,
  waitInitial,
  isIdle,
  status,
  LoaderComponent,
  ErrorComponent,
} = provideAuth();
</script>

<template>
  <div>
    <AppNotifications />
    <template v-if="isLoading || isIdle">
      <component :is="LoaderComponent" />
    </template>
    <template v-else-if="isSuccess || !waitInitial">
      <slot></slot>
    </template>
    <template v-else-if="error">
      <component :is="ErrorComponent" :error="error" />
    </template>
    <template v-else>
      <div>Unhandled status: {{ status }}</div>
    </template>
  </div>
</template>
