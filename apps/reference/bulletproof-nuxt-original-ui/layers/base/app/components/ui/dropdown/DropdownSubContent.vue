<script setup lang="ts">
import DropdownSubContentPrimitive from "~~/components/ui/dropdown-menu/DropdownSubContent.vue";
</script>

<template>
  <DropdownSubContentPrimitive v-bind="$attrs">
    <slot />
  </DropdownSubContentPrimitive>
</template>
