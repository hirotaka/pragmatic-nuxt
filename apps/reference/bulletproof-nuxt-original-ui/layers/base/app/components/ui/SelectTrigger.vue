<script setup lang="ts">
import SelectTriggerPrimitive from "~~/components/ui/select/SelectTrigger.vue";
</script>

<template>
  <SelectTriggerPrimitive v-bind="$attrs">
    <slot />
  </SelectTriggerPrimitive>
</template>
