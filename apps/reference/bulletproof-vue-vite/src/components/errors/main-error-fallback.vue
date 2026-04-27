<script setup lang="ts">
import { Button } from '@/components/ui/button'

const handleRefresh = () => {
  window.location.assign(window.location.origin)
}
</script>

<template>
  <div
    class="flex h-screen w-screen flex-col items-center justify-center text-red-500"
    role="alert"
  >
    <h2 class="text-lg font-semibold">Ooops, something went wrong :(</h2>
    <Button class="mt-4" @click="handleRefresh"> Refresh </Button>
  </div>
</template>
