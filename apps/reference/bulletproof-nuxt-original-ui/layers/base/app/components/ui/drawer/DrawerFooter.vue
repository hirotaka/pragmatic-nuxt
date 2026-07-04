<script setup lang="ts">
import DrawerFooterPrimitive from "~~/components/ui/drawer/DrawerFooter.vue";
</script>

<template>
  <DrawerFooterPrimitive v-bind="$attrs">
    <slot />
  </DrawerFooterPrimitive>
</template>
