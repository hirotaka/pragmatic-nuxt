<script setup lang="ts">
import TableFooterPrimitive from "~~/components/ui/table/TableFooter.vue";
</script>

<template>
  <TableFooterPrimitive v-bind="$attrs">
    <slot />
  </TableFooterPrimitive>
</template>
