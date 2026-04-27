<script setup lang="ts">
import { cn } from '@/utils/cn'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <nav
    role="navigation"
    aria-label="pagination"
    :class="cn('mx-auto flex w-full justify-center', props.class)"
  >
    <slot></slot>
  </nav>
</template>
