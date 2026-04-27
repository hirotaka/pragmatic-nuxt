<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { cn } from '@/utils/cn'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

const variants = {
  light: 'text-white',
  primary: 'text-slate-600',
}

type SpinnerProps = {
  size?: keyof typeof sizes
  variant?: keyof typeof variants
  className?: string
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: 'md',
  variant: 'primary',
  className: '',
})

const spinnerClass = computed(() => {
  return cn(
    'animate-spin',
    sizes[props.size],
    variants[props.variant],
    props.className,
    attrs.class as string,
  )
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="spinnerClass"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
  <span class="sr-only">Loading</span>
</template>
