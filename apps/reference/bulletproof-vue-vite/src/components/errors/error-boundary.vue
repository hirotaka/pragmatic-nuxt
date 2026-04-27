<script setup lang="ts">
import type { Component } from 'vue'
import { onErrorCaptured, ref } from 'vue'

type ErrorBoundaryProps = {
  fallback?: Component
}

withDefaults(defineProps<ErrorBoundaryProps>(), {
  fallback: undefined,
})

const error = ref<Error | null>(null)

// Capture errors from child components
onErrorCaptured((err: Error) => {
  error.value = err
  // Return false to prevent the error from propagating further
  return false
})

const reset = () => {
  error.value = null
}

// Expose reset method to parent if needed
defineExpose({
  reset,
})
</script>

<template>
  <div>
    <!-- Show fallback component if error exists -->
    <component :is="fallback" v-if="error && fallback" :error="error" :reset="reset" />

    <!-- Show default slot if no error -->
    <slot v-else />
  </div>
</template>
