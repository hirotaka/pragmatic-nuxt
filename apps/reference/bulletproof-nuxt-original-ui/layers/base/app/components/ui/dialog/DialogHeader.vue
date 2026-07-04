<script setup lang="ts">
import DialogHeaderPrimitive from "~~/components/ui/dialog/DialogHeader.vue";
</script>

<template>
  <DialogHeaderPrimitive v-bind="$attrs">
    <slot />
  </DialogHeaderPrimitive>
</template>
