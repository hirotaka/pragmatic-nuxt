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
  <LayoutsContentLayout
    title="Discussions"
    description="Create, update, and moderate team discussions."
  >
    <template #actions>
      <CreateDiscussion />
    </template>
    <DiscussionsList />
  </LayoutsContentLayout>
</template>
