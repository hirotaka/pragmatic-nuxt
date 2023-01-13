<script setup lang="ts">
import Logo from '~/assets/img/logo.svg'
</script>

<template>
  <BaseLink class="flex items-center text-white" to="/main">
    <Logo class="h-4 w-auto" alt="Logo" />
    <span class="text-xl text-white font-semibold ml-2">Bulletproof Nuxt</span>
  </BaseLink>
</template>
