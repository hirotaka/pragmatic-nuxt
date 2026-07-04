<script setup lang="ts">
import DropdownTriggerPrimitive from "~~/components/ui/dropdown-menu/DropdownTrigger.vue";
</script>

<template>
  <DropdownTriggerPrimitive v-bind="$attrs">
    <slot />
  </DropdownTriggerPrimitive>
</template>
