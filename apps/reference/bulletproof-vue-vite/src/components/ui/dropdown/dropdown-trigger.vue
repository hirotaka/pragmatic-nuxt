<script setup lang="ts">
import { DropdownMenu as DropdownPrimitive } from 'reka-ui/namespaced'
</script>

<template>
  <DropdownPrimitive.Trigger>
    <slot></slot>
  </DropdownPrimitive.Trigger>
</template>
