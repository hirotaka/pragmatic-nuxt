<script setup lang="ts">
import LabelPrimitive from "~~/components/ui/label/Label.vue";
</script>

<template>
  <LabelPrimitive v-bind="$attrs">
    <slot />
  </LabelPrimitive>
</template>
