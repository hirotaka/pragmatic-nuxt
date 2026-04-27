<script setup lang="ts">
import Error from './error.vue'
import Label from './label.vue'

type FieldWrapperProps = {
  label?: string
  error?: string
  description?: string
  required?: boolean
}

defineProps<FieldWrapperProps>()
</script>

<template>
  <div>
    <Label v-if="label">
      {{ label }}
      <span v-if="required" class="ml-1 text-red-500" aria-label="required">*</span>
      <div class="mt-1">
        <slot />
      </div>
    </Label>
    <div v-else class="mt-1">
      <slot />
    </div>
    <p v-if="description" class="mt-1 text-sm text-gray-500">
      {{ description }}
    </p>
    <Error :error-message="error" />
  </div>
</template>
