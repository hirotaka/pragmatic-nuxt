<script setup lang="ts">
import RadioGroupPrimitive from "~~/components/ui/radio-group/RadioGroup.vue";
</script>

<template>
  <RadioGroupPrimitive v-bind="$attrs">
    <slot />
  </RadioGroupPrimitive>
</template>
