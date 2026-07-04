<script setup lang="ts">
import TableCellPrimitive from "~~/components/ui/table/TableCell.vue";
</script>

<template>
  <TableCellPrimitive v-bind="$attrs">
    <slot />
  </TableCellPrimitive>
</template>
