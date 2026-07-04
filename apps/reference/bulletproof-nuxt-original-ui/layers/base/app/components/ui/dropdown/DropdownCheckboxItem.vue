<script setup lang="ts">
import DropdownCheckboxItemPrimitive from "~~/components/ui/dropdown-menu/DropdownCheckboxItem.vue";
</script>

<template>
  <DropdownCheckboxItemPrimitive v-bind="$attrs">
    <slot />
  </DropdownCheckboxItemPrimitive>
</template>
