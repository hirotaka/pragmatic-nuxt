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
  <LayoutsContentLayout title="Discussions">
    <div class="flex justify-end">
      <CreateDiscussion />
    </div>
    <div class="mt-4">
      <DiscussionsList />
    </div>
  </LayoutsContentLayout>
</template>
