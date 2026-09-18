<script setup lang="ts">
definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useHead({
  title: "Discussions",
});
</script>

<template>
  <DiscussionsCollection />
</template>
