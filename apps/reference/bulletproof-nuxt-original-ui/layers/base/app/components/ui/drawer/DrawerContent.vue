<script setup lang="ts">
import DrawerContentPrimitive from "~~/components/ui/drawer/DrawerContent.vue";
</script>

<template>
  <DrawerContentPrimitive v-bind="$attrs">
    <slot />
  </DrawerContentPrimitive>
</template>
