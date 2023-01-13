<script setup lang="ts">
import { RouterLink } from "vue-router";

type BaseLinkProps = {
  to: string;
};

defineProps<BaseLinkProps>();
</script>

<template>
  <RouterLink :to="to" class="text-indigo-600 hover:text-indigo-900">
    <slot />
  </RouterLink>
</template>
