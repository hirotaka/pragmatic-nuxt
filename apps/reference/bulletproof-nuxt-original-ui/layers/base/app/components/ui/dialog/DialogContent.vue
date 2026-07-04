<script setup lang="ts">
import DialogContentPrimitive from "~~/components/ui/dialog/DialogContent.vue";
</script>

<template>
  <DialogContentPrimitive v-bind="$attrs">
    <slot />
  </DialogContentPrimitive>
</template>
