<script setup lang="ts">
import DrawerPortalPrimitive from "~~/components/ui/drawer/DrawerPortal.vue";
</script>

<template>
  <DrawerPortalPrimitive v-bind="$attrs">
    <slot />
  </DrawerPortalPrimitive>
</template>
