<script setup lang="ts">
import SelectContentPrimitive from "~~/components/ui/select/SelectContent.vue";
</script>

<template>
  <SelectContentPrimitive v-bind="$attrs">
    <slot />
  </SelectContentPrimitive>
</template>
