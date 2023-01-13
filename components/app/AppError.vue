<script setup lang="ts">
const onClick = () => {
  window.location.assign(window.location.origin);
};
</script>

<template>
  <div
    class="text-red-500 w-screen h-screen flex flex-col justify-center items-center"
    role="alert"
  >
    <h2 class="text-lg font-semibold">Ooops, something went wrong :(</h2>
    <BaseButton class="mt-4" @click="onClick">Refresh</BaseButton>
  </div>
</template>
