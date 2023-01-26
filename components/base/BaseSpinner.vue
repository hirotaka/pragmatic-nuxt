<script lang="ts">
export const baseSpinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
}

export const baseSpinnerVariants = {
  light: 'text-white',
  primary: 'text-blue-600'
}
</script>

<script setup lang="ts">
interface BaseSpinnerProps {
  size?: keyof typeof baseSpinnerSizes
  variant?: keyof typeof baseSpinnerVariants
  textCurrent?: string
}

withDefaults(defineProps<BaseSpinnerProps>(), {
  variant: 'primary',
  size: 'md',
  textCurrent: ''
})
</script>

<template>
  <svg
    class="animate-spin"
    :class="[baseSpinnerVariants[variant], baseSpinnerSizes[size], textCurrent]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    data-testid="loading"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
  <span class="sr-only">Loading</span>
</template>
