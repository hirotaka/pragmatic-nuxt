<script setup lang="ts">
import DialogRootPrimitive from "~~/components/ui/dialog/DialogRoot.vue";
</script>

<template>
  <DialogRootPrimitive v-bind="$attrs">
    <slot />
  </DialogRootPrimitive>
</template>
