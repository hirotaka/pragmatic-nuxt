<script setup lang="ts">
import TableBodyPrimitive from "~~/components/ui/table/TableBody.vue";
</script>

<template>
  <TableBodyPrimitive v-bind="$attrs">
    <slot />
  </TableBodyPrimitive>
</template>
