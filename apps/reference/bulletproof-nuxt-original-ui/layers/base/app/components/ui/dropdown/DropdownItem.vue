<script setup lang="ts">
import DropdownItemPrimitive from "~~/components/ui/dropdown-menu/DropdownItem.vue";
</script>

<template>
  <DropdownItemPrimitive v-bind="$attrs">
    <slot />
  </DropdownItemPrimitive>
</template>
