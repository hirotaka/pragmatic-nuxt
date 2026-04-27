<script setup lang="ts">
import type { NuxtLinkProps } from "#app";

defineProps<NuxtLinkProps>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="text-slate-600 hover:text-slate-900"
  >
    <slot />
  </NuxtLink>
</template>
