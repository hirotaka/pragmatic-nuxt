<script setup lang="ts">
import DrawerTitlePrimitive from "~~/components/ui/drawer/DrawerTitle.vue";
</script>

<template>
  <DrawerTitlePrimitive v-bind="$attrs">
    <slot />
  </DrawerTitlePrimitive>
</template>
