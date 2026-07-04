<script setup lang="ts">
import DrawerDescriptionPrimitive from "~~/components/ui/drawer/DrawerDescription.vue";
</script>

<template>
  <DrawerDescriptionPrimitive v-bind="$attrs">
    <slot />
  </DrawerDescriptionPrimitive>
</template>
