<script setup lang="ts">
import { Dialog as DrawerPrimitive } from 'reka-ui/namespaced'
</script>

<template>
  <DrawerPrimitive.Description class="text-sm text-muted-foreground">
    <slot></slot>
  </DrawerPrimitive.Description>
</template>
