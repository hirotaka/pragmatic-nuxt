<script setup lang="ts">
import RadioGroupItemPrimitive from "~~/components/ui/radio-group/RadioGroupItem.vue";
</script>

<template>
  <RadioGroupItemPrimitive v-bind="$attrs">
    <slot />
  </RadioGroupItemPrimitive>
</template>
