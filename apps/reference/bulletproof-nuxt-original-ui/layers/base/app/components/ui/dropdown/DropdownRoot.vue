<script setup lang="ts">
import DropdownRootPrimitive from "~~/components/ui/dropdown-menu/DropdownRoot.vue";
</script>

<template>
  <DropdownRootPrimitive v-bind="$attrs">
    <slot />
  </DropdownRootPrimitive>
</template>
