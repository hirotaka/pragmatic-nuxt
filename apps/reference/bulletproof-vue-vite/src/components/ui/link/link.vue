<script setup lang="ts">
import type { RouterLinkProps } from 'vue-router'

defineProps<RouterLinkProps>()
</script>

<template>
  <router-link :to="to" class="text-slate-600 hover:text-slate-900">
    <slot></slot>
  </router-link>
</template>
