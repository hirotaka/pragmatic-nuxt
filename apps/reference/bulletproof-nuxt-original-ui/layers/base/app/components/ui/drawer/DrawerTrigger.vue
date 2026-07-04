<script setup lang="ts">
import DrawerTriggerPrimitive from "~~/components/ui/drawer/DrawerTrigger.vue";
</script>

<template>
  <DrawerTriggerPrimitive v-bind="$attrs">
    <slot />
  </DrawerTriggerPrimitive>
</template>
