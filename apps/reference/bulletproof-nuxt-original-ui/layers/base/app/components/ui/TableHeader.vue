<script setup lang="ts">
import TableHeaderPrimitive from "~~/components/ui/table/TableHeader.vue";
</script>

<template>
  <TableHeaderPrimitive v-bind="$attrs">
    <slot />
  </TableHeaderPrimitive>
</template>
