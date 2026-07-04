<script setup lang="ts">
import DialogFooterPrimitive from "~~/components/ui/dialog/DialogFooter.vue";
</script>

<template>
  <DialogFooterPrimitive v-bind="$attrs">
    <slot />
  </DialogFooterPrimitive>
</template>
