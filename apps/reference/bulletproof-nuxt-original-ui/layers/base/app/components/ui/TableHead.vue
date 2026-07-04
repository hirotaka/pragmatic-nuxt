<script setup lang="ts">
import TableHeadPrimitive from "~~/components/ui/table/TableHead.vue";
</script>

<template>
  <TableHeadPrimitive v-bind="$attrs">
    <slot />
  </TableHeadPrimitive>
</template>
