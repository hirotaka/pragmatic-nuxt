<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <AppContentWrapper title="Users">
    <div class="mt-4">
      <FeatureUserList />
    </div>
  </AppContentWrapper>
</template>
