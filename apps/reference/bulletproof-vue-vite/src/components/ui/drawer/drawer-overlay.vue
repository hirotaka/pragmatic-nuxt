<script setup lang="ts">
import { Dialog as DrawerPrimitive } from 'reka-ui/namespaced'
</script>

<template>
  <DrawerPrimitive.Overlay
    class="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
  >
    <slot></slot>
  </DrawerPrimitive.Overlay>
</template>
