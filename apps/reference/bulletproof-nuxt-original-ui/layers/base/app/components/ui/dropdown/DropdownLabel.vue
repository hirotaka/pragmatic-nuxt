<script setup lang="ts">
import DropdownLabelPrimitive from "~~/components/ui/dropdown-menu/DropdownLabel.vue";
</script>

<template>
  <DropdownLabelPrimitive v-bind="$attrs">
    <slot />
  </DropdownLabelPrimitive>
</template>
