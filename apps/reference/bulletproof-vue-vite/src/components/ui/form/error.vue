<script setup lang="ts">
type ErrorProps = {
  errorMessage?: string | null
}

defineProps<ErrorProps>()
</script>

<template>
  <div
    v-if="errorMessage"
    role="alert"
    :aria-label="errorMessage"
    class="text-sm font-semibold text-red-500"
  >
    {{ errorMessage }}
  </div>
</template>
