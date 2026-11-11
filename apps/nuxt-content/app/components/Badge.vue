<script setup lang="ts">
import { Badge as UiBadge } from "~/components/ui/badge";

defineProps<{ label?: string }>();
</script>

<template>
  <UiBadge variant="secondary">
    <slot>{{ label }}</slot>
  </UiBadge>
</template>
