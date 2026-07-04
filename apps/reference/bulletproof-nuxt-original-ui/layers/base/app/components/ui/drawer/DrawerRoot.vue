<script setup lang="ts">
import DrawerRootPrimitive from "~~/components/ui/drawer/DrawerRoot.vue";
</script>

<template>
  <DrawerRootPrimitive v-bind="$attrs">
    <slot />
  </DrawerRootPrimitive>
</template>
