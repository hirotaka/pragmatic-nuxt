<script setup lang="ts">
import DialogDescriptionPrimitive from "~~/components/ui/dialog/DialogDescription.vue";
</script>

<template>
  <DialogDescriptionPrimitive v-bind="$attrs">
    <slot />
  </DialogDescriptionPrimitive>
</template>
