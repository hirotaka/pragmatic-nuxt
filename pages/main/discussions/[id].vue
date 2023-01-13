<script setup lang="ts">
import { useRoute } from "vue-router";

const {
  params: { id },
} = useRoute();

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <AppContentWrapper>
    <FeatureDiscussionDetail :discussion-id="id" />
  </AppContentWrapper>
</template>
