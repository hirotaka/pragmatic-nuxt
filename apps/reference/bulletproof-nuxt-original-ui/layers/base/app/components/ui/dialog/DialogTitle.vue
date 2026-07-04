<script setup lang="ts">
import DialogTitlePrimitive from "~~/components/ui/dialog/DialogTitle.vue";
</script>

<template>
  <DialogTitlePrimitive v-bind="$attrs">
    <slot />
  </DialogTitlePrimitive>
</template>
