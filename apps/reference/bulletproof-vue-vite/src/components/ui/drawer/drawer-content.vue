<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Dialog as DrawerPrimitive } from 'reka-ui/namespaced'

import { type DrawerContentProps, drawerVariants } from '.'

import { cn } from '@/utils/cn'

const props = defineProps<DrawerContentProps>()
</script>

<template>
  <DrawerPrimitive.Portal>
    <DrawerPrimitive.Overlay
      class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DrawerPrimitive.Content :class="cn(drawerVariants({ side: props.side }), props.class)">
      <slot></slot>
      <DrawerPrimitive.Close
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
      >
        <X class="size-4" />
        <span class="sr-only">Close</span>
      </DrawerPrimitive.Close>
    </DrawerPrimitive.Content>
  </DrawerPrimitive.Portal>
</template>
