<script setup lang="ts">
import DialogTriggerPrimitive from "~~/components/ui/dialog/DialogTrigger.vue";
</script>

<template>
  <DialogTriggerPrimitive v-bind="$attrs">
    <slot />
  </DialogTriggerPrimitive>
</template>
