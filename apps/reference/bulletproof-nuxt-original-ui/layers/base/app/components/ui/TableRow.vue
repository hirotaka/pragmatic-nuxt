<script setup lang="ts">
import TableRowPrimitive from "~~/components/ui/table/TableRow.vue";
</script>

<template>
  <TableRowPrimitive v-bind="$attrs">
    <slot />
  </TableRowPrimitive>
</template>
