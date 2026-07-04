<script setup lang="ts">
import DropdownSubTriggerPrimitive from "~~/components/ui/dropdown-menu/DropdownSubTrigger.vue";
</script>

<template>
  <DropdownSubTriggerPrimitive v-bind="$attrs">
    <slot />
  </DropdownSubTriggerPrimitive>
</template>
