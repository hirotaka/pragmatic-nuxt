<script setup lang="ts">
type AppSuspenseProps = {
  isLoading: boolean
}

defineProps<AppSuspenseProps>()
</script>

<template>
  <div>
    <template v-if="isLoading">
      <slot name="fallback" />
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>
