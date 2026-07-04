<script setup lang="ts">
import SelectPrimitive from "~~/components/ui/select/Select.vue";
</script>

<template>
  <SelectPrimitive v-bind="$attrs">
    <slot />
  </SelectPrimitive>
</template>
