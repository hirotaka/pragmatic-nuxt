<script setup lang="ts">
import { Dialog as DrawerPrimitive } from 'reka-ui/namespaced'
</script>

<template>
  <DrawerPrimitive.Title class="text-lg font-semibold text-foreground">
    <slot></slot>
  </DrawerPrimitive.Title>
</template>
