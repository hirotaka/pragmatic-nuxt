<script setup lang="ts">
import TableElementPrimitive from "~~/components/ui/table/TableElement.vue";
</script>

<template>
  <TableElementPrimitive v-bind="$attrs">
    <slot />
  </TableElementPrimitive>
</template>
