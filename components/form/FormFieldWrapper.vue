<script setup lang="ts">
interface FieldWrapperProps {
  label?: string;
  errorMessage?: string;
}

defineProps<FieldWrapperProps>();
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
      <div class="mt-1">
        <slot></slot>
      </div>
    </label>
    <div
      v-if="errorMessage"
      role="alert"
      :aria-label="errorMessage"
      class="text-sm font-semibold text-red-500"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>
