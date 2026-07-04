<script setup lang="ts">
import DrawerHeaderPrimitive from "~~/components/ui/drawer/DrawerHeader.vue";
</script>

<template>
  <DrawerHeaderPrimitive v-bind="$attrs">
    <slot />
  </DrawerHeaderPrimitive>
</template>
