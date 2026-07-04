<script setup lang="ts">
import TableCaptionPrimitive from "~~/components/ui/table/TableCaption.vue";
</script>

<template>
  <TableCaptionPrimitive v-bind="$attrs">
    <slot />
  </TableCaptionPrimitive>
</template>
