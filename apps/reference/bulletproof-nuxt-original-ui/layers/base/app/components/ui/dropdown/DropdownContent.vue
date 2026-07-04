<script setup lang="ts">
import DropdownContentPrimitive from "~~/components/ui/dropdown-menu/DropdownContent.vue";
</script>

<template>
  <DropdownContentPrimitive v-bind="$attrs">
    <slot />
  </DropdownContentPrimitive>
</template>
