<script setup lang="ts">
import DialogPortalPrimitive from "~~/components/ui/dialog/DialogPortal.vue";
</script>

<template>
  <DialogPortalPrimitive v-bind="$attrs">
    <slot />
  </DialogPortalPrimitive>
</template>
