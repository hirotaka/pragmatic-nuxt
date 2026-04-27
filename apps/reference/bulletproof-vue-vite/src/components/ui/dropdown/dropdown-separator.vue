<script setup lang="ts">
import { DropdownMenu as DropdownPrimitive } from 'reka-ui/namespaced'

import { cn } from '@/utils/cn'

type DropdownSeparatorProps = {
  class?: string
}

const props = defineProps<DropdownSeparatorProps>()
</script>

<template>
  <DropdownPrimitive.Separator :class="cn('-mx-1 my-1 h-px bg-muted', props.class)" />
</template>
